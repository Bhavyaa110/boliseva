import { useState, useEffect } from 'react';
import { OfflineQueue } from '../utils/storage';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasPendingSync, setHasPendingSync] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending sync on mount
    checkPendingSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingSync = () => {
    const queue = OfflineQueue.getQueue();
    setHasPendingSync(queue.length > 0);
  };

  const syncOfflineData = async () => {
    if (isOnline) {
      try {
        await OfflineQueue.processQueue();
        setHasPendingSync(false);
      } catch (error) {
        console.error('Error syncing offline data:', error);
      }
    }
  };

  const addOfflineAction = (action: any) => {
    OfflineQueue.addToQueue(action);
    setHasPendingSync(true);
  };

  return {
    isOnline,
    hasPendingSync,
    addOfflineAction,
    syncOfflineData,
  };
};