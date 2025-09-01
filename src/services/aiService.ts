export class AIService {
  static analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    // Simple sentiment analysis using keywords
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'अच्छा', 'खुश', 'संतुष्ट'];
    const negativeWords = ['bad', 'terrible', 'angry', 'frustrated', 'worried', 'बुरा', 'गुस्सा', 'परेशान'];
    
    const lowerText = text.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  static detectFraud(userData: any): { risk: 'low' | 'medium' | 'high'; reasons: string[] } {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for common fraud patterns
    if (userData.income && userData.loanAmount && userData.loanAmount > userData.income * 50) {
      reasons.push('Loan amount exceeds reasonable income ratio');
      riskScore += 30;
    }

    if (userData.phone && userData.phone.length !== 10) {
      reasons.push('Invalid phone number format');
      riskScore += 20;
    }

    if (userData.aadhaar && userData.aadhaar.length !== 12) {
      reasons.push('Invalid Aadhaar format');
      riskScore += 25;
    }

    // Determine risk level
    let risk: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 50) risk = 'high';
    else if (riskScore >= 25) risk = 'medium';

    return { risk, reasons };
  }

  static predictEMIRisk(userData: any): { risk: 'low' | 'medium' | 'high'; score: number } {
    let riskScore = 0;

    // Income to EMI ratio
    if (userData.income && userData.emiAmount) {
      const ratio = userData.emiAmount / userData.income;
      if (ratio > 0.5) riskScore += 40;
      else if (ratio > 0.3) riskScore += 20;
    }

    // Employment stability
    if (userData.employment === 'self_employed') riskScore += 15;
    if (userData.employment === 'daily_wage') riskScore += 25;

    // Loan amount relative to income
    if (userData.loanAmount && userData.income) {
      const multiple = userData.loanAmount / (userData.income * 12);
      if (multiple > 3) riskScore += 20;
      else if (multiple > 2) riskScore += 10;
    }

    let risk: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 60) risk = 'high';
    else if (riskScore >= 30) risk = 'medium';

    return { risk, score: riskScore };
  }

  static generateResponse(userInput: string, context: any, language: string): string {
    const responses = {
      en: {
        greeting: "Hello! I'm BoliSeva, your personal loan assistant. I can help you with loan applications, EMI management, and answer questions about financial products. How can I assist you today?",
        loanHelp: "I can help you with several loan-related services:\n\n1. Apply for Personal, Business, Agriculture, or Education loans\n2. Check your loan application status\n3. Manage your EMI payments and schedule\n4. Explain loan terms and interest rates\n5. Help with document verification\n\nWhat would you like to do?",
        loanTypes: "We offer four types of loans:\n\n• Personal Loan: ₹10,000 - ₹5,00,000 for personal expenses\n• Business Loan: ₹50,000 - ₹20,00,000 for business needs\n• Agriculture Loan: ₹25,000 - ₹10,00,000 for farming\n• Education Loan: ₹50,000 - ₹15,00,000 for studies\n\nWhich type interests you?",
        emiHelp: "EMI (Equated Monthly Installment) is a fixed payment you make every month to repay your loan. It includes both principal and interest. I can help you:\n\n• Check your EMI schedule\n• Make EMI payments\n• Set up payment reminders\n• Calculate EMI for different loan amounts\n\nWhat would you like to know?",
        eligibility: "Loan eligibility depends on several factors:\n\n• Monthly income (minimum ₹15,000)\n• Employment stability\n• Credit history\n• Age (21-65 years)\n• Document verification\n\nWould you like me to check your eligibility or help you apply?",
        interestRates: "Our current interest rates are:\n\n• Personal Loan: 10.5% - 18% per annum\n• Business Loan: 12% - 20% per annum\n• Agriculture Loan: 7% - 12% per annum\n• Education Loan: 8.5% - 15% per annum\n\nRates depend on your profile and loan amount. Would you like to apply?",
        documents: "For loan approval, you'll need:\n\n• Aadhaar Card (identity proof)\n• PAN Card (tax identification)\n• Bank statements (3 months)\n• Income proof (salary slips/ITR)\n• Address proof\n\nI can guide you through the verification process. Shall we start?",
        confusion: "I understand financial terms can be confusing. Let me break it down simply:\n\n• Loan = Money you borrow\n• Interest = Cost of borrowing\n• EMI = Monthly payment\n• Tenure = Repayment period\n\nWhat specific term would you like me to explain?",
        encouragement: "You're doing great! Applying for a loan is a big step, and I'm here to guide you through every part of the process. What would you like to know next?",
        default: "I'm here to help with all your loan and financial needs. You can ask me about:\n\n• Loan applications and types\n• EMI calculations and payments\n• Document requirements\n• Interest rates and eligibility\n• Payment schedules\n\nWhat would you like to know?",
      },
      hi: {
        greeting: "नमस्ते! मैं BoliSeva हूं, आपका व्यक्तिगत ऋण सहायक। मैं ऋण आवेदन, EMI प्रबंधन, और वित्तीय उत्पादों के बारे में सवालों के साथ आपकी मदद कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
        loanHelp: "मैं कई ऋण संबंधी सेवाओं में आपकी मदद कर सकता हूं:\n\n1. व्यक्तिगत, व्यापारिक, कृषि, या शिक्षा ऋण के लिए आवेदन\n2. आपके ऋण आवेदन की स्थिति जांचना\n3. आपकी EMI भुगतान और अनुसूची प्रबंधित करना\n4. ऋण शर्तों और ब्याज दरों की व्याख्या\n5. दस्तावेज सत्यापन में सहायता\n\nआप क्या करना चाहेंगे?",
        loanTypes: "हम चार प्रकार के ऋण प्रदान करते हैं:\n\n• व्यक्तिगत ऋण: ₹10,000 - ₹5,00,000 व्यक्तिगत खर्चों के लिए\n• व्यापारिक ऋण: ₹50,000 - ₹20,00,000 व्यापारिक आवश्यकताओं के लिए\n• कृषि ऋण: ₹25,000 - ₹10,00,000 खेती के लिए\n• शिक्षा ऋण: ₹50,000 - ₹15,00,000 पढ़ाई के लिए\n\nकौन सा प्रकार आपको दिलचस्प लगता है?",
        emiHelp: "EMI (समान मासिक किस्त) एक निश्चित भुगतान है जो आप अपने ऋण को चुकाने के लिए हर महीने करते हैं। इसमें मूलधन और ब्याज दोनों शामिल हैं। मैं आपकी मदद कर सकता हूं:\n\n• आपकी EMI अनुसूची जांचना\n• EMI भुगतान करना\n• भुगतान अनुस्मारक सेट करना\n• विभिन्न ऋण राशियों के लिए EMI की गणना\n\nआप क्या जानना चाहेंगे?",
        eligibility: "ऋण पात्रता कई कारकों पर निर्भर करती है:\n\n• मासिक आय (न्यूनतम ₹15,000)\n• रोजगार स्थिरता\n• क्रेडिट इतिहास\n• आयु (21-65 वर्ष)\n• दस्तावेज सत्यापन\n\nक्या आप चाहेंगे कि मैं आपकी पात्रता जांचूं या आवेदन में मदद करूं?",
        interestRates: "हमारी वर्तमान ब्याज दरें हैं:\n\n• व्यक्तिगत ऋण: 10.5% - 18% प्रति वर्ष\n• व्यापारिक ऋण: 12% - 20% प्रति वर्ष\n• कृषि ऋण: 7% - 12% प्रति वर्ष\n• शिक्षा ऋण: 8.5% - 15% प्रति वर्ष\n\nदरें आपकी प्रोफाइल और ऋण राशि पर निर्भर करती हैं। क्या आप आवेदन करना चाहेंगे?",
        documents: "ऋण अनुमोदन के लिए, आपको चाहिए:\n\n• आधार कार्ड (पहचान प्रमाण)\n• पैन कार्ड (कर पहचान)\n• बैंक स्टेटमेंट (3 महीने)\n• आय प्रमाण (वेतन पर्ची/ITR)\n• पता प्रमाण\n\nमैं सत्यापन प्रक्रिया में आपका मार्गदर्शन कर सकता हूं। क्या हम शुरू करें?",
        confusion: "मैं समझता हूं कि वित्तीय शब्द भ्रमित करने वाले हो सकते हैं। मुझे इसे सरल तरीके से समझाने दीजिए:\n\n• ऋण = आप जो पैसा उधार लेते हैं\n• ब्याज = उधार लेने की लागत\n• EMI = मासिक भुगतान\n• अवधि = चुकौती की अवधि\n\nकौन सा विशिष्ट शब्द आप चाहेंगे कि मैं समझाऊं?",
        encouragement: "आप बहुत अच्छा कर रहे हैं! ऋण के लिए आवेदन करना एक बड़ा कदम है, और मैं प्रक्रिया के हर हिस्से में आपका मार्गदर्शन करने के लिए यहां हूं। आप आगे क्या जानना चाहेंगे?",
        default: "मैं आपकी सभी ऋण और वित्तीय आवश्यकताओं में मदद के लिए यहां हूं। आप मुझसे पूछ सकते हैं:\n\n• ऋण आवेदन और प्रकार\n• EMI गणना और भुगतान\n• दस्तावेज आवश्यकताएं\n• ब्याज दरें और पात्रता\n• भुगतान अनुसूची\n\nआप क्या जानना चाहेंगे?",
      }
    };

    const langResponses = responses[language as keyof typeof responses] || responses.en;
    
    // Simple intent detection
    const input = userInput.toLowerCase();
    
    // Loan application intents
    if (input.includes('apply') || input.includes('new loan') || input.includes('आवेदन') || input.includes('नया ऋण')) {
      return langResponses.loanHelp;
    }
    
    // Loan types inquiry
    if (input.includes('types') || input.includes('kind') || input.includes('प्रकार') || input.includes('किस्म')) {
      return langResponses.loanTypes;
    }
    
    // EMI related queries
    if (input.includes('emi') || input.includes('payment') || input.includes('installment') || input.includes('किस्त') || input.includes('भुगतान')) {
      return langResponses.emiHelp;
    }
    
    // Eligibility queries
    if (input.includes('eligible') || input.includes('qualify') || input.includes('पात्र') || input.includes('योग्य')) {
      return langResponses.eligibility;
    }
    
    // Interest rate queries
    if (input.includes('interest') || input.includes('rate') || input.includes('ब्याज') || input.includes('दर')) {
      return langResponses.interestRates;
    }
    
    // Document queries
    if (input.includes('document') || input.includes('paper') || input.includes('दस्तावेज') || input.includes('कागज')) {
      return langResponses.documents;
    }
    
    // Greeting responses
    if (input.includes('hello') || input.includes('hi') || input.includes('नमस्ते')) {
      return langResponses.greeting;
    }
    
    // Confusion or help requests
    if (input.includes('confused') || input.includes('help') || input.includes('भ्रमित') || input.includes('मदद')) {
      return langResponses.confusion;
    }
    
    // Encouragement for users who seem hesitant
    if (input.includes('scared') || input.includes('worried') || input.includes('डरा') || input.includes('चिंतित')) {
      return langResponses.encouragement;
    }
    
    return langResponses.default;
  }
}