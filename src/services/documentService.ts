export class DocumentService {
  static async verifyAadhaar(aadhaarNumber: string): Promise<{ isValid: boolean; details?: any }> {
    // Simulate Aadhaar verification API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation
    if (aadhaarNumber.length === 12 && /^\d+$/.test(aadhaarNumber)) {
      return {
        isValid: true,
        details: {
          name: 'Mock User Name',
          dob: '1990-01-01',
          gender: 'M',
          address: 'Mock Address, India',
        }
      };
    }
    
    return { isValid: false };
  }

  static async verifyPAN(panNumber: string): Promise<{ isValid: boolean; details?: any }> {
    // Simulate PAN verification API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock validation
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (panPattern.test(panNumber.toUpperCase())) {
      return {
        isValid: true,
        details: {
          name: 'Mock PAN Holder',
          category: 'Individual',
          status: 'Valid',
        }
      };
    }
    
    return { isValid: false };
  }

  static async performKYC(userData: any): Promise<{ score: number; status: 'approved' | 'rejected' | 'review' }> {
    // Simulate comprehensive KYC check
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let score = 100;
    
    // Deduct points for missing or invalid data
    if (!userData.aadhaar || userData.aadhaar.length !== 12) score -= 30;
    if (!userData.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(userData.pan)) score -= 25;
    if (!userData.phone || userData.phone.length !== 10) score -= 20;
    if (!userData.income || userData.income < 10000) score -= 15;
    
    let status: 'approved' | 'rejected' | 'review' = 'approved';
    if (score < 50) status = 'rejected';
    else if (score < 75) status = 'review';
    
    return { score, status };
  }

  static async uploadDocument(file: File, type: string): Promise<{ success: boolean; url?: string }> {
    // Simulate document upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful upload
    return {
      success: true,
      url: `https://mock-storage.example.com/${type}/${Date.now()}_${file.name}`
    };
  }
}