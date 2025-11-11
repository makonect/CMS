import React, { useState } from 'react';
import { usePageView } from '../hooks/usePageView';
import axios from 'axios';

const Contact = () => {
  usePageView('Contact - LeleDumbo', 'leledumbo');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/api/contact/submit', {
        ...formData,
        website: 'LeleDumbo'
      });

      if (response.data.success) {
        setResult({ type: 'success', message: response.data.message });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setResult({ type: 'error', message: response.data.error });
      }
    } catch (error) {
      setResult({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to send message. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600">Get in touch with the LeleDumbo team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">Send us a Message</h2>
          
          {result && (
            <div className={`p-4 rounded-lg mb-6 ${
              result.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {result.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What is this regarding?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us how we can help you..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">Get in Touch</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-lg">📍</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Our Focus</h3>
                <p className="text-gray-600">
                  Catfish farming expertise, aquaculture innovation, and sustainable fishing practices across Indonesia.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-lg">💬</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Expert Support</h3>
                <p className="text-gray-600">
                  Our team of aquaculture experts is ready to help with your catfish farming questions and challenges.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-lg">⏱️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Response Time</h3>
                <p className="text-gray-600">
                  We typically respond to all inquiries within 24-48 hours during business days.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Common Topics</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Catfish breeding techniques</li>
                <li>• Pond management advice</li>
                <li>• Disease prevention and treatment</li>
                <li>• Equipment recommendations</li>
                <li>• Business and marketing guidance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;