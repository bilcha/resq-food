import { useQuery } from '@tanstack/react-query'
import { Database, RefreshCw, AlertTriangle, CheckCircle, Clock, Download } from 'lucide-react'
import { syncService } from '../../lib/sync-service'
import { offlineApi } from '../../lib/offline-api'
import { dataPreloader } from '../../lib/data-preloader'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

export default function OfflineDataStatus() {
  const { isOnline } = useOnlineStatus()
  const [isPreloading, setIsPreloading] = useState(false)

  const { data: syncStatus } = useQuery({
    queryKey: ['sync-status'],
    queryFn: () => syncService.getSyncStatus(),
    refetchInterval: 30000, // Update every 30 seconds
  })

  const { data: offlineStatus } = useQuery({
    queryKey: ['offline-status'],
    queryFn: () => offlineApi.getOfflineStatus(),
    refetchInterval: 60000, // Update every minute
  })

  const { data: preloadStatus } = useQuery({
    queryKey: ['preload-status'],
    queryFn: () => dataPreloader.getPreloadStatus(),
    refetchInterval: 5000, // Update every 5 seconds
  })

  if (!syncStatus || !offlineStatus || !preloadStatus) {
    return null
  }

  const { lastSync, pendingChanges, isSyncing } = syncStatus
  const { hasLocalData, storageInfo } = offlineStatus

  const handleForceSync = async () => {
    try {
      await offlineApi.forceSync()
    } catch (error) {
      console.error('Force sync failed:', error)
    }
  }

  const handleForcePreload = async () => {
    if (!isOnline) return
    
    setIsPreloading(true)
    try {
      await dataPreloader.forcePreload()
    } catch (error) {
      console.error('Force preload failed:', error)
    } finally {
      setIsPreloading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Database size={20} className="mr-2" />
          Offline Data Status
        </h3>
        
        <div className="flex space-x-2">
          {isOnline && (
            <>
              <button
                onClick={handleForcePreload}
                disabled={isPreloading || preloadStatus.isPreloading}
                className="btn btn-sm btn-secondary flex items-center"
              >
                <Download size={16} className={`mr-2 ${(isPreloading || preloadStatus.isPreloading) ? 'animate-bounce' : ''}`} />
                {isPreloading || preloadStatus.isPreloading ? 'Loading...' : 'Refresh Data'}
              </button>
              
              <button
                onClick={handleForceSync}
                disabled={isSyncing}
                className="btn btn-sm btn-secondary flex items-center"
              >
                <RefreshCw size={16} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Local Storage</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Businesses: {storageInfo.businessesCount}</div>
            <div>Listings: {storageInfo.listingsCount}</div>
            <div>Pending changes: {storageInfo.pendingChangesCount}</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Status</h4>
          <div className="space-y-2">
            {preloadStatus.isPreloading && (
              <div className="flex items-center text-blue-600 text-sm">
                <Download size={16} className="mr-2 animate-bounce" />
                Preloading data...
              </div>
            )}
            
            {!isOnline && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertTriangle size={16} className="mr-2" />
                Offline mode
              </div>
            )}
            
            {isOnline && isSyncing && (
              <div className="flex items-center text-blue-600 text-sm">
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Syncing...
              </div>
            )}
            
            {isOnline && !isSyncing && !preloadStatus.isPreloading && pendingChanges === 0 && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle size={16} className="mr-2" />
                All synced
              </div>
            )}
            
            {isOnline && !isSyncing && pendingChanges > 0 && (
              <div className="flex items-center text-orange-600 text-sm">
                <Clock size={16} className="mr-2" />
                {pendingChanges} pending
              </div>
            )}
            
            {lastSync && (
              <div className="text-xs text-gray-500">
                Last sync: {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}
              </div>
            )}
          </div>
        </div>
      </div>

      {!hasLocalData && !preloadStatus.isPreloading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertTriangle size={16} className="text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              {isOnline 
                ? 'No offline data available. Click "Refresh Data" to download for offline use.'
                : 'No offline data available. Connect to the internet to download data for offline use.'
              }
            </p>
          </div>
        </div>
      )}

      {hasLocalData && preloadStatus.isComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <CheckCircle size={16} className="text-green-600 mr-2" />
            <p className="text-sm text-green-800">
              Data cached and ready for offline use
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 