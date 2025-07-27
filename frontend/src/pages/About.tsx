import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

const About = () => {
  const { t } = useTranslation()
  return (
    <>
      <Helmet>
        <title>{t('about.title')}</title>
        <meta name="description" content={t('about.meta_description')} />
      </Helmet>
      
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('about.page_title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('about.page_subtitle')}
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              {t('about.intro')}
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('about.mission_title')}</h2>
            <p className="text-gray-700 mb-6">
              {t('about.mission_description')}
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('about.help_title')}</h2>
            <ul className="list-disc list-inside text-gray-700 mb-6">
              <li>Reduce food waste by connecting surplus food with consumers</li>
              <li>Help businesses recover costs from unsold inventory</li>
              <li>Provide affordable food options to price-conscious consumers</li>
              <li>Create a positive environmental impact through waste reduction</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-700">
              We envision a world where food waste is minimized, businesses thrive sustainably, 
              and everyone has access to quality food. Through technology and community 
              collaboration, we're working towards this goal one meal at a time.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default About 