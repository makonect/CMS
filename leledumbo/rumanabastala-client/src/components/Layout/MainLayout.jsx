import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AdBanner from '../Ads/AdBanner';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner Ad */}
      <div className="bg-blue-900">
        <div className="container mx-auto">
          <AdBanner position="top" />
        </div>
      </div>
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column Ad - Desktop only */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <AdBanner position="left" />
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
          
          {/* Right Column Ad - Desktop only */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <AdBanner position="right" />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;