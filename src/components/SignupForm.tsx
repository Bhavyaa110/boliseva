import React, { useState } from 'react';
import { ArrowLeft, User, Calendar, CreditCard, Building, Phone } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { VoiceButton } from './VoiceButton';
import { useVoice } from '../hooks/useVoice';
import { AuthService } from '../services/authService';

interface SignupFormProps {
  language: string;
  onBack: () => void;
  onSignupComplete: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ language, onBack, onSignupComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    accNo: '',
    bankNo: '',
    ifscCode: '',
    phoneNo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isListening, isSpeaking, isSupported, startListening, speak, stopSpeaking } = useVoice(language);

  const handleVoiceInput = async (field: keyof typeof formData) => {
    try {
      const fieldPrompts = {
        name: 'Please tell me your full name',
        dob: 'Please tell me your date of birth in DD MM YYYY format',
        accNo: 'Please tell me your account number',
        bankNo: 'Please tell me your bank number',
        ifscCode: 'Please tell me your IFSC code',
        phoneNo: 'Please tell me your phone number',
      };

      await speak(fieldPrompts[field]);
      const transcript = await startListening();
      
      if (field === 'dob') {
        // Try to parse date from voice input
        const dateMatch = transcript.match(/(\d{1,2})\s*(\d{1,2})\s*(\d{4})/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          setFormData(prev => ({ ...prev, [field]: formattedDate }));
        } else {
          setFormData(prev => ({ ...prev, [field]: transcript }));
        }
      } else {
        setFormData(prev => ({ ...prev, [field]: transcript }));
      }
      
      await speak(`Got it: ${transcript}`);
    } catch (error) {
      console.error('Voice input error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await AuthService.signup(formData);
      
      if (result.success) {
        await speak('Account created successfully! Please login with your phone number.');
        onSignupComplete();
      } else {
        setError(result.error || 'Signup failed');
        await speak('There was an error creating your account. Please try again.');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {getTranslation('back', language)}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            {getTranslation('createAccount', language)}
          </h1>
          <p className="text-gray-600">Fill in your details to get started</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Enter your full name"
                required
              />
              {isSupported && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <VoiceButton
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    onStartListening={() => handleVoiceInput('name')}
                    onStopSpeaking={stopSpeaking}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                required
              />
              {isSupported && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <VoiceButton
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    onStartListening={() => handleVoiceInput('dob')}
                    onStopSpeaking={stopSpeaking}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Account Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.accNo}
                onChange={(e) => setFormData(prev => ({ ...prev, accNo: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Enter your account number"
                required
              />
              {isSupported && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <VoiceButton
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    onStartListening={() => handleVoiceInput('accNo')}
                    onStopSpeaking={stopSpeaking}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bank Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Bank Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.bankNo}
                onChange={(e) => setFormData(prev => ({ ...prev, bankNo: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Enter your bank number"
                required
              />
              {isSupported && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <VoiceButton
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    onStartListening={() => handleVoiceInput('bankNo')}
                    onStopSpeaking={stopSpeaking}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              IFSC Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="SBIN0001234"
                required
              />
              {isSupported && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <VoiceButton
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    onStartListening={() => handleVoiceInput('ifscCode')}
                    onStopSpeaking={stopSpeaking}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phoneNo}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNo: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="9876543210"
                maxLength={10}
                required
              />
              {isSupported && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <VoiceButton
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    onStartListening={() => handleVoiceInput('phoneNo')}
                    onStopSpeaking={stopSpeaking}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              getTranslation('createAccount', language)
            )}
          </button>
        </form>

        {/* Voice Instructions */}
        {isSupported && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              🎤 {getTranslation('speakYourRequest', language)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};