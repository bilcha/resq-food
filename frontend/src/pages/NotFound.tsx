import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('not_found.title')}</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-4">404</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('not_found.page_title')}
          </h1>
          <p className="text-gray-600 mb-8">{t('not_found.description')}</p>
          <Link to="/" className="btn btn-primary">
            {t('not_found.go_home')}
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
