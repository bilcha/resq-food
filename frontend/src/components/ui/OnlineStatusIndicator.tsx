import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function OnlineStatusIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showReconnectedMessage, setShowReconnectedMessage] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnectedMessage(true);
      setSyncing(true);

      // Listen for sync completion
      const handleSyncComplete = () => {
        setSyncing(false);
        setTimeout(() => setShowReconnectedMessage(false), 3000);
      };

      window.addEventListener('sync-complete', handleSyncComplete);

      // Hide message after 5 seconds regardless
      setTimeout(() => {
        setShowReconnectedMessage(false);
        setSyncing(false);
      }, 5000);

      return () => {
        window.removeEventListener('sync-complete', handleSyncComplete);
      };
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <WifiOff size={16} />
        <span className="text-sm font-medium">
          {t('components.ui.online_status.offline')}
        </span>
      </div>
    );
  }

  if (showReconnectedMessage) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        {syncing ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <Wifi size={16} />
        )}
        <span className="text-sm font-medium">
          {syncing
            ? t('components.ui.offline_data_status.syncing')
            : t('components.ui.online_status.reconnected')}
        </span>
      </div>
    );
  }

  return null;
}
