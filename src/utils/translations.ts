import { format } from 'date-fns';

export const translations = {
  en: {
    // Common
    welcome: "BoliSeva",
    voiceFirstAssistant: "India's Voice-First Loan Assistant",
    continue: "Continue",
    back: "Back",
    next: "Next",
    submit: "Submit",
    cancel: "Cancel",
    loading: "Loading...",
    error: "Something went wrong",
    step: "Step",
    of: "of",
    amount: "Amount",
    applied: "Applied",
    purpose: "Purpose",
    logout: "Logout",
    welcomeBack: "Welcome back",
    payNow: "Pay Now",
    allClear: "All Clear",
    chat: "Chat",
    processing: "Processing...",
    
    // Language Selection
    selectLanguage: "Select Your Preferred Language",
    languageDescription: "Choose the language you're most comfortable with. All interactions will be in this language.",
    
    // Auth
    login: "Login",
    signup: "Sign Up",
    createAccount: "Create Account",
    loginTitle: "Welcome Back",
    signupTitle: "Create Account",
    enterDetails: "Enter your details to get started",
    accountNumber: "Account Number",
    phoneNumber: "Phone Number",
    aadhaarNumber: "Aadhaar Number",
    sendOtp: "Send OTP",
    otpSent: "OTP sent to your phone",
    enterOtp: "Enter OTP",
    verify: "Verify",
    
    // Voice Assistant
    voiceAssistant: "Bolibot",
    tapToSpeak: "Tap to speak",
    listening: "Listening...",
    speakYourRequest: "Speak your request or question",
    tapMicrophoneToFill: "Tap the microphone icon to fill fields with your voice",
    greeting: "Hello! I'm your loan assistant. How can I help you today?",
    chatAssistant: "Chat Assistant",
    
    // Loan Application
    applyForLoan: "Apply for Loan",
    applyFirstLoan: "Apply for Your First Loan",
    loanType: "Loan Type",
    loanAmount: "Loan Amount",
    loanPurpose: "Purpose of Loan",
    monthlyIncome: "Monthly Income",
    employment: "Employment Type",
    reviewApplication: "Review Application",
    verifyDocuments: "Verify Documents",
    documentVerification: "Document Verification",
    waitingApproval: "Waiting for Bank Approval",
    aadhaarCard: "Aadhaar Card",
    panCard: "PAN Card",
    verifyYourDocuments: "Verify your documents to proceed with loan application",
    verifyingDocuments: "Verifying documents...",
    
    // Loan Types
    personal: "Personal",
    business: "Business", 
    agriculture: "Agriculture",
    education: "Education",
    loan: "Loan",
    
    // Dashboard
    dashboard: "Dashboard",
    myLoans: "My Loans",
    overview: "Overview",
    emiSchedule: "EMI Schedule",
    quickActions: "Quick Actions",
    recentActivity: "Recent Activity",
    activeLoans: "Active Loans",
    nextEmi: "Next EMI",
    paymentStatus: "Payment Status",
    noLoansYet: "No loan applications yet",
    noEmiSchedule: "No EMI schedule available",
    paymentOverdue: "Payment Overdue",
    emisPending: "EMI(s) pending",
    emiDue: "EMI Due",
    nextPayment: "Next Payment",
    loanStatus: "Loan Status",
    emi: "EMI",
    due: "Due",
    
    // Status
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    disbursed: "Disbursed",
    completed: "Completed",
    paid: "Paid",
    unpaid: "Unpaid",
    overdue: "Overdue",
    under_review: "Under Review",
    fillField: "Please fill out this field.",
    
    // EMI Storage Messages
    emisStoredLocally: "EMI schedules stored locally",
    emisPendingSync: "EMI data will sync when database permissions are updated",
    localDataNotice: "Data shown from local storage",
    syncPending: "Sync Pending",
    offlineMode: "Offline Mode",
    dataStoredLocally: "Your EMI data is safely stored locally and will sync automatically when connection is restored.",
    localStorageInfo: "EMI schedules are temporarily stored in your browser's local storage",
    
    // Months (short)
    jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", may: "May", jun: "Jun",
    jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec",
    
    // Months (full)
    january: "January", february: "February", march: "March", april: "April",
    mayFull: "May", june: "June", july: "July", august: "August",
    september: "September", october: "October", november: "November", december: "December",
  },
  hi: {
    // Common
    welcome: "बोलीसेवा",
    voiceFirstAssistant: "भारत का आवाज-प्रथम ऋण सहायक",
    continue: "जारी रखें",
    back: "वापस",
    next: "आगे",
    submit: "जमा करें",
    cancel: "रद्द करें",
    loading: "लोड हो रहा है...",
    error: "कुछ गलत हुआ",
    step: "चरण",
    of: "का",
    amount: "राशि",
    applied: "आवेदन किया",
    purpose: "उद्देश्य",
    logout: "लॉगआउट",
    welcomeBack: "वापस आपका स्वागत है",
    payNow: "अभी भुगतान करें",
    allClear: "कोई बकाया नहीं",
    chat: "चैट",
    processing: "प्रक्रिया में...",
    
    // Language Selection
    selectLanguage: "अपनी पसंदीदा भाषा चुनें",
    languageDescription: "वह भाषा चुनें जिसमें आप सबसे सहज महसूस करते हैं। सभी बातचीत इसी भाषा में होगी।",
    
    // Auth
    login: "लॉगिन",
    signup: "साइन अप",
    createAccount: "खाता बनाएं",
    loginTitle: "वापस आपका स्वागत है",
    signupTitle: "खाता बनाएं",
    enterDetails: "शुरू करने के लिए अपना विवरण दर्ज करें",
    accountNumber: "खाता संख्या",
    phoneNumber: "फोन नंबर",
    aadhaarNumber: "आधार नंबर",
    sendOtp: "ओ.टी.पी भेजें",
    otpSent: "आपके फोन पर ओ.टी.पी भेजा गया",
    enterOtp: "ओ.टी.पी दर्ज करें",
    verify: "सत्यापित करें",
    
    // Voice Assistant
    voiceAssistant: "बोलिबॉट",
    tapToSpeak: "बोलने के लिए टैप करें",
    listening: "सुन रहा है...",
    speakYourRequest: "अपना अनुरोध या प्रश्न बोलें",
    tapMicrophoneToFill: "फील्ड भरने के लिए माइक्रोफोन आइकन पर टैप करें",
    greeting: "नमस्ते! मैं आपका ऋण सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
    chatAssistant: "चैट सहायक",
    
    // Loan Application
    applyForLoan: "ऋण के लिए आवेदन करें",
    applyFirstLoan: "अपने पहले ऋण के लिए आवेदन करें",
    loanType: "ऋण प्रकार",
    loanAmount: "ऋण राशि",
    loanPurpose: "ऋण का उद्देश्य",
    monthlyIncome: "मासिक आय",
    employment: "रोजगार प्रकार",
    reviewApplication: "आवेदन की समीक्षा करें",
    verifyDocuments: "दस्तावेज सत्यापित करें",
    documentVerification: "दस्तावेज सत्यापन",
    waitingApproval: "बैंक अनुमोदन की प्रतीक्षा में",
    aadhaarCard: "आधार कार्ड",
    panCard: "पैन कार्ड",
    verifyYourDocuments: "ऋण आवेदन के लिए अपने दस्तावेज़ सत्यापित करें",
    verifyingDocuments: "दस्तावेज़ सत्यापित किए जा रहे हैं...",
    
    // Loan Types
    personal: "व्यक्तिगत",
    business: "व्यापारिक",
    agriculture: "कृषि",
    education: "शिक्षा",
    loan: "ऋण",
    
    // Dashboard
    dashboard: "डैशबोर्ड",
    myLoans: "मेरे ऋण",
    overview: "अवलोकन",
    emiSchedule: "ईएमआई अनुसूची",
    quickActions: "त्वरित कार्य",
    recentActivity: "हाल की गतिविधि",
    activeLoans: "सक्रिय ऋण",
    nextEmi: "अगली ईएमआई",
    paymentStatus: "भुगतान स्थिति",
    noLoansYet: "अभी तक कोई ऋण आवेदन नहीं",
    noEmiSchedule: "कोई ईएमआई अनुसूची उपलब्ध नहीं",
    paymentOverdue: "भुगतान अतिदेय",
    emisPending: "ईएमआई लंबित",
    emiDue: "ईएमआई देय",
    nextPayment: "अगला भुगतान",
    loanStatus: "ऋण स्थिति",
    emi: "ईएमआई",
    due: "देय",
    
    // Status
    pending: "लंबित",
    approved: "स्वीकृत",
    rejected: "अस्वीकृत",
    disbursed: "वितरित",
    completed: "पूर्ण",
    paid: "भुगतान किया गया",
    unpaid: "अवैतनिक",
    overdue: "अतिदेय",
    under_review: "समीक्षा में",
    fillField: "कृपया यह स्थान भरें।",
    
    // EMI Storage Messages
    emisStoredLocally: "ईएमआई अनुसूची स्थानीय रूप से संग्रहीत",
    emisPendingSync: "डेटाबेस अनुमतियां अपडेट होने पर ईएमआई डेटा सिंक होगा",
    localDataNotice: "स्थानीय भंडारण से डेटा दिखाया गया",
    syncPending: "सिंक लंबित",
    offlineMode: "ऑफलाइन मोड",
    dataStoredLocally: "आपका ईएमआई डेटा सुरक्षित रूप से स्थानीय रूप से संग्रहीत है और कनेक्शन बहाल होने पर स्वचालित रूप से सिंक हो जाएगा।",
    localStorageInfo: "ईएमआई अनुसूची अस्थायी रूप से आपके ब्राउज़र के स्थानीय भंडारण में संग्रहीत है",
    
    // Months (short)
    jan: "जन", feb: "फर", mar: "मार", apr: "अप्र", may: "मई", jun: "जून",
    jul: "जुल", aug: "अग", sep: "सित", oct: "अक्ट", nov: "नव", dec: "दिस",
    
    // Months (full)
    january: "जनवरी", february: "फरवरी", march: "मार्च", april: "अप्रैल",
    mayFull: "मई", june: "जून", july: "जुलाई", august: "अगस्त",
    september: "सितंबर", october: "अक्टूबर", november: "नवंबर", december: "दिसंबर",
  }
};

