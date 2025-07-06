import { Helmet } from 'react-helmet-async'

const BusinessDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Business Dashboard - ResQ Food</title>
      </Helmet>
      
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Business Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your listings and business profile coming soon.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default BusinessDashboard 