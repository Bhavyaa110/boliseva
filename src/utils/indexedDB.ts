import { LoanApplication, EMI } from '../types';
type StoreType = 'loans' | 'emis';

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
        ['loans', 'emis'].forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            store.createIndex('userId', 'userId', { unique: false });
            if (storeName === 'emis') {
              store.createIndex('loanId', 'loanId', { unique: false });
            }
          } else {
            const transaction = (event.target as IDBOpenDBRequest).transaction;
            if (transaction) {
              const store = transaction.objectStore(storeName);
              if (!store.indexNames.contains('userId')) {
                store.createIndex('userId', 'userId', { unique: false });
              }
              if (storeName === 'emis' && !store.indexNames.contains('loanId')) {
                store.createIndex('loanId', 'loanId', { unique: false });
              }
            }
          }
        });
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  private async clearUserData(storeType: StoreType, userId: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([storeType], 'readwrite');
    const store = transaction.objectStore(storeType);
    const index = store.index('userId');
    return new Promise((resolve) => {
      const request = index.openCursor(IDBKeyRange.only(userId));
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  private async storeData<T>(storeType: StoreType, userId: string, data: T[]): Promise<void> {
    await this.clearUserData(storeType, userId);
    const db = await this.ensureDB();
    const transaction = db.transaction([storeType], 'readwrite');
    const store = transaction.objectStore(storeType);
    data.forEach(item => store.put(item));
  }

  private async getData<T>(storeType: StoreType, userId: string): Promise<T[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction([storeType], 'readonly');
    const store = transaction.objectStore(storeType);
    const index = store.index('userId');
    return new Promise((resolve) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async storeLoans(userId: string, loans: LoanApplication[]): Promise<void> {
    return this.storeData('loans', userId, loans);
  }

  async getLoans(userId: string): Promise<LoanApplication[]> {
    return this.getData('loans', userId);
  }

  async storeEMIs(userId: string, emis: EMI[]): Promise<void> {
    // Add userId to each EMI for indexing
    const emisWithUserId = emis.map(emi => ({ ...emi, userId }));
    return this.storeData('emis', userId, emisWithUserId);
  }

  async getEMIs(userId: string): Promise<EMI[]> {
    return this.getData('emis', userId);
  }
}

export const indexedDBManager = new IndexedDBManager();
