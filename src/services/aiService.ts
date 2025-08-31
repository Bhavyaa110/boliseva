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
        greeting: "Hello! I'm your loan assistant. How can I help you today?",
        loanHelp: "I can help you apply for a loan, check your application status, or manage your EMIs. What would you like to do?",
        confusion: "I understand this can be confusing. Let me explain it step by step.",
        encouragement: "You're doing great! Just a few more steps to complete your application.",
        default: "I'm here to help with all your loan needs. Please tell me what you'd like to do.",
      },
      hi: {
        greeting: "नमस्ते! मैं आपका ऋण सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        loanHelp: "मैं आपको ऋण के लिए आवेदन करने, आपके आवेदन की स्थिति जांचने या आपकी EMI प्रबंधित करने में मदद कर सकता हूं। आप क्या करना चाहेंगे?",
        confusion: "मैं समझता हूं कि यह भ्रमित करने वाला हो सकता है। मुझे इसे चरणबद्ध तरीके से समझाने दीजिए।",
        encouragement: "आप बहुत अच्छा कर रहे हैं! अपना आवेदन पूरा करने के लिए बस कुछ और कदम।",
        default: "मैं आपकी सभी ऋण आवश्यकताओं में मदद के लिए यहां हूं। कृपया बताएं कि आप क्या करना चाहते हैं।",
      }
    };

    const langResponses = responses[language as keyof typeof responses] || responses.en;
    
    // Simple intent detection
    const input = userInput.toLowerCase();
    
    if (input.includes('loan') || input.includes('apply') || input.includes('ऋण') || input.includes('आवेदन')) {
      return langResponses.loanHelp;
    }
    
    if (input.includes('hello') || input.includes('hi') || input.includes('नमस्ते')) {
      return langResponses.greeting;
    }
    
    if (input.includes('confused') || input.includes('help') || input.includes('भ्रमित') || input.includes('मदद')) {
      return langResponses.confusion;
    }
    
    return langResponses.default;
  }
}