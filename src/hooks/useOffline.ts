import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { OfflineQueue } from '../utils/storage';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasPendingSync, setHasPendingSync] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setHasPendingSync(OfflineQueue.getQueue().length > 0);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = async () => {
    if (!isOnline) return;
    try {
      await OfflineQueue.processQueue();
      setHasPendingSync(false);
      toast.success('Your offline data has been successfully synced.');
    } catch (error) {
      console.error('Error syncing offline data:', error);
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