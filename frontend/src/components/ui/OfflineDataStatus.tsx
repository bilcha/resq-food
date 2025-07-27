import { useQuery } from '@tanstack/react-query'
import { Database, RefreshCw, AlertTriangle, CheckCircle, Clock, Download } from 'lucide-react'
import { syncService } from '../../lib/sync-service'
import { offlineApi } from '../../lib/offline-api'
import { dataPreloader } from '../../lib/data-preloader'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function OfflineDataStatus() {
  const { isOnline } = useOnlineStatus()
  const [isPreloading, setIsPreloading] = useState(false)
  const { t } = useTranslation()

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

  const { lastSync, pendingChanges, isSyncing, pendingImages, failedImages } = syncStatus
  const { hasLocalData, storageInfo } = offlineStatus

  const handleForceSync = async () => {
    try {
      await offlineApi.forceSync()
    } catch (error) {
      console.error('Force sync failed:', error)
    }
  }

  const handleRetryImages = async () => {
    try {
      await syncService.retryFailedImageUploads()
    } catch (error) {
      console.error('Retry images failed:', error)
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
          {t('components.ui.offline_data_status.title')}
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
                {isPreloading || preloadStatus.isPreloading ? t('components.ui.offline_data_status.loading') : t('components.ui.offline_data_status.refresh_data')}
              </button>
              
              <button
                onClick={handleForceSync}
                disabled={isSyncing}
                className="btn btn-sm btn-secondary flex items-center"
              >
                <RefreshCw size={16} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? t('components.ui.offline_data_status.syncing') : t('components.ui.offline_data_status.sync_now')}
              </button>

              {failedImages > 0 && (
                <button
                  onClick={handleRetryImages}
                  disabled={isSyncing}
                  className="btn btn-sm bg-red-600 hover:bg-red-700 text-white flex items-center"
                >
                  <RefreshCw size={16} className="mr-2" />
                  {t('components.ui.offline_data_status.retry_images')}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">{t('components.ui.offline_data_status.local_storage')}</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{t('components.ui.offline_data_status.businesses')}: {storageInfo.businessesCount}</div>
            <div>{t('components.ui.offline_data_status.listings')}: {storageInfo.listingsCount}</div>
            <div>{t('components.ui.offline_data_status.pending_changes')}: {storageInfo.pendingChangesCount}</div>
            {storageInfo.imagesCount !== undefined && (
              <div>{t('components.ui.offline_data_status.images')}: {storageInfo.imagesCount - storageInfo.unuploadedImagesCount} {t('components.ui.offline_data_status.uploaded')}, {storageInfo.unuploadedImagesCount} {t('components.ui.offline_data_status.pending')}</div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">{t('components.ui.offline_data_status.status')}</h4>
          <div className="space-y-2">
            {preloadStatus.isPreloading && (
              <div className="flex items-center text-blue-600 text-sm">
                <Download size={16} className="mr-2 animate-bounce" />
                {t('components.ui.offline_data_status.preloading_data')}
              </div>
            )}
            
            {!isOnline && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertTriangle size={16} className="mr-2" />
                {t('components.ui.offline_data_status.offline_mode')}
              </div>
            )}
            
            {isOnline && isSyncing && (
              <div className="flex items-center text-blue-600 text-sm">
                <RefreshCw size={16} className="mr-2 animate-spin" />
                {t('components.ui.offline_data_status.syncing')}
              </div>
            )}
            
            {isOnline && !isSyncing && !preloadStatus.isPreloading && pendingChanges === 0 && pendingImages === 0 && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle size={16} className="mr-2" />
                {t('components.ui.offline_data_status.all_synced')}
              </div>
            )}
            
            {isOnline && !isSyncing && (pendingChanges > 0 || pendingImages > 0) && (
              <div className="flex items-center text-orange-600 text-sm">
                <Clock size={16} className="mr-2" />
                {pendingChanges + pendingImages} {t('components.ui.offline_data_status.pending_sync')}
                {pendingImages > 0 && (
                  <span className="ml-1 text-xs">({pendingImages} {t('components.ui.offline_data_status.images')})</span>
                )}
              </div>
            )}

            {failedImages > 0 && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertTriangle size={16} className="mr-2" />
                {failedImages} {t('components.ui.offline_data_status.images_failed')}
                <span className="ml-1 text-xs">({t('components.ui.offline_data_status.retry_automatically')})</span>
              </div>
            )}
            
            {lastSync && (
              <div className="text-xs text-gray-500">
                {t('components.ui.offline_data_status.last_sync')}: {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}
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
                ? t('components.ui.offline_data_status.no_offline_data_online')
                : t('components.ui.offline_data_status.no_offline_data_offline')
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