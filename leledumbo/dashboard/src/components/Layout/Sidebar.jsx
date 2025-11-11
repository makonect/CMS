import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWebsite } from '../../contexts/WebsiteContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { websites, currentWebsite, changeWebsite, loading } = useWebsite();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/articles', label: 'Articles', icon: '📝' },
    { path: '/articles/create', label: 'Create Article', icon: '➕' },
    { path: '/ai-settings', label: 'AI Settings', icon: '🤖' },
    { path: '/website-settings', label: 'Website Settings', icon: '⚙️' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
  ];

  const handleWebsiteChange = (websiteId) => {
    changeWebsite(websiteId);
    
    // Get current path without query parameters
    const currentPath = location.pathname;
    
    // Navigate to the same page but with new website parameter
    navigate(`${currentPath}?website=${websiteId}`, { replace: true });
    
    // Force reload to refresh all data
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleMenuClick = (path) => {
    if (currentWebsite) {
      navigate(`${path}?website=${currentWebsite._id}`);
    } else {
      navigate(path);
    }
  };

  // Get website icon based on name
  const getWebsiteIcon = (websiteName) => {
    if (!websiteName) return '🌐';
    const name = websiteName.toLowerCase();
    if (name.includes('lele') || name.includes('dumbo')) return '🐟';
    if (name.includes('rumana') || name.includes('bastala')) return '🌱';
    return '🌐';
  };

  if (loading) {
    return (
      <div className="w-64 bg-blue-900 text-white min-h-screen p-4">
        <div className="flex items-center space-x-3 mb-4 p-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-900 font-bold text-lg">MB</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Multi-Site CMS</h2>
            <p className="text-blue-200 text-sm">Content Management</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="text-white text-sm">Loading websites...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen p-4">
      <div className="flex items-center space-x-3 mb-4 p-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <span className="text-blue-900 font-bold text-lg">MB</span>
        </div>
        <div>
          <h2 className="text-xl font-bold">Multi-Site CMS</h2>
          <p className="text-blue-200 text-sm">Content Management</p>
        </div>
      </div>

      {/* Website Selector */}
      <div className="mb-6 p-4 bg-blue-800 rounded-lg">
        <label className="block text-sm font-medium text-blue-200 mb-2">
          Select Website:
        </label>
        <select 
          value={currentWebsite?._id || ''}
          onChange={(e) => handleWebsiteChange(e.target.value)}
          className="w-full p-2 rounded bg-blue-700 text-white border border-blue-600 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
        >
          {websites.map(website => (
            <option key={website.name} value={website.name}>
              {getWebsiteIcon(website.name)} {website.name}
            </option>
          ))}
        </select>
      </div>

      <nav>
        <ul className="space-y-2">
          {menuItems.map(item => (
            <li key={item.path}>
              <button
                onClick={() => handleMenuClick(item.path)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
                  location.pathname === item.path
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Current Website Info */}
      {currentWebsite && (
        <div className="mt-8 p-4 bg-blue-800 rounded-lg">
          <p className="text-blue-200 text-sm">Current Website:</p>
          <p className="font-semibold text-lg">
            {getWebsiteIcon(currentWebsite.name)} {currentWebsite.name}
          </p>
          <p className="text-blue-300 text-xs mt-1">
            {currentWebsite.domain}
          </p>
        </div>
      )}

      {/* Logout Button */}
      <div className="mt-8 p-4">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('currentWebsiteId');
            window.location.href = '/';
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;