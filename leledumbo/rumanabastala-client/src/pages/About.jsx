import React from 'react';
import { usePageView } from '../hooks/usePageView';

const About = () => {
  usePageView('About - Rumana Bastala', 'rumanabastala');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-900 mb-4">About Rumana Bastala</h1>
        <p className="text-xl text-gray-600">Empowering farmers through knowledge and innovation</p>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Our Vision</h2>
          <p className="text-gray-700 mb-6">
            Rumana Bastala is committed to advancing agricultural practices through 
            knowledge sharing, technological innovation, and community engagement. 
            We believe that sustainable agriculture is key to food security and 
            environmental conservation.
          </p>
          
          <p className="text-gray-700">
            Our platform serves as a bridge between traditional farming wisdom and 
            modern agricultural technologies, helping farmers adapt to changing 
            conditions while maintaining sustainable practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-3">Our Focus Areas</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Sustainable farming practices</li>
              <li>• Crop management techniques</li>
              <li>• Agricultural technology adoption</li>
              <li>• Market insights and trends</li>
              <li>• Environmental conservation</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">What We Provide</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Research-based agricultural guidance</li>
              <li>• Latest farming innovations</li>
              <li>• Expert interviews and case studies</li>
              <li>• Practical farming solutions</li>
              <li>• Community knowledge sharing</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Commitment</h2>
          <p className="text-gray-700 mb-4">
            At Rumana Bastala, we are dedicated to supporting farmers at every stage 
            of their journey. From small-scale family farms to large agricultural 
            enterprises, we provide resources that help improve productivity, 
            sustainability, and profitability.
          </p>
          <p className="text-gray-700">
            Join us in building a future where agriculture thrives through innovation, 
            sustainability, and shared knowledge.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;