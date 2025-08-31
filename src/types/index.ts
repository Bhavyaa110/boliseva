export interface User {
  id: string;
  name: string;
  phone: string;
  aadhaar?: string;
  accountNumber?: string;
  email?: string;
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
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed';
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
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
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: Date;
  paymentMethod?: string;
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