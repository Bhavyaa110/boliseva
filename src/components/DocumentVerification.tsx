import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { getTranslation, TranslationKey } from '../utils/translations';
import { VoiceButton } from './VoiceButton';
import { useVoice } from '../hooks/useVoice';
import { DocumentService } from '../services/documentService';

interface DocumentVerificationProps {
  language: string;
  onBack: () => void;
  onComplete: (aadhaar: string, pan: string) => void;
  userId: string;
}

export const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  language,
  onBack,
  onComplete,
  userId,
}) => {
  const [documents, setDocuments] = useState({ aadhaar: 'pending', pan: 'pending' });
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { isListening, isSpeaking, isSupported, startListening, speak, stopSpeaking } = useVoice(language);
  const t = (key: TranslationKey) => getTranslation(key, language);

  const handleVoiceInput = async (field: 'aadhaar' | 'pan') => {
    const prompts = {
      aadhaar: language === 'hi' ? 'कृपया अपना 12-अंकों का आधार नंबर बताएं' : 'Please tell me your 12-digit Aadhaar number',
      pan: language === 'hi' ? 'कृपया अपना 10-अक्षरों का पैन नंबर बताएं' : 'Please tell me your 10-character PAN number',
    };
    await speak(prompts[field]);
    const transcript = await startListening();
    if (field === 'aadhaar') setAadhaarNumber(transcript.replace(/\D/g, ''));
    else setPanNumber(transcript.toUpperCase().replace(/[^A-Z0-9]/g, ''));
    await speak(language === 'hi' ? `समझ गया: ${transcript}` : `Got it: ${transcript}`);
  };

  const verifyDocument = async (type: 'aadhaar' | 'pan') => {
    setIsVerifying(true);
    await new Promise(res => setTimeout(res, 1000));
    const isValid = type === 'aadhaar'
      ? await DocumentService.verifyAadhaar(aadhaarNumber)
      : await DocumentService.verifyPAN(panNumber);
    setDocuments(prev => ({ ...prev, [type]: isValid ? 'verified' : 'rejected' }));
    await speak(isValid
      ? (language === 'hi' ? `${type.toUpperCase()} सत्यापन सफल रहा` : `${type.toUpperCase()} verification successful`)
      : (language === 'hi' ? `${type.toUpperCase()} सत्यापन विफल रहा। कृपया अपने विवरण जांचें।` : `${type.toUpperCase()} verification failed. Please check your details.`)
    );
    setIsVerifying(false);
  };

  const handleComplete = async () => {
    if (documents.aadhaar === 'verified' && documents.pan === 'verified') {
      const result = await DocumentService.uploadDocuments(userId, aadhaarNumber, panNumber);
      if (result.success) onComplete(aadhaarNumber, panNumber);
      else alert('Failed to save documents: ' + result.error);
    }
  };

  const getStatusIcon = (status: string) =>
    status === 'verified' ? <CheckCircle2 className="w-5 h-5 text-green-600" />
    : status === 'rejected' ? <AlertCircle className="w-5 h-5 text-red-600" />
    : <FileText className="w-5 h-5 text-gray-400" />;

  const getStatusColor = (status: string) =>
    status === 'verified' ? 'border-green-200 bg-green-50'
    : status === 'rejected' ? 'border-red-200 bg-red-50'
    : 'border-gray-200 bg-white';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </button>
        </div>
        <div className="text-center mb-8">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('documentVerification')}</h2>
          <p className="text-gray-600">{t('verifyYourDocuments')}</p>
        </div>
        <div className="space-y-6">
          {/* Aadhaar Verification */}
          <div className={`border-2 rounded-lg p-4 ${getStatusColor(documents.aadhaar)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getStatusIcon(documents.aadhaar)}
                <span className="ml-2 font-medium">{t('aadhaarCard')}</span>
              </div>
              {documents.aadhaar === 'pending' && (
                <button
                  onClick={() => verifyDocument('aadhaar')}
                  disabled={!aadhaarNumber || aadhaarNumber.length !== 12 || isVerifying}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                >
                  {t('verify')}
                </button>
              )}
            </div>
            {documents.aadhaar === 'pending' && (
              <div className="relative">
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-sm"
                  placeholder="123456789012"
                  maxLength={12}
                />
                {isSupported && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <VoiceButton
                      isListening={isListening}
                      isSpeaking={isSpeaking}
                      onStartListening={() => handleVoiceInput('aadhaar')}
                      onStopSpeaking={stopSpeaking}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          {/* PAN Verification */}
          <div className={`border-2 rounded-lg p-4 ${getStatusColor(documents.pan)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getStatusIcon(documents.pan)}
                <span className="ml-2 font-medium">{t('panCard')}</span>
              </div>
              {documents.pan === 'pending' && (
                <button
                  onClick={() => verifyDocument('pan')}
                  disabled={!panNumber || panNumber.length !== 10 || isVerifying}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                >
                  {t('verify')}
                </button>
              )}
            </div>
            {documents.pan === 'pending' && (
              <div className="relative">
                <input
                  type="text"
                  value={panNumber}
                  onChange={e => setPanNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-sm"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                {isSupported && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <VoiceButton
                      isListening={isListening}
                      isSpeaking={isSpeaking}
                      onStartListening={() => handleVoiceInput('pan')}
                      onStopSpeaking={stopSpeaking}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Continue Button */}
        <button
          onClick={handleComplete}
          disabled={documents.aadhaar !== 'verified' || documents.pan !== 'verified'}
          className="w-full mt-8 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {t('continue')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
        {/* Loading Overlay */}
        {isVerifying && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">{t('verifyingDocuments')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};