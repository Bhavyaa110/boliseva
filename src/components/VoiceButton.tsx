import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopSpeaking: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isSpeaking,
  onStartListening,
  onStopSpeaking,
  disabled = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleClick = () => {
    if (isSpeaking) {
      onStopSpeaking();
    } else {
      onStartListening();
    }
  };

  let Icon;
  if (isListening) {
    Icon = <Mic className={`${iconSizes[size]} animate-pulse`} />;
  } else if (isSpeaking) {
    Icon = <Volume2 className={iconSizes[size]} />;
  } else {
    Icon = <MicOff className={iconSizes[size]} />;
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        ${isListening ? 'bg-red-500 animate-pulse' : isSpeaking ? 'bg-orange-500' : 'bg-blue-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        text-white 
        flex items-center justify-center 
        transition-all duration-200 
        shadow-lg
        focus:outline-none focus:ring-4 focus:ring-blue-300
      `}
    >
      {Icon}
    </button>
  );
};