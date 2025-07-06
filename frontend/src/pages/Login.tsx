import { Helmet } from 'react-helmet-async'

const Login = () => {
  return (
    <>
      <Helmet>
        <title>Login - ResQ Food</title>
        <meta name="description" content="Login to your ResQ Food business account." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              For business owners only
            </p>
          </div>
          
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Coming Soon
            </h3>
            <p className="text-gray-600">
              We're setting up secure authentication for businesses.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login 