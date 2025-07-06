import { Helmet } from 'react-helmet-async'

const Register = () => {
  return (
    <>
      <Helmet>
        <title>Register Business - ResQ Food</title>
        <meta name="description" content="Register your business with ResQ Food to start listing surplus food." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Register your business
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join the fight against food waste
            </p>
          </div>
          
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Registration Coming Soon
            </h3>
            <p className="text-gray-600">
              We're preparing the registration system for businesses.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register 