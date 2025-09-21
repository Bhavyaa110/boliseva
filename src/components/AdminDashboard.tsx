import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { LoanApplication } from '../types';
import { LoanService } from '../services/loanService';
import { getTranslation } from '../utils/translations';
import { format } from 'date-fns';

interface AdminDashboardProps {
  language: string;
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  onBack,
}) => {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingLoan, setProcessingLoan] = useState<string | null>(null);

  useEffect(() => {
    fetchAppliedLoans();
  }, []);

  const fetchAppliedLoans = async () => {
    try {
      setLoading(true);
      // Fetch loans with status 'applied'
      const appliedLoans = await LoanService.getLoansByStatus('applied');
      setLoans(appliedLoans);
    } catch (error) {
      console.error('Error fetching applied loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loanId: string) => {
    setProcessingLoan(loanId);
    const result = await LoanService.updateLoanStatus(loanId, 'approved');
    setProcessingLoan(null);

    if (result.success) {
      await fetchAppliedLoans();
      alert(language === 'hi' ? 'ऋण स्वीकृत किया गया!' : 'Loan approved!');
    } else {
      alert(language === 'hi' ? 'स्वीकृति विफल हुई!' : 'Approval failed!');
    }
  };

  const handleReject = async (loanId: string) => {
    setProcessingLoan(loanId);
    const result = await LoanService.updateLoanStatus(loanId, 'rejected');
    setProcessingLoan(null);

    if (result.success) {
      await fetchAppliedLoans();
      alert(language === 'hi' ? 'ऋण अस्वीकृत किया गया!' : 'Loan rejected!');
    } else {
      alert(language === 'hi' ? 'अस्वीकृति विफल हुई!' : 'Rejection failed!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'text-blue-600 bg-blue-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                {language === 'hi' ? 'बैंक प्रशासन' : 'Bank Administration'}
              </h1>
              <p className="text-gray-600">
                {language === 'hi' ? 'ऋण आवेदनों की समीक्षा करें' : 'Review loan applications'}
              </p>
            </div>
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              {language === 'hi' ? 'वापस जाएं' : 'Go Back'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {language === 'hi' ? 'लंबित ऋण आवेदन' : 'Pending Loan Applications'}
          </h2>

          {loans.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'hi' ? 'कोई लंबित आवेदन नहीं' : 'No pending applications'}
              </h3>
              <p className="text-gray-500">
                {language === 'hi' ? 'सभी ऋण आवेदन संसाधित हो चुके हैं' : 'All loan applications have been processed'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getTranslation(loan.type, language)} {getTranslation('loan', language)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {loan.status === 'applied' ? getTranslation('waitingApproval', language) : getTranslation(loan.status, language)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">{getTranslation('amount', language)}</p>
                          <p className="font-medium">₹{loan.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">{getTranslation('purpose', language)}</p>
                          <p className="font-medium">{loan.purpose}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">{getTranslation('applied', language)}</p>
                          <p className="font-medium">{format(loan.createdAt, 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p><strong>{getTranslation('monthlyIncome', language)}:</strong> ₹{loan.income.toLocaleString()}</p>
                        <p><strong>{getTranslation('employment', language)}:</strong> {loan.employment}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApprove(loan.id)}
                      disabled={processingLoan === loan.id}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processingLoan === loan.id ? (language === 'hi' ? 'प्रक्रिया...' : 'Processing...') : (language === 'hi' ? 'स्वीकृत करें' : 'Approve')}
                    </button>
                    <button
                      onClick={() => handleReject(loan.id)}
                      disabled={processingLoan === loan.id}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {processingLoan === loan.id ? (language === 'hi' ? 'प्रक्रिया...' : 'Processing...') : (language === 'hi' ? 'अस्वीकृत करें' : 'Reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
