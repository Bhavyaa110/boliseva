import React, { useState, useEffect } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { getTranslation } from '../utils/translations';

interface OTPVerificationProps {
  language: string;
  phoneNumber: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  language,
  phoneNumber,
  onVerify,
  onBack,
  isLoading,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }

      // Auto-submit when all fields are filled
      if (newOtp.every(digit => digit !== '') && !isLoading) {
        onVerify(newOtp.join(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {getTranslation('back', language)}
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getTranslation('enterOtp', language)}
          </h1>
          <p className="text-gray-600 text-sm">
            {getTranslation('otpSent', language)}
          </p>
          <p className="text-blue-600 font-medium mt-1">+91 {phoneNumber}</p>
        </div>

        <div className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                maxLength={1}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center">
            {timer > 0 ? (
              <p className="text-gray-600 text-sm">
                Resend OTP in {timer}s
              </p>
            ) : (
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Resend OTP
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => onVerify(otp.join(''))}
            disabled={otp.some(digit => !digit) || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              getTranslation('verify', language)
            )}
          </button>
        </div>

        {/* Demo OTP Note */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-amber-800 text-xs text-center">
            📱 Demo: Use OTP "123456" for testing.
          </p>
        </div>
      </div>
    </div>
  );
};