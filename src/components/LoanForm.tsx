import React, { useState } from 'react';
import { ArrowLeft, FileText, DollarSign, Briefcase, Target } from 'lucide-react';
import { LoanApplication } from '../types';
import { LOAN_TYPES } from '../utils/constants';
import { getTranslation } from '../utils/translations';
import { VoiceButton } from './VoiceButton';
import { LanguageSwitch } from './LanguageSwitch';
import { useVoice } from '../hooks/useVoice';
import { LoanService } from '../services/loanService';

interface LoanFormProps {
  language: string;
  userId: string;
  onLanguageChange: (language: string) => void;
  onBack: () => void;
  onComplete: () => void;
  onDocumentVerification: () => void;
}

export const LoanForm: React.FC<LoanFormProps> = ({ 
  language, 
  userId, 
  onLanguageChange,
  onBack, 
  onComplete,
  onDocumentVerification 
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'personal' as LoanApplication['type'],
    amount: '',
    purpose: '',
    income: '',
    employment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isListening, isSpeaking, isSupported, startListening, speak, stopSpeaking } = useVoice(language);

  const handleVoiceInput = async (field: keyof typeof formData) => {
    try {
      await speak(`Please tell me your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      const transcript = await startListening();
      
      if (field === 'amount' || field === 'income') {
        // Extract numbers from voice input
        const numbers = transcript.match(/\d+/g);
        if (numbers) {
          setFormData(prev => ({ ...prev, [field]: numbers.join('') }));
        }
      } else {
        setFormData(prev => ({ ...prev, [field]: transcript }));
      }
      
      await speak(`Got it: ${transcript}`);
    } catch (error) {
      console.error('Voice input error:', error);
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await LoanService.submitApplication({
        userId,
        type: formData.type,
        amount: parseInt(formData.amount),
        purpose: formData.purpose,
        income: parseInt(formData.income),
        employment: formData.employment,
        documentsVerified: true, // Assuming documents are verified before reaching this step
      });
      
      if (result.success) {
        await speak('Your loan application has been submitted successfully! It is now waiting for bank approval.');
        onComplete();
      } else {
        setError(result.error || 'Failed to submit application');
        await speak('There was an error submitting your application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting loan:', error);
      setError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {getTranslation('loanType', language)}
              </h2>
              <p className="text-gray-600">Select the type of loan you need</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {LOAN_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData(prev => ({ ...prev, type: type.id as any }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{type.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ₹{type.minAmount.toLocaleString()} - ₹{type.maxAmount.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {getTranslation('loanAmount', language)}
              </h2>
              <p className="text-gray-600">How much do you need?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16 text-lg"
                  placeholder="50000"
                  min={LOAN_TYPES.find(t => t.id === formData.type)?.minAmount}
                  max={LOAN_TYPES.find(t => t.id === formData.type)?.maxAmount}
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
              
              {/* Quick amount buttons */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[25000, 50000, 100000, 200000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                    className="py-2 px-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    ₹{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {getTranslation('loanPurpose', language)}
              </h2>
              <p className="text-gray-600">What will you use this loan for?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <div className="relative">
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
                  placeholder="Describe the purpose of your loan..."
                  rows={4}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getTranslation('monthlyIncome', language)} (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.income}
                  onChange={(e) => setFormData(prev => ({ ...prev, income: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
                  placeholder="25000"
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {getTranslation('employment', language)}
              </h2>
              <p className="text-gray-600">Tell us about your employment</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Employment Type
              </label>
              <div className="space-y-3">
                {[
                  { value: 'salaried', label: 'Salaried Employee' },
                  { value: 'self_employed', label: 'Self Employed' },
                  { value: 'business', label: 'Business Owner' },
                  { value: 'farmer', label: 'Farmer' },
                  { value: 'daily_wage', label: 'Daily Wage Worker' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, employment: option.value }))}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      formData.employment === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {getTranslation('reviewApplication', language)}
              </h2>
              <p className="text-gray-600">Review your loan application details</p>
            </div>
        );
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">{getTranslation('loanType', language)}</p>
                    <p className="font-medium">{getTranslation(formData.type, language)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{getTranslation('amount', language)}</p>
                    <p className="font-medium">₹{parseInt(formData.amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{getTranslation('monthlyIncome', language)}</p>
                    <p className="font-medium">₹{parseInt(formData.income).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{getTranslation('employment', language)}</p>
                    <p className="font-medium">{formData.employment}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 text-sm">{getTranslation('purpose', language)}</p>
                  <p className="font-medium">{formData.purpose}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Estimated EMI:</strong> ₹{LoanService.calculateEMI(parseInt(formData.amount), 12, 12).toLocaleString()}/month
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  *Based on 12% interest rate for 12 months
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.type;
      case 2:
        return formData.amount && parseInt(formData.amount) > 0;
      case 3:
        return formData.purpose.trim() && formData.income && parseInt(formData.income) > 0;
      case 4:
        return formData.employment;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={step === 1 ? onBack : () => setStep(step - 1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {getTranslation('back', language)}
            </button>
          </div>
          <LanguageSwitch 
            currentLanguage={language}
            onLanguageChange={onLanguageChange}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="text-sm text-gray-500">
            {getTranslation('step', language)} {step} {getTranslation('of', language)} 5
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step === 5 && (
            <button
              onClick={onDocumentVerification}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {getTranslation('verifyDocuments', language)}
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!isStepValid() || isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center ml-auto"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {step === 5 ? getTranslation('submit', language) : getTranslation('next', language)}
              </>
            )}
          </button>
        </div>

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