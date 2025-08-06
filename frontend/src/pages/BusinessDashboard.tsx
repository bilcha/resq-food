import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../store/auth';
import {
  Building2,
  Package,
  BarChart3,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import ListingManagement from '../components/listings/ListingManagement';
import BusinessProfileForm from '../components/business/BusinessProfileForm';
import OfflineDataStatus from '../components/ui/OfflineDataStatus';
import { useTranslation } from 'react-i18next';

type TabType = 'listings' | 'analytics' | 'profile';

const BusinessDashboard = () => {
  const { business, user, fetchBusinessProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('listings');
  const { t } = useTranslation();

  const handleBusinessUpdate = (updatedBusiness: any) => {
    // Refetch the business profile to ensure we have the latest data
    fetchBusinessProfile();
  };

  if (!business) {
    return (
      <>
        <Helmet>
          <title>{t('business_dashboard.title')}</title>
        </Helmet>

        <div className="min-h-screen py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Business Profile Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                You need to complete your business registration to access the
                dashboard.
              </p>
              <a href="/register" className="btn btn-primary">
                Complete Registration
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  const tabs = [
    {
      id: 'listings' as TabType,
      name: 'Listings',
      icon: Package,
      description: 'Manage your food listings',
    },
    {
      id: 'analytics' as TabType,
      name: 'Analytics',
      icon: BarChart3,
      description: 'View your performance metrics',
    },
    {
      id: 'profile' as TabType,
      name: 'Profile',
      icon: Settings,
      description: 'Manage business information',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Business Dashboard - ResQ Food</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="text-primary-600" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {business.name}
                  </h1>
                  <p className="text-gray-600">
                    {business.address || 'Business address not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon size={18} />
                      <span>{tab.name}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'listings' && (
            <ListingManagement businessId={business.id} />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <OfflineDataStatus />

              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    Track your listing performance, customer engagement, and
                    impact metrics.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <BusinessProfileForm
              business={business}
              onUpdate={handleBusinessUpdate}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default BusinessDashboard;
