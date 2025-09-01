import { useState, useEffect } from 'react';
import { User } from '../types';
import { LocalStorage } from '../utils/storage';
import { AuthService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = LocalStorage.get<User>('boliseva_user');
    setUser(savedUser);
    setIsLoading(false);
  }, []);

  const sendOTP = async (phoneNo: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const result = await AuthService.sendOTP(phoneNo);
    setIsLoading(false);
    return result;
  };

  const signup = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const result = await AuthService.signup(userData);
    setIsLoading(false);
    return result;
  };

  const verifyOtp = async (phoneNo: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const result = await AuthService.verifyOTP(phoneNo, otp);
    
    if (result.success && result.user) {
      setUser(result.user);
      LocalStorage.set('boliseva_user', result.user);
    }
    
    setIsLoading(false);
    return { success: result.success, error: result.error };
  };

  const logout = () => {
    setUser(null);
    LocalStorage.remove('boliseva_user');
  };

  const updateLanguage = (language: string) => {
    if (user) {
      const updatedUser = { ...user, preferredLanguage: language };
      setUser(updatedUser);
      LocalStorage.set('boliseva_user', updatedUser);
    }
  };

  return {
    user,
    isLoading,
    sendOTP,
    signup,
    verifyOtp,
    logout,
    updateLanguage,
  };
};