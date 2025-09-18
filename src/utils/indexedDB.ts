import { LoanApplication, EMI } from '../types';

class IndexedDBManager {
  private dbName = 'BolisevaDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('loans')) {
          db.createObjectStore('loans', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('emis')) {
          db.createObjectStore('emis', { keyPath: 'id' });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  async storeLoans(userId: string, loans: LoanApplication[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['loans'], 'readwrite');
    const store = transaction.objectStore('loans');

    // Clear old data for this user
    const index = store.index('userId') || store.createIndex('userId', 'userId');
    const request = index.openCursor(IDBKeyRange.only(userId));
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    // Store new data
    loans.forEach(loan => store.put(loan));
  }

  async getLoans(userId: string): Promise<LoanApplication[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['loans'], 'readonly');
    const store = transaction.objectStore('loans');
    const index = store.index('userId') || store.createIndex('userId', 'userId');

    return new Promise((resolve) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async storeEMIs(userId: string, emis: EMI[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['emis'], 'readwrite');
    const store = transaction.objectStore('emis');

    // Clear old data for this user
    const index = store.index('userId') || store.createIndex('userId', 'userId');
    const request = index.openCursor(IDBKeyRange.only(userId));
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    // Store new data
    emis.forEach(emi => store.put(emi));
  }

  async getEMIs(userId: string): Promise<EMI[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['emis'], 'readonly');
    const store = transaction.objectStore('emis');
    const index = store.index('userId') || store.createIndex('userId', 'userId');

    return new Promise((resolve) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result || []);
    });
  }
}

export const indexedDBManager = new IndexedDBManager();
