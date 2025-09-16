import { supabase } from '../lib/supabase';
import { User } from '../types';
import { SMSService } from '../utils/sms';

export class AuthService {
  static async signup(userData: {
    name: string;
    dob: string;
    accNo: string;
    ifscCode: string;
    phoneNo: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('signups')
        .insert({
          name: userData.name,
          dob: userData.dob,
          acc_no: userData.accNo,
          ifsc_code: userData.ifscCode,
          phone_no: userData.phoneNo,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
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

      if (!user) {
        return { success: false, error: 'Phone number not registered. Please sign up first.' };
      }

      // Generate OTP (in production, this would be sent via SMS)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Set OTP expiration time 5 minutes from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Store OTP and expiration in database
      const { error } = await supabase
        .from('logins')
        .upsert({
          phone_no: phoneNo,
          otp: otp,
          expires_at: expiresAt,
          last_login: new Date().toISOString(),
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Send OTP via SMS
      const smsResult = await SMSService.sendOTP(phoneNo, otp);
      if (!smsResult.success) {
        return { success: false, error: smsResult.error || 'Failed to send OTP SMS' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async verifyOTP(phoneNo: string, otp: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Allow hardcoded OTP 123456 for all numbers
      if (otp === '123456') {
        // Get user data directly
        const { data: userData, error: userError } = await supabase
          .from('signups')
          .select('*')
          .eq('phone_no', phoneNo)
          .single();

        if (userError || !userData) {
          return { success: false, error: 'User not found' };
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
      }

      // Verify OTP
      const { data: loginData } = await supabase
        .from('logins')
        .select('*')
        .eq('phone_no', phoneNo)
        .eq('otp', otp)
        .single();

      if (!loginData) {
        return { success: false, error: 'Invalid OTP' };
      }

      // Check if OTP expired
      if (loginData.expires_at && new Date(loginData.expires_at) < new Date()) {
        return { success: false, error: 'OTP expired' };
      }

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('signups')
        .select('*')
        .eq('phone_no', phoneNo)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'User not found' };
      }

      // Update last login
      await supabase
        .from('logins')
        .update({ last_login: new Date().toISOString() })
        .eq('phone_no', phoneNo);

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
    } catch (error) {
      console.error('OTP verification error:', error);
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

      return !!data;
    } catch {
      return false;
    }
  }
}