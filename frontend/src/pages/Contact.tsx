import { Helmet } from 'react-helmet-async'

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact - ResQ Food</title>
        <meta name="description" content="Get in touch with the ResQ Food team. We're here to help with any questions or support." />
      </Helmet>
      
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600">
              We'd love to hear from you. Get in touch with our team.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-600">hello@resqfood.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Support</h3>
                  <p className="text-gray-600">support@resqfood.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Business Partnerships</h3>
                  <p className="text-gray-600">partnerships@resqfood.com</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">How does ResQ Food work?</h3>
                  <p className="text-gray-600">
                    Businesses list their surplus food at discounted prices, and consumers 
                    can browse and purchase these items to reduce waste.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Is it safe to eat surplus food?</h3>
                  <p className="text-gray-600">
                    Yes! All food listed on our platform is safe to eat and meets quality 
                    standards. It's simply surplus that would otherwise go to waste.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">How can businesses join?</h3>
                  <p className="text-gray-600">
                    Businesses can register on our platform and start listing their surplus 
                    food immediately after approval.
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