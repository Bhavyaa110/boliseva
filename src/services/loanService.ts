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
      const { error } = await supabase
        .from('loans')
        .update({ status })
        .eq('loan_id', loanId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Only generate EMIs if status is approved and not already generated
      if (status === 'approved') {
        const { data: existingEmis } = await supabase
          .from('emis')
          .select('emi_id')
          .eq('loan_id', loanId);

        if (!existingEmis || existingEmis.length === 0) {
          await this.generateEMISchedule(loanId);
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  private static async generateEMISchedule(loanId: string): Promise<void> {
    try {
      // Get loan details
      const { data: loan } = await supabase
        .from('loans')
        .select('*')
        .eq('loan_id', loanId)
        .single();

      if (!loan) return;

      const principal = loan.amount;
      const tenure = loan.tenure || 12;
      const rate = loan.interest_rate || getInterestRate(loan.loan_type);
      const monthlyEMI = this.calculateEMI(principal, rate, tenure);

      const emisToInsert = [];
      let dueDate = new Date();
      for (let i = 0; i < tenure; i++) {
        dueDate.setMonth(dueDate.getMonth() + 1);
        emisToInsert.push({
          loan_id: loanId,
          amount: monthlyEMI,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'unpaid',
        });
      }
      await supabase.from('emis').insert(emisToInsert);
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
      if (!userId) return [];
      const { data, error } = await supabase
        .from('emis')
        .select(`
          *,
          loans!inner(user_id)
        `)
        .eq('loans.user_id', userId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching EMIs:', error);
        return [];
      }

      return data.map(emi => ({
        id: emi.emi_id,
        loanId: emi.loan_id,
        amount: emi.amount,
        dueDate: new Date(emi.due_date),
        status: emi.status as EMI['status'],
        paidDate: emi.paid_date ? new Date(emi.paid_date) : undefined,
        reminderSent: emi.reminder_sent,
      }));
    } catch (error) {
      console.error('Error fetching EMIs:', error);
      return [];
    }
  }

  static async payEMI(emiId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('emis')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
        })
        .eq('emi_id', emiId);

      if (error) {
        return { success: false, error: error.message };
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

        // In production, send actual notifications
        console.log(`Sent ${overdueEMIs.length} EMI reminders`);
      }
    } catch (error) {
      console.error('Error sending EMI reminders:', error);
    }
  }

  static async updateOverdueEMIs(): Promise<void> {
    // This stub can be expanded to mark EMIs as overdue if their due_date < today and status is unpaid.
    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('emis')
        .update({ status: 'overdue' })
        .eq('status', 'unpaid')
        .lt('due_date', today);
    } catch (error) {
      // Log error but don't throw
      console.error('Error updating overdue EMIs:', error);
    }
  }
}

function getInterestRate(type: string): number {
  switch (type) {
    case 'personal': return 10;
    case 'business': return 12;
    case 'agriculture': return 9;
    case 'education': return 8;
    default: return 12;
  }
}