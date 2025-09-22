import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Mic,
} from 'lucide-react';
import { User, LoanApplication, EMI } from '../types';
import { getTranslation, formatDate } from '../utils/translations';
import { LoanService } from '../services/loanService';
import { LanguageSwitch } from './LanguageSwitch';
import { useVoice } from '../hooks/useVoice';

// Constants
const BOTPRESS_CONFIG = {
  injectUrl: 'https://cdn.botpress.cloud/webchat/v3.2/inject.js',
  botUrl: 'https://files.bpcontent.cloud/2025/09/10/05/20250910055332-N3GU1F6C.js'
};

const STATUS_COLORS = {
  approved: 'text-green-600 bg-green-100',
  disbursed: 'text-green-600 bg-green-100',
  paid: 'text-green-600 bg-green-100',
  pending: 'text-yellow-600 bg-yellow-100',
  under_review: 'text-yellow-600 bg-yellow-100',
  applied: 'text-yellow-600 bg-yellow-100',
  rejected: 'text-red-600 bg-red-100',
  overdue: 'text-red-600 bg-red-100',
  unpaid: 'text-blue-600 bg-blue-100',
  default: 'text-gray-600 bg-gray-100'
};

const STATUS_TRANSLATIONS = {
  applied: 'waitingApproval',
  approved: 'approved',
  rejected: 'rejected',
  disbursed: 'disbursed',
  completed: 'completed',
  paid: 'paid',
  unpaid: 'unpaid',
  overdue: 'overdue',
  pending: 'pending'
};

const TAB_CONFIG = [
  { id: 'overview', translationKey: 'overview', icon: TrendingUp },
  { id: 'loans', translationKey: 'myLoans', icon: CreditCard },
  { id: 'emis', translationKey: 'emiSchedule', icon: Calendar },
] as const;

