import { Helmet } from 'react-helmet-async'

const AdminDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - ResQ Food</title>
      </Helmet>
      
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚙️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Administrative controls and analytics coming soon.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard 