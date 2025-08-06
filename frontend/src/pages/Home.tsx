import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('home.title')}</title>
        <meta name="description" content={t('home.meta_description')} />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {t('home.hero_title')}
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                {t('home.hero_subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/listings"
                  className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100"
                >
                  {t('common.browse_listings')}
                </Link>
                <Link
                  to="/register"
                  className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-600"
                >
                  {t('navigation.register_business')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('common.how_it_works')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('home.features_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏪</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('home.step1_title')}
                </h3>
                <p className="text-gray-600">{t('home.step1_description')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('home.step2_title')}
                </h3>
                <p className="text-gray-600">{t('home.step2_description')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('home.step3_title')}
                </h3>
                <p className="text-gray-600">{t('home.step3_description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('common.ready_to_start')}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {t('home.cta_subtitle')}
            </p>
            <Link to="/listings" className="btn btn-primary btn-lg">
              {t('common.browse_listings')}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
