import React, { useState, useEffect } from 'react';
import { LanguageSelector } from './components/LanguageSelector';
import { AuthForm } from './components/AuthForm';
import { OTPVerification } from './components/OTPVerification';
import { Dashboard } from './components/Dashboard';
import { LoanForm } from './components/LoanForm';
import { VoiceChat } from './components/VoiceChat';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useAuth } from './hooks/useAuth';
import { useVoice } from './hooks/useVoice';
import { LocalStorage } from './utils/storage';
import { LoanApplication } from './types';

type AppState = 
  | 'language-selection'
  | 'auth'
  | 'otp-verification'
  | 'dashboard'
  | 'loan-form'
  | 'voice-chat';

function App() {
  const [appState, setAppState] = useState<AppState>('language-selection');
  const [language, setLanguage] = useState('en');
  const [otpData, setOtpData] = useState<any>(null);
  const { user, isLoading: authLoading, login, verifyOtp, logout, updateLanguage } = useAuth();
  const { speak } = useVoice(language);

  useEffect(() => {
    // Check for saved language
    const savedLanguage = LocalStorage.get<string>('boliseva_language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setAppState(user ? 'dashboard' : 'auth');
    }
  }, [user]);

  const handleLanguageSelect = async (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    updateLanguage(selectedLanguage);
    LocalStorage.set('boliseva_language', selectedLanguage);
    
    // Welcome message in selected language
    if (selectedLanguage === 'hi') {
      await speak('BoliSeva में आपका स्वागत है। आइए शुरू करते हैं।');
    } else {
      await speak('Welcome to BoliSeva. Let\'s get started.');
    }
    
    setAppState(user ? 'dashboard' : 'auth');
  };

  const handleLogin = async (identifier: string, type: 'phone' | 'aadhaar' | 'account') => {
    const result = await login(identifier, type);
    
    if (result.success && result.requiresOtp) {
      setOtpData({ identifier, type });
      setAppState('otp-verification');
    }
  };

  const handleOtpVerification = async (otp: string) => {
    const userData = {
      name: 'Demo User',
      phone: otpData.identifier,
      aadhaar: otpData.type === 'aadhaar' ? otpData.identifier : undefined,
      accountNumber: otpData.type === 'account' ? otpData.identifier : undefined,
      preferredLanguage: language,
    };

    const success = await verifyOtp(otp, userData);
    
    if (success) {
      await speak(language === 'hi' ? 'सफलतापूर्वक लॉगिन हो गए' : 'Successfully logged in');
      setAppState('dashboard');
    }
  };

  const handleLoanComplete = async (loan: LoanApplication) => {
    await speak(language === 'hi' ? 'आपका ऋण आवेदन सफलतापूर्वक जमा हो गया' : 'Your loan application has been submitted successfully');
    setAppState('dashboard');
  };

  const handleLogout = () => {
    logout();
    setAppState('auth');
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <OfflineIndicator />
      
      {appState === 'language-selection' && (
        <LanguageSelector
          onLanguageSelect={handleLanguageSelect}
          currentLanguage={language}
        />
      )}

      {appState === 'auth' && (
        <AuthForm
          language={language}
          onLogin={handleLogin}
          isLoading={authLoading}
        />
      )}

      {appState === 'otp-verification' && otpData && (
        <OTPVerification
          language={language}
          phoneNumber={otpData.identifier}
          onVerify={handleOtpVerification}
          onBack={() => setAppState('auth')}
          isLoading={authLoading}
        />
      )}

      {appState === 'dashboard' && user && (
        <Dashboard
          user={user}
          language={language}
          onNewLoan={() => setAppState('loan-form')}
          onOpenChat={() => setAppState('voice-chat')}
          onLogout={handleLogout}
        />
      )}

      {appState === 'loan-form' && user && (
        <LoanForm
          language={language}
          userId={user.id}
          onBack={() => setAppState('dashboard')}
          onComplete={handleLoanComplete}
        />
      )}

      {appState === 'voice-chat' && (
        <VoiceChat
          language={language}
          onLoanRequest={() => setAppState('loan-form')}
        />
      )}
    </>
  );
}

export default App;