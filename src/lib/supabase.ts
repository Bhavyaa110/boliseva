import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      signups: {
        Row: {
          id: string;
          name: string;
          dob: string;
          acc_no: string;
          ifsc_code: string;
          phone_no: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          dob: string;
          acc_no: string;
          ifsc_code: string;
          phone_no: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          dob?: string;
          acc_no?: string;
          ifsc_code?: string;
          phone_no?: string;
          created_at?: string;
        };
      };
      logins: {
        Row: {
          id: string;
          phone_no: string;
          otp: string;
          last_login: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone_no: string;
          otp: string;
          last_login?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone_no?: string;
          otp?: string;
          last_login?: string;
          created_at?: string;
        };
      };
      loans: {
        Row: {
          loan_id: string;
          user_id: string;
          status: string;
          amount: number;
          loan_type: string;
          purpose: string;
          income: number;
          employment: string;
          documents_verified: boolean;
          created_at: string;
        };
        Insert: {
          loan_id?: string;
          user_id: string;
          status?: string;
          amount: number;
          loan_type: string;
          purpose: string;
          income: number;
          employment: string;
          documents_verified?: boolean;
          created_at?: string;
        };
        Update: {
          loan_id?: string;
          user_id?: string;
          status?: string;
          amount?: number;
          loan_type?: string;
          purpose?: string;
          income?: number;
          employment?: string;
          documents_verified?: boolean;
          created_at?: string;
        };
      };
      emis: {
        Row: {
          emi_id: string;
          loan_id: string;
          due_date: string;
          amount: number;
          status: string;
          reminder_sent: boolean;
          paid_date: string | null;
          created_at: string;
        };
        Insert: {
          emi_id?: string;
          loan_id: string;
          due_date: string;
          amount: number;
          status?: string;
          reminder_sent?: boolean;
          paid_date?: string | null;
          created_at?: string;
        };
        Update: {
          emi_id?: string;
          loan_id?: string;
          due_date?: string;
          amount?: number;
          status?: string;
          reminder_sent?: boolean;
          paid_date?: string | null;
          created_at?: string;
        };
      };
    };
  };
}