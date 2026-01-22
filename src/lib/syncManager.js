
import { useEffect, useState } from 'react';

const APP_VERSION = '1.2.0'; // Updated app version

export const useSyncManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncs, setPendingSyncs] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for pending data
    const pending = localStorage.getItem('pending_syncs') || '[]';
    try {
        setPendingSyncs(JSON.parse(pending).length);
    } catch (e) {
        setPendingSyncs(0);
        localStorage.setItem('pending_syncs', '[]');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncData = async () => {
    const pendingData = JSON.parse(localStorage.getItem('pending_syncs') || '[]');
    if (pendingData.length === 0) return;

    setIsSyncing(true);

    // Simulate syncing delay
    setTimeout(() => {
      console.log('Syncing data...', pendingData);
      
      // Clear pending syncs after "successful" sync
      localStorage.setItem('pending_syncs', '[]');
      setPendingSyncs(0);
      setIsSyncing(false);
      
      // Notify app that data might have been updated from "server"
      window.dispatchEvent(new Event('localDataUpdated'));
    }, 2000);
  };

  const addToSyncQueue = (type, data) => {
    const pendingData = JSON.parse(localStorage.getItem('pending_syncs') || '[]');
    pendingData.push({
      id: Date.now(),
      type,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pending_syncs', JSON.stringify(pendingData));
    setPendingSyncs(pendingData.length);
  };

  return { isOnline, isSyncing, pendingSyncs, addToSyncQueue, syncData };
};

export const checkAppVersion = () => {
  const currentVersion = localStorage.getItem('app_version');
  if (currentVersion !== APP_VERSION) {
    console.log(`Version mismatch: ${currentVersion} vs ${APP_VERSION}. Clearing cache.`);
    // We preserve user data but might want to clear temp caches if we had them.
    // For this app, we mostly store user data in localStorage, so we'll just update the version
    // to avoid wiping user data unnecessarily, unless it's a breaking schema change.
    // In a real app, we might run migrations here.
    localStorage.setItem('app_version', APP_VERSION);
    return true; // Version changed
  }
  return false;
};

export const forceRefresh = () => {
  if (window.confirm("Isso limpará todos os dados locais e recarregará a página. Deseja continuar?")) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }
};

export const dispatchUpdate = () => {
  window.dispatchEvent(new Event('localDataUpdated'));
};
