export const LANGUAGES: Array<{
  code: string;
  name: string;
  nativeName: string;
  voiceCode: string;
}> = [
  { code: 'en', name: 'English', nativeName: 'English', voiceCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', voiceCode: 'hi-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', voiceCode: 'bn-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', voiceCode: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', voiceCode: 'ta-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', voiceCode: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', voiceCode: 'gu-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', voiceCode: 'kn-IN' },
];

export const LOAN_TYPES = [
  { id: 'personal', name: 'Personal Loan', minAmount: 10000, maxAmount: 500000 },
  { id: 'business', name: 'Business Loan', minAmount: 50000, maxAmount: 2000000 },
  { id: 'agriculture', name: 'Agriculture Loan', minAmount: 25000, maxAmount: 1000000 },
  { id: 'education', name: 'Education Loan', minAmount: 50000, maxAmount: 1500000 },
];

export const DOCUMENT_TYPES = [
  { id: 'aadhaar', name: 'Aadhaar Card', required: true },
  { id: 'pan', name: 'PAN Card', required: true },
  { id: 'income_proof', name: 'Income Proof', required: true },
  { id: 'bank_statement', name: 'Bank Statement', required: true },
  { id: 'photo', name: 'Passport Photo', required: true },
];