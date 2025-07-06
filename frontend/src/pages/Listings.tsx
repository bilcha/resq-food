import { Helmet } from 'react-helmet-async'

const Listings = () => {
  return (
    <>
      <Helmet>
        <title>Food Listings - ResQ Food</title>
        <meta name="description" content="Browse available food listings from local businesses at discounted prices." />
      </Helmet>
      
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Available Food Listings
            </h1>
            <p className="text-xl text-gray-600">
              Discover surplus food from local businesses at discounted prices
            </p>
          </div>
          
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍎</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-600">
              We're working hard to bring you amazing food listings. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Listings 