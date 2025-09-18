import { LocalStorage } from './storage';

export class RateLimiter {
  private static readonly MAX_ATTEMPTS = 100;
  private static readonly WINDOW_MS = 60 * 60 * 1000; // 1 hour

  static isRateLimited(phoneNo: string): boolean {
    const key = `otp_attempts_${phoneNo}`;
    const attempts = LocalStorage.get<number[]>(key) || [];
    const now = Date.now();

    // Filter attempts within the last hour
    const recentAttempts = attempts.filter(timestamp => now - timestamp < this.WINDOW_MS);

    // Update storage with filtered attempts
    LocalStorage.set(key, recentAttempts);

    return recentAttempts.length >= this.MAX_ATTEMPTS;
  }

  static recordAttempt(phoneNo: string): void {
    const key = `otp_attempts_${phoneNo}`;
    const attempts = LocalStorage.get<number[]>(key) || [];
    const now = Date.now();

    // Add current attempt
    attempts.push(now);

    // Filter old attempts (though isRateLimited already does this, but to be safe)
    const recentAttempts = attempts.filter(timestamp => now - timestamp < this.WINDOW_MS);

    LocalStorage.set(key, recentAttempts);
  }

  static getRemainingAttempts(phoneNo: string): number {
    const key = `otp_attempts_${phoneNo}`;
    const attempts = LocalStorage.get<number[]>(key) || [];
    const now = Date.now();

    const recentAttempts = attempts.filter(timestamp => now - timestamp < this.WINDOW_MS);

    return Math.max(0, this.MAX_ATTEMPTS - recentAttempts.length);
  }
}
