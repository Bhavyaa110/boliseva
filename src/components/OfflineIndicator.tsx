import React from 'react';
import { WifiOff, Wifi, RotateCcw } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, hasPendingSync, syncOfflineData } = useOffline();

  if (isOnline && !hasPendingSync) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 ${isOnline ? 'bg-orange-500' : 'bg-red-500'} text-white`}>
        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span className="text-sm font-medium">
          {isOnline ? (hasPendingSync ? 'Syncing...' : '') : 'Offline Mode'}
        </span>
        {isOnline && hasPendingSync && (
          <button
            onClick={syncOfflineData}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};