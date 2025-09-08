import React, { useState, useEffect } from 'react';
import { LanguageSelector } from './components/LanguageSelector';
import { AuthForm } from './components/AuthForm';
import { SignupForm } from './components/SignupForm';
import { OTPVerification } from './components/OTPVerification';
import { DocumentVerification } from './components/DocumentVerification';
import { Dashboard } from './components/Dashboard';
import LoanForm from './components/LoanForm';
import { VoiceChat } from './components/VoiceChat';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useAuth } from './hooks/useAuth';
import { useVoice } from './hooks/useVoice';
import { LocalStorage } from './utils/storage';

type AppState = 
  | 'language-selection'
  | 'auth'
  | 'signup'
  | 'otp-verification'
  | 'document-verification'
  | 'dashboard'
  | 'loan-form'
  | 'voice-chat';

function App() {
  const [appState, setAppState] = useState<AppState>('language-selection');
  const [language, setLanguage] = useState('en');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { user, isLoading: authLoading, sendOTP, verifyOtp, logout, updateLanguage } = useAuth();
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

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    updateLanguage(newLanguage);
    LocalStorage.set('boliseva_language', newLanguage);
  };

  const handleLogin = async (phoneNo: string) => {
    const result = await sendOTP(phoneNo);
    
    if (result.success) {
      setPhoneNumber(phoneNo);
      setAppState('otp-verification');
    } else {
      await speak(result.error || 'Login failed');
    }
  };

  const handleSignupComplete = async () => {
    await speak('Account created successfully! Please login with your phone number.');
    setAppState('auth');
  };

  const handleOtpVerification = async (otp: string) => {
    const result = await verifyOtp(phoneNumber, otp);
    
    if (result.success) {
      await speak(language === 'hi' ? 'सफलतापूर्वक लॉगिन हो गए' : 'Successfully logged in');
      // Small delay to ensure user context is properly set
      setTimeout(() => {
        setAppState('dashboard');
      }, 500);
    } else {
      await speak(result.error || 'OTP verification failed');
    }
  };

  const handleDocumentVerificationComplete = () => {
    setAppState('loan-form');
  };

  const handleLoanComplete = async () => {
    await speak(language === 'hi' ? 'आपका ऋण आवेदन सफलतापूर्वक जमा हो गया' : 'Your loan application has been submitted successfully');
    setAppState('dashboard');
  };

  const handleLogout = () => {
    logout();
    setPhoneNumber('');
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
          onSignup={() => setAppState('signup')}
          isLoading={authLoading}
        />
      )}

      {appState === 'signup' && (
        <SignupForm
          language={language}
          onBack={() => setAppState('auth')}
          onSignupComplete={handleSignupComplete}
        />
      )}

      {appState === 'otp-verification' && phoneNumber && (
        <OTPVerification
          language={language}
          phoneNumber={phoneNumber}
          onVerify={handleOtpVerification}
          onBack={() => setAppState('auth')}
          isLoading={authLoading}
        />
      )}

      {appState === 'document-verification' && (
        <DocumentVerification
          language={language}
          onBack={() => setAppState('dashboard')}
          onComplete={handleDocumentVerificationComplete}
        />
      )}

      {appState === 'dashboard' && user && (
        <Dashboard
          user={user}
          language={language}
          onLanguageChange={handleLanguageChange}
          onNewLoan={() => setAppState('document-verification')}
          onOpenChat={() => setAppState('voice-chat')}
          onLogout={handleLogout}
        />
      )}

      {appState === 'loan-form' && user && (
        <LoanForm
          language={language}
          userId={user.id}
          onLanguageChange={handleLanguageChange}
          onBack={() => setAppState('dashboard')}
          onComplete={handleLoanComplete}
          onDocumentVerification={() => setAppState('document-verification')}
        />
      )}

      {appState === 'voice-chat' && user && (
        <VoiceChat
          language={language}
          onBack={() => setAppState('dashboard')}
          onLoanRequest={() => setAppState('loan-form')}
        />
      )}
    </>
  );
}

export default App;