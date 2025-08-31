import { LoanApplication, EMI } from '../types';
import { LocalStorage, OfflineQueue } from '../utils/storage';
import { AIService } from './aiService';

export class LoanService {
  private static LOANS_KEY = 'boliseva_loans';
  private static EMIS_KEY = 'boliseva_emis';

  static async submitApplication(application: Partial<LoanApplication>): Promise<LoanApplication> {
    const newApplication: LoanApplication = {
      id: Math.random().toString(36).substr(2, 9),
      userId: application.userId!,
      type: application.type!,
      amount: application.amount!,
      purpose: application.purpose!,
      income: application.income!,
      employment: application.employment!,
      status: 'submitted',
      documents: application.documents || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check for fraud
    const fraudCheck = AIService.detectFraud(application);
    if (fraudCheck.risk === 'high') {
      newApplication.status = 'rejected';
    }

    // Save to local storage
    const loans = this.getAllLoans();
    loans.push(newApplication);
    LocalStorage.set(this.LOANS_KEY, loans);

    // Add to offline queue if not online
    if (!navigator.onLine) {
      OfflineQueue.addToQueue({
        type: 'submit_loan',
        data: newApplication,
      });
    }

    return newApplication;
  }

  static getAllLoans(): LoanApplication[] {
    return LocalStorage.get<LoanApplication[]>(this.LOANS_KEY) || [];
  }

  static getLoansByUser(userId: string): LoanApplication[] {
    return this.getAllLoans().filter(loan => loan.userId === userId);
  }

  static async approveLoan(loanId: string): Promise<void> {
    const loans = this.getAllLoans();
    const loanIndex = loans.findIndex(loan => loan.id === loanId);
    
    if (loanIndex !== -1) {
      loans[loanIndex].status = 'approved';
      loans[loanIndex].updatedAt = new Date();
      LocalStorage.set(this.LOANS_KEY, loans);
      
      // Generate EMI schedule
      this.generateEMISchedule(loans[loanIndex]);
    }
  }

  private static generateEMISchedule(loan: LoanApplication): void {
    const emis: EMI[] = [];
    const monthlyEMI = this.calculateEMI(loan.amount, 12, 12); // 12% interest, 12 months
    
    for (let i = 0; i < 12; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      
      emis.push({
        id: Math.random().toString(36).substr(2, 9),
        loanId: loan.id,
        amount: monthlyEMI,
        dueDate,
        status: 'pending',
      });
    }
    
    const existingEMIs = LocalStorage.get<EMI[]>(this.EMIS_KEY) || [];
    LocalStorage.set(this.EMIS_KEY, [...existingEMIs, ...emis]);
  }

  static calculateEMI(principal: number, rate: number, tenure: number): number {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  }

  static getEMIsByUser(userId: string): EMI[] {
    const allEMIs = LocalStorage.get<EMI[]>(this.EMIS_KEY) || [];
    const userLoans = this.getLoansByUser(userId);
    const userLoanIds = userLoans.map(loan => loan.id);
    
    return allEMIs.filter(emi => userLoanIds.includes(emi.loanId));
  }

  static async payEMI(emiId: string, paymentMethod: string): Promise<boolean> {
    const emis = LocalStorage.get<EMI[]>(this.EMIS_KEY) || [];
    const emiIndex = emis.findIndex(emi => emi.id === emiId);
    
    if (emiIndex !== -1) {
      emis[emiIndex].status = 'paid';
      emis[emiIndex].paidDate = new Date();
      emis[emiIndex].paymentMethod = paymentMethod;
      LocalStorage.set(this.EMIS_KEY, emis);
      return true;
    }
    
    return false;
  }
}