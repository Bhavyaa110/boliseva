import React from 'react';
import { Globe } from 'lucide-react';
import { LANGUAGES } from '../utils/constants';
import { getTranslation } from '../utils/translations';

interface LanguageSelectorProps {
  onLanguageSelect: (language: string) => void;
  currentLanguage?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelect, currentLanguage = 'en' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getTranslation('selectLanguage', currentLanguage)}
          </h1>
          <p className="text-gray-600 text-sm">
            {getTranslation('languageDescription', currentLanguage)}
          </p>
        </div>

        <div className="space-y-3">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => onLanguageSelect(language.code)}
              className="w-full p-4 text-left rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{language.nativeName}</div>
                  <div className="text-sm text-gray-500">{language.name}</div>
                </div>
                {currentLanguage === language.code && (
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};