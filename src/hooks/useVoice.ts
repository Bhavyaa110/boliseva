import { useState, useCallback, useEffect } from 'react';
import { VoiceService } from '../utils/voice';

export const useVoice = (language: string) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const voiceService = VoiceService.getInstance();

  useEffect(() => {
    setIsSupported(voiceService.isSupported());
    // Map app language to correct speech recognition language code
    let langCode = 'en-IN';
    if (language === 'hi') langCode = 'hi-IN';
    voiceService.setLanguage(langCode);
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
    // Map app language to correct speech synthesis language code
    let langCode = 'en-IN';
    if (language === 'hi') langCode = 'hi-IN';
    setIsSpeaking(true);
    try {
      await voiceService.speak(text, langCode);
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