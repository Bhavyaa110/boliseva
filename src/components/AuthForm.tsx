import React, { useState } from 'react';
import { Phone, CreditCard, Hash, ArrowRight } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { VoiceButton } from './VoiceButton';
import { useVoice } from '../hooks/useVoice';

interface AuthFormProps {
  language: string;
  onLogin: (identifier: string, type: 'phone' | 'aadhaar' | 'account') => void;
  isLoading: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ language, onLogin, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [authType, setAuthType] = useState<'phone' | 'aadhaar' | 'account'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const { isListening, isSpeaking, isSupported, startListening, speak, stopSpeaking } = useVoice(language);

  const handleVoiceInput = async (field: 'identifier' | 'name') => {
    try {
      const transcript = await startListening();
      if (field === 'identifier') {
        setIdentifier(transcript);
      } else {
        setName(transcript);
      }
      await speak(`Got it: ${transcript}`);
    } catch (error) {
      console.error('Voice input error:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier.trim()) {
      onLogin(identifier, authType);
    }
  };

  const authTypes = [
    { type: 'phone' as const, icon: Phone, label: getTranslation('phoneNumber', language), placeholder: '9876543210' },
    { type: 'aadhaar' as const, icon: Hash, label: getTranslation('aadhaarNumber', language), placeholder: '123456789012' },
    { type: 'account' as const, icon: CreditCard, label: getTranslation('accountNumber', language), placeholder: 'ACC123456789' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">BoliSeva</h1>
          <p className="text-gray-600">India's Voice-First Loan Assistant</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field for signup */}
          {activeTab === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
          )}

          {/* Auth Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {getTranslation('enterDetails', language)}
            </label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {authTypes.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAuthType(type)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    authType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Identifier Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {authTypes.find(t => t.type === authType)?.label}
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder={authTypes.find(t => t.type === authType)?.placeholder}
                required
              />
              {isSupported && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <VoiceButton
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    onStartListening={() => handleVoiceInput('identifier')}
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
            disabled={isLoading || !identifier.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {getTranslation('continue', language)}
                <ArrowRight className="w-4 h-4 ml-2" />
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