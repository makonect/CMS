import React, { useEffect } from 'react';

const AdBanner = ({ position }) => {
  useEffect(() => {
    // Only load AdSense in production
    if (import.meta.env.PROD) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    } else {
      console.log('AdSense disabled in development');
    }
  }, []);

  const getAdStyle = () => {
    switch (position) {
      case 'top':
        return 'w-full h-24';
      case 'left':
      case 'right':
        return 'w-64 h-600';
      case 'in-article':
        return 'w-full h-24 my-8';
      case 'between-posts':
        return 'w-full h-24 my-8';
      case 'footer':
        return 'w-full h-24';
      default:
        return 'w-full h-24';
    }
  };

  // Don't show ads in development
  if (!import.meta.env.PROD) {
    return (
      <div className={`ad-container ${getAdStyle()} bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300`}>
        <div className="text-gray-500 text-sm">
          Ad Space - {position}
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-container ${getAdStyle()} bg-gray-100 flex items-center justify-center`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6684655853231308"
        data-ad-slot={`${position}-banner`}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;