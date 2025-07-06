import { Helmet } from 'react-helmet-async'

const About = () => {
  return (
    <>
      <Helmet>
        <title>About - ResQ Food</title>
        <meta name="description" content="Learn about ResQ Food's mission to reduce food waste and connect businesses with consumers." />
      </Helmet>
      
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About ResQ Food
            </h1>
            <p className="text-xl text-gray-600">
              Our mission to reduce food waste and help the environment
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              ResQ Food is a social-ecological platform that connects businesses with surplus food 
              to consumers looking for affordable, quality meals. We're inspired by successful 
              global initiatives like Too Good To Go and OLIO, but tailored specifically for 
              the Ukrainian market.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              Every year, millions of tons of food are wasted while many people struggle with 
              food insecurity. We believe technology can bridge this gap by making surplus food 
              accessible to everyone while helping businesses reduce waste and recover costs.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Help</h2>
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