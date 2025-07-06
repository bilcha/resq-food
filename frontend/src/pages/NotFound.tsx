import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - ResQ Food</title>
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-4">404</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    </>
  )
}

export default NotFound 