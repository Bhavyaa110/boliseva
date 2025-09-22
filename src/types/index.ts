export interface User {
  id: string;
  name: string;
  phone: string;
  dob: string;
  accountNumber?: string;
  ifscCode?: string;
  preferredLanguage: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface LoanApplication {
  id: string;
  userId: string;
  type: 'personal' | 'business' | 'agriculture' | 'education';
  amount: number;
  purpose: string;
  income: number;
  employment: string;
  status: 'applied' | 'pending' | 'approved' | 'rejected' | 'disbursed';
  documentsVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenure?: number;
  interestRate?: number;
}

export interface Document {
  id: string;
  type: 'aadhaar' | 'pan' | 'income_proof' | 'bank_statement' | 'photo';
  url: string;
  isVerified: boolean;
  verificationDate?: Date;
}

export interface EMI {
  id: string;
  loanId: string;
  amount: number;
  dueDate: Date;
  status: 'paid' | 'unpaid' | 'overdue';
  paidDate?: Date;
  reminderSent?: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  voiceCode: string;
}