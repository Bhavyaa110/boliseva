import React, { useState, useRef, useEffect } from 'react';
import { Send, VolumeX, ArrowLeft, Play } from 'lucide-react';
import { ChatMessage } from '../types';
import { getTranslation, TranslationKey } from '../utils/translations';
import { useVoice } from '../hooks/useVoice';
import { VoiceButton } from './VoiceButton';

// Global type declaration for Botpress Webchat
declare global {
  interface Window {
    botpressWebChat?: {
      sendText: (text: string) => void;
      onEvent: (callback: (event: any) => void, eventType: string) => void;
    };
  }
}

interface VoiceChatProps {
  language: string;
  onBack: () => void;
  onLoanRequest?: () => void;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({ language, onBack, onLoanRequest }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, isSpeaking, isSupported, startListening, speak, stopSpeaking } = useVoice(language);
  const t = React.useCallback((key: TranslationKey) => getTranslation(key, language), [language]);

  // Set up the Botpress event listener once when the component mounts
  useEffect(() => {
    // Initial greeting from the AI
    const initialMessage: ChatMessage = {
      id: '1',
      text: t('greeting'),
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages([initialMessage]);

    if (window.botpressWebChat) {
      // Listen for messages from the bot
      window.botpressWebChat.onEvent((event: any) => {
        if (event.type === 'message' && event.payload.from === 'bot') {
          const botResponse = event.payload.text;
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);

          // Speak the bot's response
          if (isSupported) {
            speak(botResponse);
          }
        }
      }, 'message');
    }
  }, [language, isSupported, speak]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePlayMessage = async (messageId: string, text: string) => {
    if (playingMessageId === messageId) {
      stopSpeaking();
      setPlayingMessageId(null);
    } else {
      setPlayingMessageId(messageId);
      await speak(text);
      setPlayingMessageId(null);
    }
  };

  const checkForLoanRequest = (text: string) => {
    const lowerText = text.toLowerCase();
    const hasLoanKeywords = lowerText.includes('loan') || 
                           lowerText.includes('apply') || 
                           text.includes('ऋण') || 
                           text.includes('आवेदन');
    
    if (hasLoanKeywords) {
      onLoanRequest?.();
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Check if user wants to apply for a loan
    checkForLoanRequest(text.trim());

    // Send the user's message to the Botpress bot
    if (window.botpressWebChat) {
      window.botpressWebChat.sendText(text.trim());
    } else {
      console.error('Botpress webchat client is not available.');
      const errorMessage = language === 'hi' 
        ? 'क्षमा करें, चैट सहायक उपलब्ध नहीं है।' 
        : 'Sorry, the chat assistant is not available.';
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMsg]);
      setIsTyping(false);
      
      if (isSupported) {
        await speak(errorMessage);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleVoiceInput = async () => {
    try {
      const transcript = await startListening();
      if (transcript) {
        await handleSendMessage(transcript);
      }
    } catch (error) {
      console.error('Voice input error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('voiceAssistant')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('speakYourRequest')}
            </p>
          </div>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-xs lg:max-w-md">
              <div
                className={`px-4 py-3 rounded-2xl cursor-pointer transition-all hover:shadow-md ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
                onClick={() => !message.isUser && handlePlayMessage(message.id, message.text)}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm flex-1">{message.text}</p>
                  {!message.isUser && isSupported && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayMessage(message.id, message.text);
                      }}
                      className={`ml-2 p-1 rounded-full transition-colors ${
                        playingMessageId === message.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.sentiment && message.isUser && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      message.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      message.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {message.sentiment}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening 
                ? t('listening') 
                : (language === 'hi' ? 'अपना संदेश लिखें...' : 'Type your message...')
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              disabled={isListening}
            />
          </div>
          
          {isSupported && (
            <VoiceButton
              isListening={isListening}
              isSpeaking={isSpeaking}
              onStartListening={handleVoiceInput}
              onStopSpeaking={stopSpeaking}
              size="md"
            />
          )}

          <button
            type="submit"
            disabled={!inputText.trim() || isListening}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};