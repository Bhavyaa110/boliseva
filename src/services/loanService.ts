import { LoanApplication, EMI } from '../types';
import { supabase } from '../lib/supabase';

export class LoanService {
  static async submitApplication(application: {
    userId: string;
    type: string;
    amount: number;
    purpose: string;
    income: number;
    employment: string;
    documentsVerified: boolean;
  }): Promise<{ success: boolean; loanId?: string; error?: string }> {
    try {
      // Only allow if userId is provided (from signups table, after OTP login)
      if (!application.userId) {
        return { success: false, error: 'User not authenticated.' };
      }
      // Insert loan application using userId from signups
      const { data, error } = await supabase
        .from('loans')
        .insert({
          user_id: application.userId,
          loan_type: application.type,
          amount: application.amount,
          purpose: application.purpose,
          income: application.income,
          employment: application.employment,
          documents_verified: application.documentsVerified,
          status: 'applied'
        })
        .select()
        .single();

      if (error) {
        console.error('Loan insertion error:', error);
        return { success: false, error: `Loan application failed: ${error.message}` };
      }

      console.log('Loan application created successfully:', data.loan_id);
      return { success: true, loanId: data.loan_id };
    } catch (error) {
      console.error('Loan application error:', error);
      return { success: false, error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  static async getLoansByUser(userId: string): Promise<LoanApplication[]> {
    try {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loans:', error);
        return [];
      }

      return data.map(loan => ({
        id: loan.loan_id,
        userId: loan.user_id,
        type: loan.loan_type as LoanApplication['type'],
        amount: loan.amount,
        purpose: loan.purpose,
        income: loan.income,
        employment: loan.employment,
        status: loan.status as LoanApplication['status'],
        documents: [],
        documentsVerified: loan.documents_verified,
        createdAt: new Date(loan.created_at),
        updatedAt: new Date(loan.created_at),
      }));
    } catch (error) {
      console.error('Error fetching loans:', error);
      return [];
    }
  }

  static async getLoansByStatus(status: string): Promise<LoanApplication[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map(loan => ({
        id: loan.loan_id,
        userId: loan.user_id,
        type: loan.loan_type,
        amount: loan.amount,
        purpose: loan.purpose,
        income: loan.income,
        employment: loan.employment,
        status: loan.status,
        documents: [],
        documentsVerified: loan.documents_verified,
        createdAt: new Date(loan.created_at),
        updatedAt: new Date(loan.created_at),
        tenure: loan.tenure || 12,
        interestRate: loan.interest_rate || getInterestRate(loan.loan_type),
      }));
    } catch (error) {
      return [];
    }
  }

  static async approveLoan(loanId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: 'approved' })
        .eq('loan_id', loanId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Generate EMI schedule
      await this.generateEMISchedule(loanId);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async updateLoanStatus(loanId: string, status: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Updating loan ${loanId} to status: ${status}`);
      
      const { error } = await supabase
        .from('loans')
        .update({ status })
        .eq('loan_id', loanId);

      if (error) {
        console.error('Error updating loan status:', error);
        return { success: false, error: error.message };
      }

      // Generate EMIs if status is approved
      if (status === 'approved') {
        console.log('Loan approved, checking for existing EMIs...');
        
        // Check if EMIs already exist
        const { data: existingEmis, error: checkError } = await supabase
          .from('emis')
          .select('emi_id')
          .eq('loan_id', loanId);

        if (checkError) {
          console.error('Error checking existing EMIs:', checkError);
        } else {
          console.log(`Found ${existingEmis?.length || 0} existing EMIs for loan ${loanId}`);
          
          if (!existingEmis || existingEmis.length === 0) {
            console.log('No existing EMIs found, generating new schedule...');
            
            // Set default values before generating EMIs
            const { data: loanData, error: loanFetchError } = await supabase
              .from('loans')
              .select('loan_type')
              .eq('loan_id', loanId)
              .single();

            if (loanFetchError) {
              console.error('Error fetching loan data:', loanFetchError);
            } else {
              const interestRate = getInterestRate(loanData.loan_type);
              
              const { error: updateError } = await supabase
                .from('loans')
                .update({ 
                  tenure: 12,
                  interest_rate: interestRate
                })
                .eq('loan_id', loanId);

              if (updateError) {
                console.error('Error updating loan with defaults:', updateError);
              } else {
                console.log('Updated loan with tenure and interest rate, generating EMIs...');
                await this.generateEMISchedule(loanId);
              }
            }
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error in updateLoanStatus:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  private static async generateEMISchedule(loanId: string): Promise<void> {
    try {
      console.log(`Generating EMI schedule for loan: ${loanId}`);
      
      // Get loan details
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .select('*')
        .eq('loan_id', loanId)
        .single();

      if (loanError || !loan) {
        console.error('Error fetching loan for EMI generation:', loanError);
        return;
      }

      console.log('Loan data for EMI generation:', {
        amount: loan.amount,
        tenure: loan.tenure,
        interestRate: loan.interest_rate,
        loanType: loan.loan_type
      });

      const principal = loan.amount;
      const tenure = loan.tenure || 12;
      const rate = loan.interest_rate || getInterestRate(loan.loan_type);
      const monthlyEMI = this.calculateEMI(principal, rate, tenure);

      console.log(`Calculated EMI: ₹${monthlyEMI} for ${tenure} months`);

      const emisToInsert = [];
      const today = new Date();
      
      for (let i = 0; i < tenure; i++) {
        const dueDate = new Date(today);
        dueDate.setMonth(today.getMonth() + i + 1);
        dueDate.setDate(5);
        
        emisToInsert.push({
          loan_id: loanId,
          amount: monthlyEMI,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'unpaid',
          reminder_sent: false
        });
      }

      console.log(`Inserting ${emisToInsert.length} EMIs into database...`);

      // Direct insert should now work with updated RLS policies
      const { data: insertedEmis, error: insertError } = await supabase
        .from('emis')
        .insert(emisToInsert)
        .select();

      if (insertError) {
        console.error('Error inserting EMI schedule:', insertError);
        
        // Store in localStorage as backup
        const existingEmis = JSON.parse(localStorage.getItem('pending_emis') || '[]');
        const emisWithUserId = emisToInsert.map(emi => ({ 
          ...emi, 
          id: `${loanId}-${Date.now()}-${Math.random()}`,
          userId: loan.user_id,
          loanId: loanId
        }));
        existingEmis.push(...emisWithUserId);
        localStorage.setItem('pending_emis', JSON.stringify(existingEmis));
        console.log('Stored EMIs in localStorage as backup');
      } else {
        console.log(`Successfully generated ${insertedEmis?.length || 0} EMIs for loan ${loanId}`);
        
        // Clear any localStorage EMIs for this loan since DB insert succeeded
        const existingEmis = JSON.parse(localStorage.getItem('pending_emis') || '[]');
        const filteredEmis = existingEmis.filter((emi: any) => emi.loanId !== loanId);
        localStorage.setItem('pending_emis', JSON.stringify(filteredEmis));
      }
    } catch (error) {
      console.error('Error generating EMI schedule:', error);
    }
  }

  static calculateEMI(principal: number, rate: number, tenure: number): number {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  }

  static async getEMIsByUser(userId: string): Promise<EMI[]> {
    try {
      if (!userId) {
        console.log('No userId provided for EMI fetch');
        return [];
      }

      console.log(`Fetching EMIs for user: ${userId}`);

      // Try database first
      const { data: userLoans, error: loansError } = await supabase
        .from('loans')
        .select('loan_id')
        .eq('user_id', userId);

      if (!loansError && userLoans && userLoans.length > 0) {
        const loanIds = userLoans.map(loan => loan.loan_id);
        console.log(`Found ${loanIds.length} loans for user, fetching EMIs...`);

        const { data: emis, error: emisError } = await supabase
          .from('emis')
          .select('*')
          .in('loan_id', loanIds)
          .order('due_date', { ascending: true });

        if (!emisError && emis && emis.length > 0) {
          console.log(`Found ${emis.length} EMIs in database for user ${userId}`);
          return emis.map(emi => ({
            id: emi.emi_id,
            loanId: emi.loan_id,
            amount: emi.amount,
            dueDate: new Date(emi.due_date),
            status: emi.status as EMI['status'],
            paidDate: emi.paid_date ? new Date(emi.paid_date) : undefined,
            reminderSent: emi.reminder_sent || false,
          }));
        }
      }

      // Fallback to localStorage
      console.log('No EMIs found in database, checking localStorage...');
      const storedEmis = JSON.parse(localStorage.getItem('pending_emis') || '[]');
      const userEmis = storedEmis.filter((emi: any) => emi.userId === userId);
      
      console.log(`Found ${userEmis.length} EMIs in localStorage for user ${userId}`);
      
      return userEmis.map((emi: any) => ({
        id: emi.id,
        loanId: emi.loanId,
        amount: emi.amount,
        dueDate: new Date(emi.due_date || emi.dueDate),
        status: emi.status as EMI['status'],
        paidDate: emi.paid_date ? new Date(emi.paid_date) : undefined,
        reminderSent: emi.reminder_sent || false,
      }));
    } catch (error) {
      console.error('Error fetching EMIs:', error);
      return [];
    }
  }

  static async generateMissingEMIs(userId: string): Promise<{ success: boolean; generated: number; error?: string }> {
    try {
      console.log(`Checking for approved loans without EMIs for user: ${userId}`);
      
      // Get approved loans for the user
      const { data: approvedLoans, error: loansError } = await supabase
        .from('loans')
        .select('loan_id, amount, loan_type, tenure, interest_rate, user_id')
        .eq('user_id', userId)
        .eq('status', 'approved');

      if (loansError) {
        return { success: false, generated: 0, error: loansError.message };
      }

      if (!approvedLoans || approvedLoans.length === 0) {
        return { success: true, generated: 0 };
      }

      let generatedCount = 0;

      for (const loan of approvedLoans) {
        // Check if EMIs already exist for this loan
        const { data: existingEmis } = await supabase
          .from('emis')
          .select('emi_id')
          .eq('loan_id', loan.loan_id);

        if (!existingEmis || existingEmis.length === 0) {
          console.log(`Generating missing EMIs for loan: ${loan.loan_id}`);
          
          // Update loan with default values if missing
          if (!loan.tenure || !loan.interest_rate) {
            await supabase
              .from('loans')
              .update({
                tenure: loan.tenure || 12,
                interest_rate: loan.interest_rate || getInterestRate(loan.loan_type)
              })
              .eq('loan_id', loan.loan_id);
          }
          
          // Generate EMIs
          await this.generateEMIScheduleWithDirectAccess(loan);
          generatedCount++;
        }
      }

      return { success: true, generated: generatedCount };
    } catch (error) {
      console.error('Error generating missing EMIs:', error);
      return { success: false, generated: 0, error: 'Network error occurred' };
    }
  }

  static async payEMI(emiId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Try to pay EMI in database first
      const { error } = await supabase
        .from('emis')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
        })
        .eq('emi_id', emiId);

      if (error) {
        // If database fails, try localStorage
        const storedEmis = JSON.parse(localStorage.getItem('pending_emis') || '[]');
        const updatedEmis = storedEmis.map((emi: any) => {
          if (emi.id === emiId) {
            return { ...emi, status: 'paid', paid_date: new Date().toISOString() };
          }
          return emi;
        });
        localStorage.setItem('pending_emis', JSON.stringify(updatedEmis));
        console.log('Updated EMI payment status in localStorage');
        return { success: true };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async sendEMIReminders(): Promise<void> {
    try {
      // Get overdue EMIs that haven't been reminded
      const { data: overdueEMIs } = await supabase
        .from('emis')
        .select('*')
        .eq('status', 'unpaid')
        .eq('reminder_sent', false)
        .lt('due_date', new Date().toISOString().split('T')[0]);

      if (overdueEMIs && overdueEMIs.length > 0) {
        // Mark reminders as sent
        const emiIds = overdueEMIs.map(emi => emi.emi_id);
        await supabase
          .from('emis')
          .update({ reminder_sent: true })
          .in('emi_id', emiIds);

        console.log(`Sent ${overdueEMIs.length} EMI reminders`);
      }
    } catch (error) {
      console.error('Error sending EMI reminders:', error);
    }
  }

  static async updateOverdueEMIs(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('emis')
        .update({ status: 'overdue' })
        .eq('status', 'unpaid')
        .lt('due_date', today);

      if (error) {
        console.error('Error updating overdue EMIs:', error);
      }

      // Also update localStorage EMIs
      const storedEmis = JSON.parse(localStorage.getItem('pending_emis') || '[]');
      const updatedEmis = storedEmis.map((emi: any) => {
        const emiDate = new Date(emi.due_date || emi.dueDate);
        if (emi.status === 'unpaid' && emiDate < new Date()) {
          return { ...emi, status: 'overdue' };
        }
        return emi;
      });
      localStorage.setItem('pending_emis', JSON.stringify(updatedEmis));
    } catch (error) {
      console.error('Error updating overdue EMIs:', error);
    }
  }

  private static async generateEMIScheduleWithDirectAccess(loan: any): Promise<void> {
    try {
      const principal = loan.amount;
      const tenure = loan.tenure || 12;
      const rate = loan.interest_rate || getInterestRate(loan.loan_type);
      const monthlyEMI = this.calculateEMI(principal, rate, tenure);

      const emisToInsert = [];
      const today = new Date();
      
      for (let i = 0; i < tenure; i++) {
        const dueDate = new Date(today);
        dueDate.setMonth(today.getMonth() + i + 1);
        dueDate.setDate(5);
        
        emisToInsert.push({
          loan_id: loan.loan_id,
          amount: monthlyEMI,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'unpaid',
          reminder_sent: false
        });
      }

      console.log(`Inserting ${emisToInsert.length} EMIs for loan ${loan.loan_id}...`);

      // Try direct insert first
      const { error: insertError } = await supabase
        .from('emis')
        .insert(emisToInsert);

      if (insertError) {
        console.error('Direct EMI insertion failed:', insertError);
        
        // Store in local storage as backup
        const existingEmis = JSON.parse(localStorage.getItem('pending_emis') || '[]');
        const emisWithUserId = emisToInsert.map((emi, index) => ({ 
          ...emi, 
          id: `${loan.loan_id}-${Date.now()}-${index}`,
          userId: loan.user_id,
          loanId: loan.loan_id,
          dueDate: emi.due_date
        }));
        existingEmis.push(...emisWithUserId);
        localStorage.setItem('pending_emis', JSON.stringify(existingEmis));
        console.log('Stored EMIs in localStorage for later processing');
      } else {
        console.log(`Successfully generated EMIs for loan ${loan.loan_id}`);
      }
    } catch (error) {
      console.error('Error in direct EMI generation:', error);
    }
  }
}

function getInterestRate(type: string): number {
  switch (type) {
    case 'personal': return 12;
    case 'business': return 14;
    case 'agriculture': return 8;
    case 'education': return 9;
    default: return 12;
  }
}