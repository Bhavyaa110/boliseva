import { supabase } from '../lib/supabase';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'your-secret-key';

export class DocumentService {
  static async verifyAadhaar(aadhaar: string) {
    await new Promise(r => setTimeout(r, 1000));
    return aadhaar.length === 12 && /^\d+$/.test(aadhaar);
  }

  static async verifyPAN(pan: string) {
    await new Promise(r => setTimeout(r, 1000));
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
  }

  static async uploadDocuments(userId: string, aadhaar: string, pan: string) {
    const encryptedAadhaar = CryptoJS.AES.encrypt(aadhaar, ENCRYPTION_KEY).toString();
    const encryptedPan = CryptoJS.AES.encrypt(pan, ENCRYPTION_KEY).toString();
    const { error } = await supabase.from('documents').insert({
      id: userId,
      aadhar_card: encryptedAadhaar,
      pan_card: encryptedPan,
    });
    return { success: !error, error: error?.message };
  }
}