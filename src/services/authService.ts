import { supabase } from '../lib/supabase';
import { User } from '../types';
import { SMSService } from '../utils/sms';
import { RateLimiter } from '../utils/rateLimiter';

// Simple AES encryption for demonstration (replace with secure method in production)
import CryptoJS from 'crypto-js';
const ENCRYPTION_KEY = 'your-secret-key';

function encryptField(value: string): string {
  return CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
}

export class AuthService {
  static async signup(userData: {
    name: string;
    dob: string;
    accNo: string;
    ifscCode: string;
    phoneNo: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Encrypt accNo and ifscCode before sending
      const encryptedAccNo = encryptField(userData.accNo);
      const encryptedIfscCode = encryptField(userData.ifscCode);

      const { error } = await supabase
        .from('signups')
        .insert({
          name: userData.name,
          dob: userData.dob,
          acc_no: encryptedAccNo,
          ifsc_code: encryptedIfscCode,
          phone_no: userData.phoneNo,
        });
      return { success: !error, error: error?.message };
    } catch {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async sendOTP(phoneNo: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user exists
      const { data: user } = await supabase
        .from('signups')
        .select('id')
        .eq('phone_no', phoneNo)
        .single();
      if (!user) return { success: false, error: 'Phone number not registered. Please sign up first.' };
      if (RateLimiter.isRateLimited(phoneNo)) return { success: false, error: 'Rate limit exceeded. Please try again later.' };
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from('logins')
        .upsert({
          phone_no: phoneNo,
          otp,
          expires_at: expiresAt,
          last_login: new Date().toISOString(),
        });
      if (error) return { success: false, error: error.message };
      RateLimiter.recordAttempt(phoneNo);
      const smsResult = await SMSService.sendOTP(phoneNo, otp);
      if (!smsResult.success) return { success: false, error: smsResult.error || 'Failed to send OTP SMS' };
      return { success: true };
    } catch {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async verifyOTP(phoneNo: string, otp: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Allow hardcoded OTP 123456 for all numbers
      let userData;
      if (otp === '123456') {
        const { data, error } = await supabase
          .from('signups')
          .select('*')
          .eq('phone_no', phoneNo)
          .single();
        if (error || !data) return { success: false, error: 'User not found' };
        userData = data;
      } else {
        const { data: loginData } = await supabase
          .from('logins')
          .select('*')
          .eq('phone_no', phoneNo)
          .eq('otp', otp)
          .single();
        if (!loginData) return { success: false, error: 'Invalid OTP' };
        if (loginData.expires_at && new Date(loginData.expires_at) < new Date()) return { success: false, error: 'OTP expired' };
        const { data, error } = await supabase
          .from('signups')
          .select('*')
          .eq('phone_no', phoneNo)
          .single();
        if (error || !data) return { success: false, error: 'User not found' };
        userData = data;
        await supabase
          .from('logins')
          .update({ last_login: new Date().toISOString() })
          .eq('phone_no', phoneNo);
      }
      const user: User = {
        id: userData.id,
        name: userData.name,
        phone: userData.phone_no,
        dob: userData.dob,
        accountNumber: userData.acc_no,
        ifscCode: userData.ifsc_code,
        preferredLanguage: 'en',
        isVerified: true,
        createdAt: new Date(userData.created_at),
      };
      return { success: true, user };
    } catch {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async checkUserExists(phoneNo: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('signups')
        .select('id')
        .eq('phone_no', phoneNo)
        .single();
      return Boolean(data);
    } catch {
      return false;
    }
  }
}