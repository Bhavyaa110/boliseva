export const translations = {
  en: {
    // Common
    welcome: "Welcome to BoliSeva",
    continue: "Continue",
    back: "Back",
    next: "Next",
    submit: "Submit",
    cancel: "Cancel",
    loading: "Loading...",
    error: "Something went wrong",
    
    // Language Selection
    selectLanguage: "Select Your Preferred Language",
    languageDescription: "Choose the language you're most comfortable with. All interactions will be in this language.",
    
    // Auth
    login: "Login",
    signup: "Sign Up",
    loginTitle: "Welcome Back",
    signupTitle: "Create Account",
    enterDetails: "Enter your details to get started",
    accountNumber: "Account Number",
    phoneNumber: "Phone Number",
    aadhaarNumber: "Aadhaar Number",
    otpSent: "OTP sent to your phone",
    enterOtp: "Enter OTP",
    verify: "Verify",
    
    // Voice Assistant
    voiceAssistant: "Voice Assistant",
    tapToSpeak: "Tap to speak",
    listening: "Listening...",
    processing: "Processing...",
    speakYourRequest: "Speak your request or question",
    greeting: "Hello! I'm your loan assistant. How can I help you today?",
    
    // Loan Application
    applyForLoan: "Apply for Loan",
    loanType: "Loan Type",
    loanAmount: "Loan Amount",
    loanPurpose: "Purpose of Loan",
    monthlyIncome: "Monthly Income",
    employment: "Employment Type",
    
    // Dashboard
    dashboard: "Dashboard",
    myLoans: "My Loans",
    emiDue: "EMI Due",
    nextPayment: "Next Payment",
    loanStatus: "Loan Status",
    
    // Status
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    disbursed: "Disbursed",
    completed: "Completed",
    paid: "Paid",
    overdue: "Overdue",
  },
  hi: {
    // Common
    welcome: "BoliSeva में आपका स्वागत है",
    continue: "जारी रखें",
    back: "वापस",
    next: "आगे",
    submit: "जमा करें",
    cancel: "रद्द करें",
    loading: "लोड हो रहा है...",
    error: "कुछ गलत हुआ",
    
    // Language Selection
    selectLanguage: "अपनी पसंदीदा भाषा चुनें",
    languageDescription: "वह भाषा चुनें जिसमें आप सबसे सहज महसूस करते हैं। सभी बातचीत इसी भाषा में होगी।",
    
    // Auth
    login: "लॉगिन",
    signup: "साइन अप",
    loginTitle: "वापस आपका स्वागत है",
    signupTitle: "खाता बनाएं",
    enterDetails: "शुरू करने के लिए अपना विवरण दर्ज करें",
    accountNumber: "खाता संख्या",
    phoneNumber: "फोन नंबर",
    aadhaarNumber: "आधार नंबर",
    otpSent: "आपके फोन पर OTP भेजा गया",
    enterOtp: "OTP दर्ज करें",
    verify: "सत्यापित करें",
    
    // Voice Assistant
    voiceAssistant: "आवाज सहायक",
    tapToSpeak: "बोलने के लिए टैप करें",
    listening: "सुन रहा है...",
    processing: "प्रक्रिया में...",
    speakYourRequest: "अपना अनुरोध या प्रश्न बोलें",
    greeting: "नमस्ते! मैं आपका ऋण सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
    
    // Loan Application
    applyForLoan: "ऋण के लिए आवेदन करें",
    loanType: "ऋण प्रकार",
    loanAmount: "ऋण राशि",
    loanPurpose: "ऋण का उद्देश्य",
    monthlyIncome: "मासिक आय",
    employment: "रोजगार प्रकार",
    
    // Dashboard
    dashboard: "डैशबोर्ड",
    myLoans: "मेरे ऋण",
    emiDue: "EMI देय",
    nextPayment: "अगला भुगतान",
    loanStatus: "ऋण स्थिति",
    
    // Status
    pending: "लंबित",
    approved: "स्वीकृत",
    rejected: "अस्वीकृत",
    disbursed: "वितरित",
    completed: "पूर्ण",
    paid: "भुगतान किया गया",
    overdue: "अतिदेय",
  }
};

export type TranslationKey = keyof typeof translations.en;

export const getTranslation = (key: TranslationKey, language: string): string => {
  const lang = language as keyof typeof translations;
  return translations[lang]?.[key] || translations.en[key];
};