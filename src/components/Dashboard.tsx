import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus,
  TrendingUp,
  Phone,
  MessageCircle,
  Wallet
} from 'lucide-react';
import { User, LoanApplication, EMI } from '../types';
import { getTranslation } from '../utils/translations';
import { LoanService } from '../services/loanService';
import { VoiceButton } from './VoiceButton';
import { useVoice } from '../hooks/useVoice';
import { format } from 'date-fns';

interface DashboardProps {
  user: User;
  language: string;
  onNewLoan: () => void;
  onOpenChat: () => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  language, 
  onNewLoan, 
  onOpenChat,
  onLogout 
}) => {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [emis, setEMIs] = useState<EMI[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'emis'>('overview');
  const { isListening, isSpeaking, isSupported, startListening, speak, stopSpeaking } = useVoice(language);

  useEffect(() => {
    const userLoans = LoanService.getLoansByUser(user.id);
    const userEMIs = LoanService.getEMIsByUser(user.id);
    setLoans(userLoans);
    setEMIs(userEMIs);
  }, [user.id]);

  const upcomingEMIs = emis.filter(emi => emi.status === 'pending').slice(0, 3);
  const overdueEMIs = emis.filter(emi => emi.status === 'overdue');

  const handleVoiceCommand = async () => {
    try {
      await speak('How can I help you today?');
      const command = await startListening();
      
      if (command.toLowerCase().includes('loan') || command.includes('ऋण')) {
        onNewLoan();
      } else if (command.toLowerCase().includes('emi') || command.toLowerCase().includes('payment')) {
        setActiveTab('emis');
      } else if (command.toLowerCase().includes('chat') || command.toLowerCase().includes('help')) {
        onOpenChat();
      } else {
        await speak('I can help you apply for a new loan, check your EMIs, or chat about your loans. What would you like to do?');
      }
    } catch (error) {
      console.error('Voice command error:', error);
    }
  };

  const payEMI = async (emiId: string) => {
    await LoanService.payEMI(emiId, 'UPI');
    const userEMIs = LoanService.getEMIsByUser(user.id);
    setEMIs(userEMIs);
    await speak('EMI payment successful!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">BoliSeva</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              {isSupported && (
                <VoiceButton
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  onStartListening={handleVoiceCommand}
                  onStopSpeaking={stopSpeaking}
                  size="md"
                />
              )}
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loans.filter(l => ['approved', 'disbursed'].includes(l.status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Next EMI</p>
                <p className="text-lg font-bold text-gray-900">
                  {upcomingEMIs.length > 0 ? `₹${upcomingEMIs[0].amount.toLocaleString()}` : 'None'}
                </p>
                {upcomingEMIs.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {format(upcomingEMIs[0].dueDate, 'MMM dd')}
                  </p>
                )}
              </div>
            </div>
          </div>

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
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="text-lg font-bold text-gray-900">
                  {overdueEMIs.length > 0 ? `${overdueEMIs.length} Overdue` : 'All Clear'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'loans', label: 'My Loans', icon: CreditCard },
                { id: 'emis', label: 'EMI Schedule', icon: Calendar },
              ].map(({ id, label, icon: Icon }) => (
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
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={onNewLoan}
                      className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                    >
                      <Plus className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-blue-900">Apply for Loan</p>
                    </button>
                    
                    <button
                      onClick={onOpenChat}
                      className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                    >
                      <MessageCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-900">Chat Assistant</p>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {loans.slice(0, 3).map((loan) => (
                      <div key={loan.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {loan.type.charAt(0).toUpperCase() + loan.type.slice(1)} Loan
                          </p>
                          <p className="text-sm text-gray-600">₹{loan.amount.toLocaleString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                      </div>
                    ))}
                    {loans.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No loan applications yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'loans' && (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">
                        {loan.type.charAt(0).toUpperCase() + loan.type.slice(1)} Loan
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium">₹{loan.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Applied</p>
                        <p className="font-medium">{format(loan.createdAt, 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{loan.purpose}</p>
                  </div>
                ))}
                {loans.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No loans yet</p>
                    <button
                      onClick={onNewLoan}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply for Your First Loan
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'emis' && (
              <div className="space-y-4">
                {emis.map((emi) => (
                  <div key={emi.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">₹{emi.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Due: {format(emi.dueDate, 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(emi.status)}`}>
                          {emi.status}
                        </span>
                        {emi.status === 'pending' && (
                          <button
                            onClick={() => payEMI(emi.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center"
                          >
                            <Wallet className="w-4 h-4 mr-1" />
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {emis.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No EMI schedule available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={onOpenChat}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Overdue Alert */}
        {overdueEMIs.length > 0 && (
          <div className="fixed bottom-20 right-6 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <div>
                <p className="font-medium">Payment Overdue</p>
                <p className="text-sm opacity-90">{overdueEMIs.length} EMI(s) pending</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};