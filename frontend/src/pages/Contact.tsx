import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

const Contact = () => {
  const { t } = useTranslation()
  return (
    <>
      <Helmet>
        <title>{t('contact.title')}</title>
        <meta name="description" content={t('contact.meta_description')} />
      </Helmet>
      
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('contact.page_title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('contact.page_subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contact.get_in_touch')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{t('contact.email')}</h3>
                  <p className="text-gray-600">hello@resqfood.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('contact.support')}</h3>
                  <p className="text-gray-600">support@resqfood.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('contact.business_partnerships')}</h3>
                  <p className="text-gray-600">partnerships@resqfood.com</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contact.faq_title')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{t('contact.faq_q1')}</h3>
                  <p className="text-gray-600">
                    {t('contact.faq_a1')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('contact.faq_q2')}</h3>
                  <p className="text-gray-600">
                    {t('contact.faq_a2')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('contact.faq_q3')}</h3>
                  <p className="text-gray-600">
                    {t('contact.faq_a3')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact 