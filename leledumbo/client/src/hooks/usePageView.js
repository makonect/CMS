import { useEffect } from 'react';
import axios from 'axios';

export const usePageView = (pageTitle, website = 'leledumbo') => {
  useEffect(() => {
    const trackView = async () => {
      try {
        await axios.post('/api/traffic/track', {
          website,
          pageUrl: window.location.pathname,
          pageTitle
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackView();
  }, [pageTitle, website]);
};