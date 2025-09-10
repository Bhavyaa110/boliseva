import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { LANGUAGES } from '../utils/constants';
interface LanguageSwitchProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ currentLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onLanguageChange(language.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className="font-medium">{language.nativeName}</div>
                <div className="text-xs text-gray-500">{language.name}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};