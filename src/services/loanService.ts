import { LoanApplication, EMI } from '../types';
import { supabase } from '../lib/supabase';
import { AIService } from './aiService';

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
      // Set user context for RLS policies
      const { data: userData } = await supabase
        .from('signups')
        .select('phone_no')
        .eq('id', application.userId)
        .single();

      if (userData) {
        await supabase.rpc('set_user_context', { phone_no: userData.phone_no });
          phone_number: userData.phone_no 

      const { data, error } = await supabase
        .from('loans')
        .insert({
          loan_type: application.type,
          amount: application.amount,
          purpose: application.purpose,
          income: application.income,
          employment: application.employment,
          documents_verified: application.documentsVerified,
          phone_no: userData?.phone_no,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, loanId: data.loan_id };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async getLoansByUser(userId: string): Promise<LoanApplication[]> {
    try {
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

  private static async generateEMISchedule(loanId: string): Promise<void> {
    try {
      // Get loan details
      const { data: loan } = await supabase
        .from('loans')
        .select('amount')
        .eq('loan_id', loanId)
        .single();

      if (!loan) return;

      const monthlyEMI = this.calculateEMI(loan.amount, 12, 12); // 12% interest, 12 months
      const emisToInsert = [];
      
      for (let i = 0; i < 12; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        
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
}