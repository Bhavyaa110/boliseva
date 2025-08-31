import { useState, useCallback, useEffect } from 'react';
import { VoiceService } from '../utils/voice';

export const useVoice = (language: string) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const voiceService = VoiceService.getInstance();

  useEffect(() => {
    setIsSupported(voiceService.isSupported());
    voiceService.setLanguage(language);
  }, [language]);

  const startListening = useCallback(async (): Promise<string> => {
    if (!isSupported) {
      throw new Error('Voice recognition not supported');
    }

    setIsListening(true);
    try {
      const transcript = await voiceService.startListening();
      return transcript;
    } finally {
      setIsListening(false);
    }
  }, [isSupported]);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!isSupported) return;

    setIsSpeaking(true);
    try {
      await voiceService.speak(text, language);
    } finally {
      setIsSpeaking(false);
    }
  }, [isSupported, language]);

  const stopSpeaking = useCallback(() => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    isSupported,
    startListening,
    speak,
    stopSpeaking,
  };
};