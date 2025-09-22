import { LocalStorage } from './storage';

export class RateLimiter {
  private static readonly MAX_ATTEMPTS = 100;
  private static readonly WINDOW_MS = 60 * 60 * 1000; // 1 hour

  private static getKey(phoneNo: string): string {
    return `otp_attempts_${phoneNo}`;
  }

  private static getRecentAttempts(phoneNo: string): number[] {
    const key = this.getKey(phoneNo);
    const attempts = LocalStorage.get<number[]>(key) || [];
    const now = Date.now();
    const recentAttempts = attempts.filter(timestamp => now - timestamp < this.WINDOW_MS);
    LocalStorage.set(key, recentAttempts);
    return recentAttempts;
  }

  static isRateLimited(phoneNo: string): boolean {
    return this.getRecentAttempts(phoneNo).length >= this.MAX_ATTEMPTS;
  }

  static recordAttempt(phoneNo: string): void {
    const key = this.getKey(phoneNo);
    const recentAttempts = this.getRecentAttempts(phoneNo);
    recentAttempts.push(Date.now());
    LocalStorage.set(key, recentAttempts);
  }

  static getRemainingAttempts(phoneNo: string): number {
    return Math.max(0, this.MAX_ATTEMPTS - this.getRecentAttempts(phoneNo).length);
  }
}
