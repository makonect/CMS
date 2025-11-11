import React from 'react';
import { usePageView } from '../hooks/usePageView';

const About = () => {
  usePageView('About - LeleDumbo', 'leledumbo');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">About LeleDumbo</h1>
        <p className="text-xl text-gray-600">Your trusted source for catfish expertise</p>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            LeleDumbo is dedicated to providing comprehensive, accurate, and up-to-date information 
            about catfish farming, breeding, and aquaculture. We believe that knowledge sharing is 
            essential for the growth and sustainability of the aquaculture industry.
          </p>
          
          <p className="text-gray-700">
            Our platform brings together experts, farmers, and enthusiasts to create a community 
            focused on improving catfish farming practices and promoting sustainable aquaculture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">What We Offer</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Expert articles on catfish breeding techniques</li>
              <li>• Latest research and innovations in aquaculture</li>
              <li>• Practical farming tips and best practices</li>
              <li>• Disease prevention and treatment guides</li>
              <li>• Equipment reviews and recommendations</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-3">Our Expertise</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Years of experience in catfish farming</li>
              <li>• Collaboration with aquaculture experts</li>
              <li>• Research-backed content</li>
              <li>• Practical, field-tested advice</li>
              <li>• Continuous learning and improvement</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Our Community</h2>
          <p className="text-gray-700 mb-4">
            Whether you're a seasoned catfish farmer or just starting out, LeleDumbo offers 
            valuable insights and resources to help you succeed in your aquaculture journey.
          </p>
          <p className="text-gray-700">
            Stay updated with the latest articles, share your experiences, and become part 
            of a growing community dedicated to excellence in catfish farming.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;