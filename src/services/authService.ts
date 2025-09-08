import { supabase } from '../lib/supabase';
import { User } from '../types';

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

      // Store OTP in database
      const { error } = await supabase
        .from('logins')
        .upsert({
          phone_no: phoneNo,
          otp: otp,
          last_login: new Date().toISOString(),
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // In production, send OTP via SMS service
      console.log(`OTP for ${phoneNo}: ${otp}`);
      
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

        // Set session context
        await supabase.rpc('set_user_context', {
          phone_number: phoneNo
        });

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

      // Set session context
      await supabase.rpc('set_user_context', {
        phone_number: phoneNo
      });

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