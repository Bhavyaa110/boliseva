import { useState, useEffect } from 'react';
import LanguageSelector from './components/LanguageSelector';
import { AuthForm } from './components/AuthForm';
import { SignupForm } from './components/SignupForm';
import { OTPVerification } from './components/OTPVerification';
import { DocumentVerification } from './components/DocumentVerification';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import LoanForm from './components/LoanForm';
import { OfflineIndicator } from './components/OfflineIndicator';
import { VoiceChat } from './components/VoiceChat';
import { useAuth } from './hooks/useAuth';
import { useVoice } from './hooks/useVoice';
import { LocalStorage } from './utils/storage';
import { DocumentService } from './services/documentService';

type AppState =
  | 'language-selection'
  | 'auth'
  | 'signup'
  | 'otp-verification'
  | 'document-verification'
  | 'dashboard'
  | 'loan-form'
  | 'admin'
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

    // Check for admin route
    if (window.location.pathname === '/admin' || "boliseva.vercel.app/admin") {
      setAppState('admin');
    }
  }, [user]);

  const setAppLanguage = (lang: string) => {
    setLanguage(lang);
    updateLanguage(lang);
    LocalStorage.set('boliseva_language', lang);
  };

  const handleLanguageSelect = async (selectedLanguage: string) => {
    setAppLanguage(selectedLanguage);
    if (selectedLanguage === 'hi') {
      await speak('बोलीसेवा में आपका स्वागत है। आइए शुरू करते हैं।');
    } else {
      await speak('Welcome to BoliSeva. Let\'s get started.');
    }
    setTimeout(() => {
      setAppState(user ? 'dashboard' : 'auth');
    }, 400);
  };

  const handleLanguageChange = setAppLanguage;

  const handleLogin = async (phoneNo: string) => {
    const result = await sendOTP(phoneNo);

    if (result.success) {
      setPhoneNumber(phoneNo);
      setAppState('otp-verification');
    } else {
      await speak(language === 'hi' ? (result.error === 'Login failed' ? 'लॉगिन विफल रहा' : result.error || 'लॉगिन विफल रहा') : result.error || 'Login failed');
    }
  };

  const handleSignupComplete = () => {
    setAppState('auth');
  };

  const handleOtpVerification = async (otp: string) => {
    const result = await verifyOtp(phoneNumber, otp);
    if (result.success) {
      await speak(language === 'hi' ? 'सफलतापूर्वक लॉगिन हो गए' : 'Successfully logged in');
      if ('user' in result && result.user && (result.user as { name?: string }).name) {
        console.log('User authenticated successfully:', (result.user as { name?: string }).name);
      }
      setTimeout(() => setAppState('dashboard'), 500);
    } else {
      setAppState('dashboard');
    }
  };

  const handleDocumentVerificationComplete = async (aadhaar: string, pan: string) => {
    if (user) {
      await DocumentService.uploadDocuments(user.id, aadhaar, pan);
    }
    setAppState('loan-form');
  };

  const handleLoanComplete = async () => {
    setAppState('dashboard');
  };

  const handleLogout = () => {
    logout();
    setPhoneNumber('');
    setAppState('auth');
  };

  // New function to navigate to voice chat
  const handleStartVoiceChat = () => {
    setAppState('voice-chat');
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
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
          onResend={sendOTP}
          onBack={() => setAppState('auth')}
          isLoading={authLoading}
        />
      )}

      {appState === 'document-verification' && user && (
        <DocumentVerification
          language={language}
          onBack={() => setAppState('dashboard')}
          onComplete={handleDocumentVerificationComplete}
          userId={user.id}
        />
      )}

      {appState === 'dashboard' && user && (
        <Dashboard
          user={user}
          language={language}
          onLanguageChange={handleLanguageChange}
          onNewLoan={() => setAppState('document-verification')}
          onLogout={handleLogout}
          onStartVoiceChat={handleStartVoiceChat}
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

      {appState === 'admin' && (
        <AdminDashboard
          language={language}
          onBack={() => setAppState('dashboard')}
        />
      )}

      {appState === 'voice-chat' && (
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