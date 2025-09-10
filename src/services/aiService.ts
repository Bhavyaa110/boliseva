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

  static generateResponse(userInput: string, language: string): string {
    const responses = {
      en: {
        greeting: "Hello! I'm BoliSeva, your personal loan assistant. I understand the challenges of getting loans in rural India. I can help you with loan applications, EMI management, and answer all your financial questions in simple terms. How can I assist you today?",
        loanHelp: "I can help you with complete loan services:\n\n• Apply for Personal Loans (₹10K-₹5L) - for medical, wedding, home repairs\n• Business Loans (₹50K-₹20L) - for shop expansion, equipment\n• Agriculture Loans (₹25K-₹10L) - for seeds, fertilizers, equipment\n• Education Loans (₹50K-₹15L) - for children's studies\n• Check application status and get updates\n• Manage EMI payments and schedules\n• Get help with documents\n\nWhat do you need help with?",
        loanTypes: "We offer loans designed for your needs:\n\nPersonal Loan: ₹10,000 - ₹5,00,000\nFor medical bills, weddings, home repairs, emergencies\nBusiness Loan: ₹50,000 - ₹20,00,000\nFor shop expansion, buying equipment, inventory\nAgriculture Loan: ₹25,000 - ₹10,00,000\nFor seeds, fertilizers, farming equipment, land improvement\nEducation Loan: ₹50,000 - ₹15,00,000\nFor children's school fees, college, vocational training\nWhich one matches your need?",
        emiHelp: "EMI means Equal Monthly Installment - it's the fixed amount you pay every month to repay your loan. Think of it like paying rent, but for your loan.\n\nI can help you:\n• See when your next payment is due\n• Pay your EMI through UPI or bank transfer\n• Set up automatic reminders\n• Calculate how much EMI you'll pay for different loan amounts\n• Understand what happens if you miss a payment\n\nWhat EMI help do you need?",
        eligibility: "To get a loan approved, you need:\n\nMonthly income of at least ₹15,000\nSteady job or business for 6+ months\nAge between 21-65 years\nAadhaar and PAN cards\nBank account with 3 months statements\nDon't worry about credit score - we help people with no credit history too! Would you like me to check if you qualify or help you apply?",
        interestRates: "Our interest rates are competitive and fair:\n\nPersonal Loan: 10.5% - 18% yearly\nBusiness Loan: 12% - 20% yearly\nAgriculture Loan: 7% - 12% yearly (government subsidized)\nEducation Loan: 8.5% - 15% yearly\nYour exact rate depends on your income, loan amount, and repayment capacity. Higher income = lower interest rate. Ready to apply?",
        documents: "For loan approval, bring these documents:\n\nAadhaar Card (for identity)\nPAN Card (for tax records)\nBank passbook or statements (last 3 months)\nIncome proof (salary slip, business income, farm income)\nAddress proof (electricity bill, ration card)\nDon't worry if you don't have everything - I'll guide you step by step. Shall we start verification?",
        confusion: "I understand money matters can be confusing. Let me explain in simple terms:\n\nLoan = Money the bank gives you to use now\nInterest = Extra money you pay for borrowing (like rent for money)\nEMI = Monthly payment (same amount every month)\nTenure = How many months you'll pay back\nPrincipal = The original loan amount\nWhich term would you like me to explain more?",
        encouragement: "You're taking a smart step! Getting a loan can improve your life - whether it's for your family, business, or education. I'm here to make this process simple and stress-free. Many people like you have successfully gotten loans through BoliSeva. What would you like to know next?",
        status: "I can check your loan status right away. Your loan goes through these stages:\n\n1. Applied - We received your application\n2. Under Review - Bank is checking your documents\n3. Approved - Congratulations! Loan approved\n4. Disbursed - Money transferred to your account\nTell me your loan reference number or registered mobile number to check status.",
        prepayment: "Yes, you can pay off your loan early! Benefits:\n\nSave money on interest\nBecome debt-free faster\nImprove your credit score\nYou can pay extra amount anytime. Small prepayment charges may apply (usually 2-4% of outstanding amount). Want me to calculate how much you'll save?",
        tenure: "Loan tenure is how long you take to repay:\n\nShorter tenure (6-12 months): Higher EMI, less total interest\nLonger tenure (24-60 months): Lower EMI, more total interest\nExample: ₹1 lakh loan\n12 months: EMI ₹9,200, Total ₹1.1L\n24 months: EMI ₹4,700, Total ₹1.13L\nWhat loan amount are you thinking about?",
        latePayment: "If you miss EMI payment:\n\nLate fee charged (₹500-₹1000)\nCredit score gets affected\nBank may call you\nBut don't panic! Solutions:\nPay as soon as possible\nCall us to discuss payment plan\nWe can help restructure if needed\nHaving trouble with payments? Let's find a solution together.",
        creditScore: "Credit score is like a report card for your money habits:\n\n750+: Excellent (best rates)\n650-750: Good (normal rates)\n550-650: Fair (higher rates)\nBelow 550: Poor (may need guarantor)\nNo score? No problem! We help first-time borrowers build credit. Want tips to improve your score?",
        calculator: "I'll calculate your EMI right now! Just tell me:\n\n1. How much loan amount? (₹10,000 to ₹20,00,000)\n2. For how many months? (6 to 60 months)\n3. What type of loan? (Personal/Business/Agriculture/Education)\nI'll show you exact EMI, total interest, and total amount to pay.",
        support: "Need human help? Our team is ready:\n\nToll-free: 1800-123-456 (24/7)\nEmail: support@boliseva.com\nWhatsApp: +91-98765-43210\nVisit nearest branch\nOr keep chatting with me - I can solve most problems right here! What do you need help with?",
        tips: "Smart money tips for you:\n\nPay EMIs on time (builds good credit)\nDon't take multiple loans together\nSave 10% of income every month\nKeep emergency fund (3 months expenses)\nCheck credit report yearly (free)\nCompare interest rates before borrowing\nRead loan agreement carefully\nWhich tip would you like me to explain more?",
        default: "I'm your friendly loan assistant! I can help with:\n\nLoan Applications (Personal/Business/Agriculture/Education)\nEMI Calculations and Payments\nDocument Help and Verification\nInterest Rates and Eligibility Check\nPayment Schedules and Reminders\nLoan Advice and Tips\nJust tell me what you need - I'm here to help!",
      },
      hi: {
        greeting: "नमस्ते! मैं BoliSeva हूं, आपका व्यक्तिगत ऋण सहायक। मैं ग्रामीण भारत में ऋण की चुनौतियों को समझता हूं। मैं ऋण आवेदन, EMI प्रबंधन, और सभी वित्तीय सवालों में सरल भाषा में आपकी मदद कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
        loanHelp: "मैं पूरी ऋण सेवाओं में आपकी मदद कर सकता हूं:\n\n• व्यक्तिगत ऋण (₹10हज़ार-₹5लाख) - इलाज, शादी, घर की मरम्मत के लिए\n• व्यापारिक ऋण (₹50हज़ार-₹20लाख) - दुकान बढ़ाने, सामान खरीदने के लिए\n• कृषि ऋण (₹25हज़ार-₹10लाख) - बीज, खाद, उपकरण के लिए\n• शिक्षा ऋण (₹50हज़ार-₹15लाख) - बच्चों की पढ़ाई के लिए\n• आवेदन की स्थिति जांचना\n• EMI भुगतान और अनुसूची\n• दस्तावेज़ों में मदद\n\nआपको किस चीज़ में मदद चाहिए?",
        loanTypes: "हम आपकी ज़रूरतों के लिए ऋण देते हैं:\n\nव्यक्तिगत ऋण: ₹10,000 - ₹5,00,000\nइलाज, शादी, घर की मरम्मत, आपातकाल के लिए\nव्यापारिक ऋण: ₹50,000 - ₹20,00,000\nदुकान बढ़ाने, मशीन खरीदने, माल के लिए\nकृषि ऋण: ₹25,000 - ₹10,00,000\nबीज, खाद, खेती के उपकरण, ज़मीन सुधार के लिए\nशिक्षा ऋण: ₹50,000 - ₹15,00,000\nबच्चों की स्कूल फीस, कॉलेज, ट्रेनिंग के लिए\nकौन सा आपकी ज़रूरत के लिए सही है?",
        emiHelp: "EMI का मतलब है समान मासिक किस्त - यह वह निश्चित राशि है जो आप हर महीने अपना ऋण चुकाने के लिए देते हैं। इसे किराए की तरह समझें, लेकिन अपने ऋण के लिए।\n\nमैं आपकी मदद कर सकता हूं:\n• देखना कि अगला भुगतान कब है\n• UPI या बैंक ट्रांसफर से EMI भरना\n• अपने आप याद दिलाने का इंतज़ाम\n• अलग-अलग ऋण राशि के लिए EMI की गणना\n• समझना कि भुगतान छूटने पर क्या होता है\n\nEMI में कौन सी मदद चाहिए?",
        eligibility: "ऋण मंज़ूर होने के लिए आपको चाहिए:\n\nकम से कम ₹15,000 मासिक आय\n6+ महीने से स्थिर नौकरी या धंधा\n21-65 साल की उम्र\nआधार और पैन कार्ड\n3 महीने का बैंक स्टेटमेंट\nक्रेडिट स्कोर की चिंता न करें - हम बिना क्रेडिट हिस्ट्री वाले लोगों की भी मदद करते हैं! क्या मैं जांच दूं कि आप योग्य हैं या आवेदन में मदद करूं?",
        interestRates: "हमारी ब्याज दरें प्रतिस्पर्धी और उचित हैं:\n\nव्यक्तिगत ऋण: 10.5% - 18% सालाना\nव्यापारिक ऋण: 12% - 20% सालाना\nकृषि ऋण: 7% - 12% सालाना (सरकारी सब्सिडी)\nशिक्षा ऋण: 8.5% - 15% सालाना\nआपकी सटीक दर आपकी आय, ऋण राशि और चुकाने की क्षमता पर निर्भर करती है। ज्यादा आय = कम ब्याज दर। आवेदन करने के लिए तैयार हैं?",
        documents: "ऋण मंज़ूरी के लिए ये दस्तावेज़ लाएं:\n\nआधार कार्ड (पहचान के लिए)\nपैन कार्ड (टैक्स रिकॉर्ड के लिए)\nबैंक पासबुक या स्टेटमेंट (पिछले 3 महीने)\nआय का प्रमाण (सैलरी स्लिप, धंधे की आय, खेती की आय)\nपते का प्रमाण (बिजली बिल, राशन कार्ड)\nचिंता न करें अगर सब कुछ नहीं है - मैं कदम दर कदम मार्गदर्शन करूंगा। क्या सत्यापन शुरू करें?",
        confusion: "मैं समझता हूं कि पैसे के मामले भ्रमित करने वाले हो सकते हैं। मुझे सरल शब्दों में समझाने दीजिए:\n\nऋण = बैंक आपको अभी इस्तेमाल के लिए पैसा देता है\nब्याज = उधार लेने के लिए अतिरिक्त पैसा (पैसे का किराया जैसे)\nEMI = मासिक भुगतान (हर महीने समान राशि)\nअवधि = कितने महीने में वापस करेंगे\nमूलधन = असली ऋण राशि\nकौन सा शब्द आप चाहेंगे कि मैं और समझाऊं?",
        encouragement: "आप एक स्मार्ट कदम उठा रहे हैं! ऋण लेना आपकी ज़िंदगी सुधार सकता है - चाहे वो आपके परिवार, धंधे या पढ़ाई के लिए हो। मैं इस प्रक्रिया को आसान और तनाव-मुक्त बनाने के लिए यहां हूं। आपके जैसे कई लोगों ने BoliSeva के ज़रिए सफलतापूर्वक ऋण लिया है। आप आगे क्या जानना चाहेंगे?",
        status: "मैं तुरंत आपके ऋण की स्थिति जांच सकता हूं। आपका ऋण इन चरणों से गुज़रता है:\n\n1. आवेदन दिया - हमें आपका आवेदन मिल गया\n2. समीक्षा में - बैंक आपके दस्तावेज़ जांच रहा है\n3. मंज़ूर - बधाई! ऋण मंज़ूर हो गया\n4. वितरित - पैसा आपके खाते में भेज दिया\nस्थिति जांचने के लिए अपना ऋण संदर्भ नंबर या पंजीकृत मोबाइल नंबर बताएं।",
        prepayment: "हां, आप अपना ऋण जल्दी चुका सकते हैं! फायदे:\n\nब्याज में पैसा बचाएं\nजल्दी कर्ज़-मुक्त हो जाएं\nअपना क्रेडिट स्कोर सुधारें\nआप कभी भी अतिरिक्त राशि दे सकते हैं। छोटा सा प्री-पेमेंट चार्ज लग सकता है (आमतौर पर बकाया राशि का 2-4%)। क्या मैं गणना करूं कि आप कितना बचाएंगे?",
        tenure: "ऋण अवधि यानी आप कितने समय में वापस करेंगे:\n\nकम अवधि (6-12 महीने): ज्यादा EMI, कम कुल ब्याज\nलंबी अवधि (24-60 महीने): कम EMI, ज्यादा कुल ब्याज\nउदाहरण: ₹1 लाख ऋण\n12 महीने: EMI ₹9,200, कुल ₹1.1लाख\n24 महीने: EMI ₹4,700, कुल ₹1.13लाख\nआप कितनी ऋण राशि के बारे में सोच रहे हैं?",
        latePayment: "अगर EMI भुगतान छूट जाए:\n\nदेर से भुगतान शुल्क (₹500-₹1000)\nक्रेडिट स्कोर प्रभावित होता है\nबैंक फोन कर सकता है\nलेकिन घबराएं नहीं! समाधान:\nजितनी जल्दी हो सके भुगतान करें\nहमें कॉल करके भुगतान योजना पर चर्चा करें\nज़रूरत हो तो हम पुनर्गठन में मदद कर सकते हैं\nभुगतान में परेशानी हो रही है? आइए मिलकर समाधान खोजते हैं।",
        creditScore: "क्रेडिट स्कोर आपकी पैसे की आदतों का रिपोर्ट कार्ड है:\n\n750+: बेहतरीन (सबसे अच्छी दरें)\n650-750: अच्छा (सामान्य दरें)\n550-650: ठीक-ठाक (थोड़ी ज्यादा दरें)\n550 से कम: कमज़ोर (गारंटर की ज़रूरत हो सकती है)\nकोई स्कोर नहीं? कोई समस्या नहीं! हम पहली बार ऋण लेने वालों की क्रेडिट बनाने में मदद करते हैं। स्कोर सुधारने के तरीके जानना चाहेंगे?",
        calculator: "मैं अभी आपकी EMI की गणना करूंगा! बस बताएं:\n\n1. कितनी ऋण राशि? (₹10,000 से ₹20,00,000)\n2. कितने महीनों के लिए? (6 से 60 महीने)\n3. कौन सा ऋण? (व्यक्तिगत/व्यापारिक/कृषि/शिक्षा)\nमैं आपको सटीक EMI, कुल ब्याज, और कुल भुगतान राशि दिखाऊंगा।",
        support: "इंसानी मदद चाहिए? हमारी टीम तैयार है:\n\nटोल-फ्री: 1800-123-456 (24/7)\nईमेल: support@boliseva.com\nव्हाट्सऐप: +91-98765-43210\nनज़दीकी शाखा में जाएं\nया मेरे साथ बात करते रहें - मैं यहीं ज्यादातर समस्याएं हल कर सकता हूं! आपको किस चीज़ में मदद चाहिए?",
        tips: "आपके लिए स्मार्ट पैसे की सलाह:\n\nEMI समय पर भरें (अच्छा क्रेडिट बनता है)\nएक साथ कई ऋण न लें\nआय का 10% हर महीने बचाएं\nआपातकाल के लिए फंड रखें (3 महीने का खर्च)\nसाल में एक बार क्रेडिट रिपोर्ट देखें (मुफ्त)\nऋण लेने से पहले ब्याज दरों की तुलना करें\nऋण समझौता ध्यान से पढ़ें\nकौन सी सलाह के बारे में और जानना चाहेंगे?",
        default: "मैं आपका दोस्ताना ऋण सहायक हूं! मैं इनमें मदद कर सकता हूं:\n\nऋण आवेदन (व्यक्तिगत/व्यापारिक/कृषि/शिक्षा)\nEMI गणना और भुगतान\nदस्तावेज़ मदद और सत्यापन\nब्याज दरें और पात्रता जांच\nभुगतान अनुसूची और याददाश्त\nऋण सलाह और सुझाव\nबस बताएं आपको क्या चाहिए - मैं मदद के लिए यहां हूं!",
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

    // Loan status
    if (input.includes('status') || input.includes('balance') || input.includes('outstanding') || input.includes('शेष') || input.includes('स्थिति') || input.includes('बकाया')) {
      return langResponses.status;
    }

    // Prepayment / Foreclosure
    if (input.includes('prepay') || input.includes('foreclosure') || input.includes('early payment') || input.includes('अग्रिम') || input.includes('जल्दी')) {
      return langResponses.prepayment;
    }
    
    // Tenure queries
  if (input.includes('tenure') || input.includes('duration') || input.includes('months') || input.includes('years') || input.includes('अवधि') || input.includes('महीने') || input.includes('साल')) {
    return langResponses.tenure;
  }

  // Late payment / Default
  if (input.includes('late') || input.includes('missed') || input.includes('default') || input.includes('overdue') || input.includes('देरी') || input.includes('डिफॉल्ट')) {
    return langResponses.latePayment;
  }

  // Credit score queries
  if (input.includes('credit score') || input.includes('cibil') || input.includes('स्कोर') || input.includes('सिबिल')) {
    return langResponses.creditScore;
  }

  // EMI calculator
  if (input.includes('calculate') || input.includes('calculator') || input.includes('कैलकुलेटर') || input.includes('गणना')) {
    return langResponses.calculator;
  }

  // Contact support
  if (input.includes('contact') || input.includes('support') || input.includes('call') || input.includes('phone') || input.includes('नंबर') || input.includes('सहायता')) {
    return langResponses.support;
  }

  // Finance tips
  if (input.includes('tip') || input.includes('advice') || input.includes('save money') || input.includes('सुझाव') || input.includes('सलाह')) {
    return langResponses.tips;
  }
    
  return langResponses.default;
  }
}