interface DashboardProps {
  user: User;
  language: string;
  onLanguageChange: (language: string) => void;
  onNewLoan: () => void;
  onLogout: () => void;
  onStartVoiceChat: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  language,
  onLanguageChange,
  onNewLoan,
  onLogout,
  onStartVoiceChat,
}) => {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [emis, setEMIs] = useState<EMI[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'emis'>('overview');
  const { isSupported } = useVoice(language);
  
  // Use ref to prevent duplicate calls
  const isLoadingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // Memoized calculations
  const sortedEMIs = useMemo(() => 
    [...emis].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()), 
    [emis]
  );

  const upcomingEMIs = useMemo(() => 
    sortedEMIs.filter(emi => ['unpaid', 'overdue'].includes(emi.status)).slice(0, 3), 
    [sortedEMIs]
  );

  const overdueEMIs = useMemo(() => 
    sortedEMIs.filter(emi => emi.status === 'overdue'), 
    [sortedEMIs]
  );

  const activeLoansCount = useMemo(() => 
    loans.filter(l => ['approved', 'disbursed'].includes(l.status)).length,
    [loans]
  );

  // Utility functions
  const getStatusColor = useCallback((status: string) => 
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default,
    []
  );

  const getStatusTranslation = useCallback((status: string) => {
    const translationKey = STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] || status;
    return getTranslation(translationKey as any, language);
  }, [language]);

  const payEMI = useCallback(async (emiId: string) => {
    const result = await LoanService.payEMI(emiId);
    if (result.success) {
      const userEMIs = await LoanService.getEMIsByUser(user.id);
      setEMIs(userEMIs);
    }
  }, [user.id]);

  // Load Botpress scripts - only once
  const loadBotpressScripts = useCallback(() => {
    if (document.querySelector(`script[src="${BOTPRESS_CONFIG.injectUrl}"]`)) {
      return; // Already loaded
    }
    
    const injectScript = document.createElement('script');
    injectScript.src = BOTPRESS_CONFIG.injectUrl;
    injectScript.async = true;
    injectScript.onload = () => {
      if (!document.querySelector(`script[src="${BOTPRESS_CONFIG.botUrl}"]`)) {
        const botScript = document.createElement('script');
        botScript.src = BOTPRESS_CONFIG.botUrl;
        botScript.async = true;
        document.body.appendChild(botScript);
      }
    };
    injectScript.onerror = () => console.error('Failed to load Botpress inject script');
    document.body.appendChild(injectScript);
  }, []);

  // Fetch dashboard data - prevent duplicate calls
  const fetchData = useCallback(async () => {
    if (!user?.id || isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    
    try {
      console.log('Fetching data for user:', user.id);
      
      const userLoans = await LoanService.getLoansByUser(user.id);
      console.log('Fetched loans:', userLoans.length);

      const approvedLoans = userLoans.filter(loan => loan.status === 'approved');
      if (approvedLoans.length > 0) {
        console.log(`Found ${approvedLoans.length} approved loans, checking for missing EMIs...`);
        const result = await LoanService.generateMissingEMIs(user.id);
        if (result.generated > 0) {
          console.log(`Generated ${result.generated} missing EMI schedules`);
        }
      }

      // Only call updateOverdueEMIs if it exists
      if (LoanService.updateOverdueEMIs) {
        await LoanService.updateOverdueEMIs();
      }

      const userEMIs = await LoanService.getEMIsByUser(user.id);
      console.log('Fetched EMIs:', userEMIs.length);
      
      setLoans(userLoans);
      setEMIs(userEMIs);

      // Store in IndexedDB for offline access
      try {
        const { indexedDBManager } = await import('../utils/indexedDB');
        await Promise.all([
          indexedDBManager.storeLoans(user.id, userLoans),
          indexedDBManager.storeEMIs(user.id, userEMIs)
        ]);
      } catch (dbError) {
        console.warn('IndexedDB storage failed:', dbError);
      }

      // Check for EMI reminders
      const overdueEMIsForReminder = userEMIs.filter(emi =>
        ['unpaid', 'overdue'].includes(emi.status) &&
        emi.dueDate < new Date() &&
        !emi.reminderSent
      );

      if (overdueEMIsForReminder.length > 0) {        
        if (LoanService.sendEMIReminders) {
          await LoanService.sendEMIReminders();
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      try {
        const { indexedDBManager } = await import('../utils/indexedDB');
        const [cachedLoans, cachedEMIs] = await Promise.all([
          indexedDBManager.getLoans(user.id),
          indexedDBManager.getEMIs(user.id)
        ]);
        setLoans(cachedLoans);
        setEMIs(cachedEMIs);
      } catch (cacheError) {
        console.error('Failed to load cached data:', cacheError);
      }
    } finally {
      isLoadingRef.current = false;
      hasFetchedRef.current = true;
    }
  }, [user.id, language]); // Only depend on user.id and language

  // Separate effect for Botpress - only run once
  useEffect(() => {
    loadBotpressScripts();
  }, []); // Empty dependency array - run only once

  // Separate effect for data fetching
  useEffect(() => {
    if (user?.id && !hasFetchedRef.current) {
      fetchData();
    }
  }, [user?.id, fetchData]);

  // Reset fetch flag when user changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [user.id]);

  // Render components
  const renderQuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Active Loans */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">{getTranslation('activeLoans', language)}</p>
            <p className="text-2xl font-bold text-gray-900">{activeLoansCount}</p>
          </div>
        </div>
      </div>

      {/* Next EMI */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">{getTranslation('nextEmi', language)}</p>
            <p className="text-lg font-bold text-gray-900">
              {upcomingEMIs.length > 0 
                ? `₹${upcomingEMIs[0].amount.toLocaleString()}` 
                : (language === 'hi' ? 'कोई नहीं' : 'None')
              }
            </p>
            {upcomingEMIs.length > 0 && (
              <p className="text-xs text-gray-500">
                {formatDate(upcomingEMIs[0].dueDate, language, 'MMMM dd, yyyy')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${overdueEMIs.length > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
            {overdueEMIs.length > 0 ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">{getTranslation('paymentStatus', language)}</p>
            <p className="text-lg font-bold text-gray-900">
              {overdueEMIs.length > 0 
                ? `${overdueEMIs.length} ${getTranslation('overdue', language)}` 
                : (language === 'hi' ? 'कोई बकाया नहीं' : getTranslation('allClear', language))
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols gap-4">
              <div 
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer flex flex-col items-center justify-center"
                onClick={onNewLoan}
              >
                <p className="text-sm font-medium text-blue-900">
                  {getTranslation('applyForLoan', language)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {getTranslation('recentActivity', language)}
              </h3>
              <div className="space-y-3">
                {loans.slice(0, 3).map((loan) => (
                  <div key={loan.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {getTranslation(loan.type, language)} {getTranslation('loan', language)}
                      </p>
                      <p className="text-sm text-gray-600">₹{loan.amount.toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                      {getStatusTranslation(loan.status)}
                    </span>
                  </div>
                ))}
                {loans.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    {getTranslation('noLoansYet', language)}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'loans':
        return (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    {getTranslation(loan.type, language)} {getTranslation('loan', language)}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                    {getStatusTranslation(loan.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">{getTranslation('amount', language)}</p>
                    <p className="font-medium">₹{loan.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{getTranslation('applied', language)}</p>
                    <p className="font-medium">{formatDate(loan.createdAt, language, 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{loan.purpose}</p>
              </div>
            ))}
            {loans.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{getTranslation('noLoansYet', language)}</p>
                <button
                  onClick={onNewLoan}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {getTranslation('applyFirstLoan', language)}
                </button>
              </div>
            )}
          </div>
        );

      case 'emis':
        return (
          <div className="space-y-4">
            {sortedEMIs.map((emi) => (
              <div key={emi.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">₹{emi.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{getTranslation('due', language)}: {formatDate(emi.dueDate, language, 'MMMM dd, yyyy')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(emi.status)}`}>
                      {getStatusTranslation(emi.status)}
                    </span>
                    {(emi.status === 'unpaid' || emi.status === 'overdue') && (
                      <button
                        onClick={() => payEMI(emi.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Wallet className="w-4 h-4 mr-1" />
                        {getTranslation('payNow', language)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {sortedEMIs.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{getTranslation('noEmiSchedule', language)}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                {language === 'hi' ? 'बोलीसेवा' : 'BoliSeva'}
              </h1>
              <p className="text-gray-600">
                {language === 'hi'
                  ? `वापस आपका स्वागत है, ${user.name}`
                  : `${getTranslation('welcomeBack', language)}, ${user.name}`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitch currentLanguage={language} onLanguageChange={onLanguageChange} />
              {isSupported && (
                <button
                  onClick={onStartVoiceChat}
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
              <div id="bp-web-widget" />
              <button onClick={onLogout} className="text-gray-600 hover:text-gray-900 text-sm">
                {getTranslation('logout', language)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 min-h-screen">
        {renderQuickStats()}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {TAB_CONFIG.map(({ id, translationKey, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {getTranslation(translationKey, language)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 min-h-[270px]">
            {renderTabContent()}
          </div>
        </div>

        {/* Overdue Alert
        {overdueEMIs.length > 0 && (
          <div className="fixed bottom-20 right-6 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <div>
                <p className="font-medium">{getTranslation('paymentOverdue', language)}</p>
                <p className="text-sm opacity-90">
                  {overdueEMIs.length} {getTranslation('emisPending', language)}
                </p>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};