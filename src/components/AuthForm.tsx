import React, { useState } from 'react';
import { Phone, ArrowRight, UserPlus } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { VoiceButton } from './VoiceButton';
import { useVoice } from '../hooks/useVoice';
import { AuthService } from '../services/authService';

interface AuthFormProps {
  language: string;
  onLogin: (phoneNo: string) => void;
  onSignup: () => void;
  isLoading: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ language, onLogin, onSignup, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [phoneNo, setPhoneNo] = useState('');
  const [error, setError] = useState('');
  const { isListening, isSpeaking, isSupported, startListening, speak, stopSpeaking } = useVoice(language);

  const handleVoiceInput = async () => {
    try {
      await speak('Please tell me your phone number');
      const transcript = await startListening();
      
      // Extract numbers from voice input
      const numbers = transcript.replace(/\D/g, '');
      if (numbers.length === 10) {
        setPhoneNo(numbers);
      } else {
        setPhoneNo(transcript);
      }
      
      await speak(`Got it: ${transcript}`);
    } catch (error) {
      console.error('Voice input error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phoneNo.trim().length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (activeTab === 'login') {
      // Check if user exists before sending OTP
      const userExists = await AuthService.checkUserExists(phoneNo);
      if (!userExists) {
        setError('Phone number not registered. Please sign up first.');
        return;
      }
      onLogin(phoneNo);
    } else {
      onSignup();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">BoliSeva</h1>
          <p className="text-gray-600">{getTranslation('voiceFirstAssistant', language)}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {(['login', 'signup'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getTranslation(tab, language)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Phone className="w-4 h-4 inline mr-2" />
              {getTranslation('phoneNumber', language)}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                    onStartListening={handleVoiceInput}
                    onStopSpeaking={stopSpeaking}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || phoneNo.length !== 10}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {activeTab === 'login' ? (
                  <>
                    {getTranslation('sendOtp', language)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    {getTranslation('signup', language)}
                    <UserPlus className="w-4 h-4 ml-2" />
                  </>
                )}
              </>
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