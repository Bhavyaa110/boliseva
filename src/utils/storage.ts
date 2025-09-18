export class LocalStorage {
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

export class OfflineQueue {
  private static QUEUE_KEY = 'boliseva_offline_queue';

  static addToQueue(action: any): void {
    const queue = this.getQueue();
    queue.push({ ...action, timestamp: Date.now() });
    LocalStorage.set(this.QUEUE_KEY, queue);
  }

  static getQueue(): any[] {
    return LocalStorage.get<any[]>(this.QUEUE_KEY) || [];
  }

  static clearQueue(): void {
    LocalStorage.remove(this.QUEUE_KEY);
  }

  static async processQueue(): Promise<void> {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    // Import LoanService dynamically to avoid circular imports
    const { LoanService } = await import('../services/loanService');

    // Process each queued action
    for (const action of queue) {
      try {
        if (action.type === 'submitLoan') {
          const result = await LoanService.submitApplication(action.data);
          if (!result.success) {
            console.error('Failed to submit loan offline:', result.error);
            // Optionally, keep in queue or handle failure
          } else {
            console.log('Loan submitted successfully from offline queue:', result.loanId);
          }
        }
        // Add more action types as needed
      } catch (error) {
        console.error('Error processing offline action:', error);
      }
    }

    this.clearQueue();
  }
}