export type TranslationKey = keyof typeof translations.en;

export const getTranslation = (key: TranslationKey, language: string): string => {
  const lang = translations[language as keyof typeof translations];
  return (lang && lang[key]) ? lang[key] : translations.en[key];
};

// Add function to format date based on language
export const formatDate = (date: Date, language: string, formatStr: string = 'MMM dd'): string => {
  if (language === 'hi') {
    const shortMonthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const fullMonthNames = ['january', 'february', 'march', 'april', 'mayFull', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const day = date.getDate();
    const year = date.getFullYear();
    
    if (formatStr === 'MMM dd') {
      const month = shortMonthNames[date.getMonth()];
      return `${getTranslation(month as any, language)} ${day}`;
    }
    if (formatStr === 'MMM dd, yyyy') {
      const month = shortMonthNames[date.getMonth()];
      return `${getTranslation(month as any, language)} ${day}, ${year}`;
    }
    if (formatStr === 'MMMM dd, yyyy' || formatStr === 'MMMMM dd') {
      const month = fullMonthNames[date.getMonth()];
      if (formatStr === 'MMMMM dd') {
        return `${getTranslation(month as any, language)} ${day}`;
      }
      return `${getTranslation(month as any, language)} ${day}, ${year}`;
    }
  }
  
  // Fallback to English formatting
  return format(date, formatStr);
};