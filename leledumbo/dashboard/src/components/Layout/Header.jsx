import React from 'react';
import { useWebsite } from '../../contexts/WebsiteContext';

const Header = () => {
  const { currentWebsite, websites, changeWebsite, loading } = useWebsite();

  // Get website icon based on name
  const getWebsiteIcon = (websiteName) => {
    if (!websiteName) return '🌐';
    const name = websiteName.toLowerCase();
    if (name.includes('lele') || name.includes('dumbo')) return '🐟';
    if (name.includes('rumana') || name.includes('bastala')) return '🌱';
    return '🌐';
  };

  const handleWebsiteChange = (event) => {
    const websiteName = event.target.value;
    if (websiteName) {
      changeWebsite(websiteName);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getWebsiteIcon(currentWebsite?.name)}</span>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {currentWebsite?.name || 'Multi-Site CMS'}
            </h1>
            <p className="text-sm text-gray-600">
              {currentWebsite?.domain || 'Content Management System'}
            </p>
            {currentWebsite?.themeColor && (
              <div className="flex items-center space-x-1 mt-1">
                <div 
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ 
                    background: currentWebsite.themeColor.includes(',') 
                      ? `linear-gradient(135deg, ${currentWebsite.themeColor})`
                      : currentWebsite.themeColor
                  }}
                ></div>
                <span className="text-xs text-gray-500">Theme</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Website Dropdown Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="website-select" className="text-sm font-medium text-gray-700">
              Website:
            </label>
            <select
              id="website-select"
              value={currentWebsite?.name || ''}
              onChange={handleWebsiteChange}
              disabled={loading || websites.length === 0}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <option value="">Loading websites...</option>
              ) : websites.length === 0 ? (
                <option value="">No websites available</option>
              ) : (
                <>
                  <option value="">Select a website</option>
                  {websites.map((website) => (
                    <option key={website._id} value={website.name}>
                      {website.name} ({website.domain})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Welcome, Admin
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">A</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;