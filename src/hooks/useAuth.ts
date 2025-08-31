import { useState, useEffect } from 'react';
import { User } from '../types';
import { LocalStorage } from '../utils/storage';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = LocalStorage.get<User>('boliseva_user');
    setUser(savedUser);
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, type: 'phone' | 'aadhaar' | 'account'): Promise<{ success: boolean; requiresOtp?: boolean }> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock login logic
    if (identifier.length < 6) {
      setIsLoading(false);
      return { success: false };
    }

    setIsLoading(false);
    return { success: true, requiresOtp: true };
  };

  const verifyOtp = async (otp: string, userData: any): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otp === '123456') {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: userData.name || 'User',
        phone: userData.phone,
        aadhaar: userData.aadhaar,
        accountNumber: userData.accountNumber,
        preferredLanguage: userData.preferredLanguage || 'en',
        isVerified: true,
        createdAt: new Date(),
      };
      
      setUser(newUser);
      LocalStorage.set('boliseva_user', newUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
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
    login,
    verifyOtp,
    logout,
    updateLanguage,
  };
};