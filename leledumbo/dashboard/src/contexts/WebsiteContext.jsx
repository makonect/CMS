import React, { createContext, useContext, useState, useEffect } from 'react';

const WebsiteContext = createContext();

export const useWebsite = () => {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error('useWebsite must be used within a WebsiteProvider');
  }
  return context;
};

export const WebsiteProvider = ({ children }) => {
  const [websites, setWebsites] = useState([]);
  const [currentWebsite, setCurrentWebsite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebsites();
  }, []);

  useEffect(() => {
    // Load selected website from localStorage on app start
    const savedWebsite = localStorage.getItem('selectedWebsite');
    if (savedWebsite && websites.length > 0) {
      const website = websites.find(w => w.name === savedWebsite) || websites[0];
      setCurrentWebsite(website);
    } else if (websites.length > 0) {
      setCurrentWebsite(websites[0]);
    }
  }, [websites]);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      console.log('Fetching websites from /api/websites...');
      const response = await fetch('/api/websites');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Websites loaded:', data);
        setWebsites(data);
      } else {
        console.error('Failed to fetch websites:', response.status);
        setWebsites([]);
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  const changeWebsite = (websiteName) => {
    const website = websites.find(w => w.name === websiteName);
    if (website) {
      setCurrentWebsite(website);
      localStorage.setItem('selectedWebsite', websiteName);
      console.log('Website changed to:', websiteName, website);
    }
  };

  const refreshWebsites = () => {
    fetchWebsites();
  };

  const value = {
    websites,
    currentWebsite,
    changeWebsite,
    refreshWebsites,
    loading
  };

  return (
    <WebsiteContext.Provider value={value}>
      {children}
    </WebsiteContext.Provider>
  );
};