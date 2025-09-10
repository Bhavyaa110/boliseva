import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, CreditCard, DollarSign, Briefcase, Target, IndianRupee } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { VoiceButton } from './VoiceButton';
import { useVoice } from '../hooks/useVoice';
import { LoanService } from '../services/loanService';
import { LOAN_TYPES } from '../utils/constants';

interface LoanFormProps {
  language: string;
  userId: string;
  onLanguageChange: (language: string) => void;
  onBack: () => void;
  onComplete: () => void;
  onDocumentVerification: () => void;
}

const LoanForm: React.FC<LoanFormProps> = ({
  language,
  userId,
  onBack,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    purpose: '',
    income: '',
    employment: '',
    tenure: '12',
  });
  const [calculatedEMI, setCalculatedEMI] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isListening, isSpeaking, isSupported, startListening, speak, stopSpeaking } = useVoice(language);

  const handleVoiceInput = async (field: keyof typeof formData) => {
    try {
      const fieldPrompts = {
        en: {
          type: 'What type of loan do you need? Personal, Business, Agriculture, or Education?',
          amount: 'How much loan amount do you need in rupees?',
          purpose: 'What is the purpose of this loan?',
          income: 'What is your monthly income in rupees?',
          employment: 'What is your employment type? Salaried, Self-employed, or Business?',
          tenure: 'For how many months do you want the loan?',
        },
        hi: {
          type: 'आपको किस प्रकार का ऋण चाहिए? व्यक्तिगत, व्यापारिक, कृषि, या शिक्षा?',
          amount: 'आपको कितनी ऋण राशि चाहिए रुपयों में?',
          purpose: 'इस ऋण का उद्देश्य क्या है?',
          income: 'आपकी मासिक आय कितनी है रुपयों में?',
          employment: 'आपका रोजगार प्रकार क्या है? वेतनभोगी, स्व-रोजगार, या व्यापार?',
          tenure: 'आप कितने महीनों के लिए ऋण चाहते हैं?',
        }
      };

      const prompts = fieldPrompts[language as keyof typeof fieldPrompts] || fieldPrompts.en;
      await speak(prompts[field]);
      const transcript = await startListening();
      
      if (field === 'amount' || field === 'income') {
        const numbers = transcript.replace(/[^\d]/g, '');
        setFormData(prev => ({ ...prev, [field]: numbers }));
      } else if (field === 'type') {
        const lowerTranscript = transcript.toLowerCase();
        if (lowerTranscript.includes('personal') || lowerTranscript.includes('व्यक्तिगत')) {
          setFormData(prev => ({ ...prev, type: 'personal' }));
        } else if (lowerTranscript.includes('business') || lowerTranscript.includes('व्यापारिक')) {
          setFormData(prev => ({ ...prev, type: 'business' }));
        } else if (lowerTranscript.includes('agriculture') || lowerTranscript.includes('कृषि')) {
          setFormData(prev => ({ ...prev, type: 'agriculture' }));
        } else if (lowerTranscript.includes('education') || lowerTranscript.includes('शिक्षा')) {
          setFormData(prev => ({ ...prev, type: 'education' }));
        } else {
          setFormData(prev => ({ ...prev, [field]: transcript }));
        }
      } else {
        setFormData(prev => ({ ...prev, [field]: transcript }));
      }
      
      const confirmationMessages = {
        en: `Got it: ${transcript}`,
        hi: `समझ गया: ${transcript}`
      };
      
      await speak(confirmationMessages[language as keyof typeof confirmationMessages] || confirmationMessages.en);
    } catch (error) {
      console.error('Voice input error:', error);
    }
  };

  const calculateEMI = () => {
    const principal = parseFloat(formData.amount);
    const tenure = parseInt(formData.tenure);
    const annualRate = getInterestRate(formData.type); // Get rate based on loan type
    
    if (principal && tenure && annualRate) {
      const monthlyRate = annualRate / (12 * 100);
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                  (Math.pow(1 + monthlyRate, tenure) - 1);
      setCalculatedEMI(Math.round(emi));
    }
  };

  const getInterestRate = (loanType: string): number => {
    switch (loanType) {
      case 'personal': return 10;
      case 'business': return 12;
      case 'agriculture': return 9;
      case 'education': return 8;
      default: return 12;
    }
  };

  // Auto-calculate EMI when amount, type, or tenure changes
  useEffect(() => {
    if (formData.amount && formData.type && formData.tenure) {
      calculateEMI();
    }
  }, [formData.amount, formData.type, formData.tenure]);
  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      console.log('Starting loan submission for user:', userId);
      
      if (!userId) {
        setError('User authentication required. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      const result = await LoanService.submitApplication({
        userId,
        type: formData.type,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        income: parseFloat(formData.income),
        employment: formData.employment,
        documentsVerified: true,
      });

      if (result.success) {
        const successMessages = {
          en: 'Your loan application has been submitted successfully!',
          hi: 'आपका ऋण आवेदन सफलतापूर्वक जमा हो गया है!'
        };
        await speak(successMessages[language as keyof typeof successMessages] || successMessages.en);
        onComplete();
      } else {
        console.error('Loan submission failed:', result.error);
        const errorMessage = result.error || 'Failed to submit loan application';
        setError(errorMessage);
        await speak(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Loan submission error:', error);
      const errorMessage = `Network error: ${error instanceof Error ? error.message : 'Please check your connection and try again.'}`;
      setError(errorMessage);
      await speak(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {getTranslation('back', language)}
          </button>
          <div className="text-sm text-gray-500">
            {getTranslation('step', language)} {currentStep} {getTranslation('of', language)} 3
          </div>
        </div>

        <div className="text-center mb-8">
          <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getTranslation('applyForLoan', language)}
          </h2>
          <p className="text-gray-600">
            {language === 'hi'
              ? '3 आसान चरणों में अपना ऋण आवेदन पूरा करें'
              : 'Complete your loan application in 3 simple steps'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Loan Type and Amount */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Target className="w-4 h-4 inline mr-2" />
                {getTranslation('loanType', language)}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {LOAN_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.type === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{getTranslation(type.id as 'personal' | 'business' | 'agriculture' | 'education', language)} {getTranslation('loan', language)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      ₹{type.minAmount.toLocaleString()} - ₹{type.maxAmount.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
              {isSupported && (
                <div className="mt-3 flex justify-center">
                  <VoiceButton
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    onStartListening={() => handleVoiceInput('type')}
                    onStopSpeaking={stopSpeaking}
                    size="sm"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <IndianRupee className="w-4 h-4 inline mr-2" />
                {getTranslation('loanAmount', language)}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter loan amount"
                  required
                />
                {isSupported && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <VoiceButton
                      isListening={isListening}
                      isSpeaking={isSpeaking}
                      onStartListening={() => handleVoiceInput('amount')}
                      onStopSpeaking={stopSpeaking}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {language === 'hi' ? 'ऋण अवधि (महीने)' : 'Loan Tenure (Months)'}
              </label>
              <select
                value={formData.tenure}
                onChange={(e) => setFormData(prev => ({ ...prev, tenure: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="6">{language === 'hi' ? '6 महीने' : '6 months'}</option>
                <option value="12">{language === 'hi' ? '12 महीने' : '12 months'}</option>
                <option value="18">{language === 'hi' ? '18 महीने' : '18 months'}</option>
                <option value="24">{language === 'hi' ? '24 महीने' : '24 months'}</option>
                <option value="36">{language === 'hi' ? '36 महीने' : '36 months'}</option>
                <option value="48">{language === 'hi' ? '48 महीने' : '48 months'}</option>
                <option value="60">{language === 'hi' ? '60 महीने' : '60 months'}</option>
              </select>
            </div>

            {/* EMI Calculator */}
            {formData.amount && formData.tenure && formData.type && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 flex items-center mb-4">
                  <Calculator className="w-4 h-4 mr-2" />
                  {language === 'hi' ? 'EMI कैलकुलेटर' : 'EMI Calculator'}
                </h3>
                <div className="text-center">
                  <p className="text-sm text-blue-700 mb-1">{language === 'hi' ? 'मासिक EMI' : 'Monthly EMI'}</p>
                  <p className="text-3xl font-bold text-blue-900 mb-2">
                    ₹{calculatedEMI ? calculatedEMI.toLocaleString() : '0'}
                  </p>
                  {calculatedEMI && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-600">{language === 'hi' ? 'मूलधन:' : 'Principal:'}</span>
                        <span className="font-medium">₹{parseInt(formData.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">{language === 'hi' ? 'कुल ब्याज:' : 'Total Interest:'}</span>
                        <span className="font-medium">₹{(calculatedEMI * parseInt(formData.tenure) - parseInt(formData.amount)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-blue-600">{language === 'hi' ? 'कुल राशि:' : 'Total Amount:'}</span>
                        <span className="font-bold">₹{(calculatedEMI * parseInt(formData.tenure)).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-blue-600 mt-2">
                        @ {getInterestRate(formData.type)}% {language === 'hi' ? 'वार्षिक ब्याज दर' : 'annual interest rate'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={nextStep}
              disabled={!formData.type || !formData.amount || !formData.tenure}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {getTranslation('next', language)}
            </button>
          </div>
        )}

        {/* Step 2: Purpose and Income */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Target className="w-4 h-4 inline mr-2" />
                {getTranslation('loanPurpose', language)}
              </label>
              <div className="relative">
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'hi' ? 'अपने ऋण का उद्देश्य लिखें' : 'Describe the purpose of your loan'}
                  rows={3}
                  required
                />
                {isSupported && (
                  <div className="absolute right-2 top-3">
                    <VoiceButton
                      isListening={isListening}
                      isSpeaking={isSpeaking}
                      onStartListening={() => handleVoiceInput('purpose')}
                      onStopSpeaking={stopSpeaking}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <DollarSign className="w-4 h-4 inline mr-2" />
                {getTranslation('monthlyIncome', language)}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.income}
                  onChange={(e) => setFormData(prev => ({ ...prev, income: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder={language === 'hi' ? 'अपनी मासिक आय दर्ज करें' : 'Enter your monthly income'}
                  required
                />
                {isSupported && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <VoiceButton
                      isListening={isListening}
                      isSpeaking={isSpeaking}
                      onStartListening={() => handleVoiceInput('income')}
                      onStopSpeaking={stopSpeaking}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Briefcase className="w-4 h-4 inline mr-2" />
                {getTranslation('employment', language)}
              </label>
              <select
                value={formData.employment}
                onChange={(e) => setFormData(prev => ({ ...prev, employment: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">{language === 'hi' ? 'रोजगार प्रकार चुनें' : 'Select employment type'}</option>
                <option value="salaried">{language === 'hi' ? 'वेतनभोगी' : 'Salaried'}</option>
                <option value="self_employed">{language === 'hi' ? 'स्व-रोजगार' : 'Self Employed'}</option>
                <option value="business">{language === 'hi' ? 'व्यवसायी' : 'Business Owner'}</option>
                <option value="farmer">{language === 'hi' ? 'किसान' : 'Farmer'}</option>
                <option value="daily_wage">{language === 'hi' ? 'दैनिक मजदूरी' : 'Daily Wage'}</option>
              </select>
              {isSupported && (
                <div className="mt-3 flex justify-center">
                  <VoiceButton
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    onStartListening={() => handleVoiceInput('employment')}
                    onStopSpeaking={stopSpeaking}
                    size="sm"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={prevStep}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                {getTranslation('back', language)}
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.purpose || !formData.income || !formData.employment}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {getTranslation('next', language)}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review and Submit */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {getTranslation('reviewApplication', language)}
            </h3>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{getTranslation('loanType', language)}</p>
                  <p className="font-medium">{getTranslation(formData.type as 'personal' | 'business' | 'agriculture' | 'education', language)} {getTranslation('loan', language)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{getTranslation('amount', language)}</p>
                  <p className="font-medium">₹{parseInt(formData.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{language === 'hi' ? 'अवधि' : 'Tenure'}</p>
                  <p className="font-medium">{formData.tenure} {language === 'hi' ? 'महीने' : 'months'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{getTranslation('monthlyIncome', language)}</p>
                  <p className="font-medium">₹{parseInt(formData.income).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{getTranslation('purpose', language)}</p>
                  <p className="font-medium">{formData.purpose}</p>
                </div>
              </div>
              
              {calculatedEMI && (
                <div className="border-t pt-4">
                  <div className="text-center bg-blue-100 rounded-lg p-4">
                    <p className="text-sm text-blue-700 mb-1">{language === 'hi' ? 'अनुमानित मासिक EMI' : 'Estimated Monthly EMI'}</p>
                    <p className="text-3xl font-bold text-blue-900">₹{calculatedEMI.toLocaleString()}</p>
                    <div className="space-y-1 text-sm mt-3">
                      <div className="flex justify-between">
                        <span className="text-blue-600">{language === 'hi' ? 'मूलधन:' : 'Principal:'}</span>
                        <span className="font-medium">₹{parseInt(formData.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">{language === 'hi' ? 'कुल ब्याज:' : 'Total Interest:'}</span>
                        <span className="font-medium">₹{(calculatedEMI * parseInt(formData.tenure) - parseInt(formData.amount)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-blue-600">{language === 'hi' ? 'कुल राशि:' : 'Total Amount:'}</span>
                        <span className="font-bold">₹{(calculatedEMI * parseInt(formData.tenure)).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-blue-600 mt-2">
                        @ {getInterestRate(formData.type)}% {language === 'hi' ? 'वार्षिक ब्याज दर' : 'annual interest rate'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={prevStep}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                {getTranslation('back', language)}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  getTranslation('submit', language)
                )}
              </button>
            </div>
          </div>
        )}

        {/* Voice Instructions */}
        {isSupported && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              🎤 {getTranslation('tapMicrophoneToFill', language)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanForm;