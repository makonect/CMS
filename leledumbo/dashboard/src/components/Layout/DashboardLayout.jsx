import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWebsite } from '../../contexts/WebsiteContext';

const DashboardLayout = ({ children, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();
  const { currentWebsite, changeWebsite, websites, refreshWebsites } = useWebsite();

  useEffect(() => {
    // Set active tab based on current route
    const path = location.pathname;
    if (path.includes('/articles')) setActiveTab('articles');
    else if (path.includes('/website-settings')) setActiveTab('websites');
    else if (path.includes('/ai-settings')) setActiveTab('ai');
    else if (path.includes('/analytics')) setActiveTab('analytics');
    else setActiveTab('dashboard');
  }, [location]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleWebsiteChange = (websiteName) => {
    console.log('Changing website to:', websiteName);
    if (changeWebsite) {
      changeWebsite(websiteName);
    }
    // Force refresh of the current page to update all components
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">CMS Dashboard</h1>
            <div className="flex items-center space-x-4">
              {/* Website Selector */}
              {websites && websites.length > 0 && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Website:</label>
                  <select
                    value={currentWebsite?.name || ''}
                    onChange={(e) => handleWebsiteChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {websites.map((website) => (
                      <option key={website._id} value={website.name}>
                        {website.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/articles"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'articles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Article Management
            </Link>
            <Link
              to="/website-settings"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'websites'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Website Management
            </Link>
            <Link
              to="/ai-settings"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Settings
            </Link>
            <Link
              to="/analytics"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;