export class SMSService {
  private static readonly TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  private static readonly TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  private static readonly TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

  static async sendOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Production SMS sending via Twilio
      if (!this.TWILIO_ACCOUNT_SID || !this.TWILIO_AUTH_TOKEN || !this.TWILIO_PHONE_NUMBER) {
        console.warn('Twilio credentials not configured. Using console logging for OTP.');
        console.log(`SMS OTP for ${phoneNumber}: ${otp}`);
        return { success: true };
      }

      const message = `Your BoliSeva OTP is: ${otp}. Valid for 5 minutes.`;

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${this.TWILIO_ACCOUNT_SID}:${this.TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: this.TWILIO_PHONE_NUMBER,
          To: phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`, // Assuming Indian numbers, adjust as needed
          Body: message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('SMS sent successfully:', data.sid);
        return { success: true };
      } else {
        console.error('SMS sending failed:', JSON.stringify(data, null, 2));
        return { success: false, error: data.error_message || 'Failed to send SMS' };
      }
    } catch (error) {
      console.error('SMS service error:', error);
      return { success: false, error: 'Network error while sending SMS' };
    }
  }
}
