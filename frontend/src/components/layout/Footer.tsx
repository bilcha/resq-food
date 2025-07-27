import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ResQ Food</h3>
            <p className="text-gray-400">
              {t('footer.description')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('common.quick_links')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white">{t('navigation.home')}</Link></li>
              <li><Link to="/listings" className="hover:text-white">{t('navigation.listings')}</Link></li>
              <li><Link to="/about" className="hover:text-white">{t('navigation.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-white">{t('navigation.contact')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('common.for_businesses')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/register" className="hover:text-white">{t('common.register')}</Link></li>
              <li><Link to="/login" className="hover:text-white">{t('navigation.login')}</Link></li>
              <li><Link to="/business-dashboard" className="hover:text-white">{t('navigation.dashboard')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('common.support')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/contact" className="hover:text-white">{t('common.help_center')}</Link></li>
              <li><Link to="/contact" className="hover:text-white">{t('common.contact_support')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 