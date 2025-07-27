import { useState, useEffect } from 'react'
import { Download, CheckCircle, AlertCircle } from 'lucide-react'
import { dataPreloader } from '../../lib/data-preloader'
import { useTranslation } from 'react-i18next'

export default function DataPreloadIndicator() {
  const [status, setStatus] = useState({
    isPreloading: false,
    isComplete: false,
    hasLocalData: false
  })
  const [showIndicator, setShowIndicator] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const updateStatus = async () => {
      const currentStatus = await dataPreloader.getPreloadStatus()
      setStatus(currentStatus)
      
      // Show indicator if preloading or if we need to show completion briefly
      setShowIndicator(currentStatus.isPreloading)
    }

    // Initial status check
    updateStatus()

    // Listen for preload completion
    const handlePreloadComplete = () => {
      updateStatus()
      // Show completion indicator briefly
      setShowIndicator(true)
      setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleBusinessPreloadComplete = () => {
      updateStatus()
      // Show brief business-specific completion indicator
      setShowIndicator(true)
      setTimeout(() => setShowIndicator(false), 2000)
    }

    window.addEventListener('data-preload-complete', handlePreloadComplete)
    window.addEventListener('business-data-preload-complete', handleBusinessPreloadComplete)

    // Update status periodically while preloading
    const interval = setInterval(() => {
      if (status.isPreloading) {
        updateStatus()
      }
    }, 1000)

    return () => {
      window.removeEventListener('data-preload-complete', handlePreloadComplete)
      window.removeEventListener('business-data-preload-complete', handleBusinessPreloadComplete)
      clearInterval(interval)
    }
  }, [status.isPreloading])

  if (!showIndicator) {
    return null
  }

  return (
    <div className="fixed top-16 right-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-sm">
      <div className="flex items-center space-x-3">
        {status.isPreloading && (
          <>
            <Download size={16} className="text-blue-500 animate-bounce" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{t('components.ui.data_preload_indicator.preloading')}...</p>
              <p className="text-xs text-gray-600">{t('components.ui.data_preload_indicator.progress')}</p>
            </div>
          </>
        )}
        
        {status.isComplete && !status.isPreloading && (
          <>
            <CheckCircle size={16} className="text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{t('components.ui.data_preload_indicator.completed')}</p>
              <p className="text-xs text-gray-600">{t('components.ui.online_status.offline')}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 