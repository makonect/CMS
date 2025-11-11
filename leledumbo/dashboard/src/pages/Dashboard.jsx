import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWebsite } from '../contexts/WebsiteContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    featuredArticles: 0,
    todayViews: 0,
    totalViews: 0
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const { currentWebsite } = useWebsite();

  useEffect(() => {
    if (currentWebsite) {
      fetchStats();
    }
  }, [selectedDate, currentWebsite]);

  const fetchStats = async () => {
    if (!currentWebsite) return;
    
    try {
      setLoading(true);
      
      // Use website name for API calls
      const websiteParam = currentWebsite.name || currentWebsite._id;
      
      const [articlesResponse, viewsResponse] = await Promise.all([
        fetch(`/api/articles?website=${websiteParam}`).then(res => {
          if (!res.ok) throw new Error('Articles fetch failed');
          return res.json();
        }).catch(() => []), // Return empty array on error
        
        fetch(`/api/analytics/views?date=${selectedDate}&website=${websiteParam}`).then(res => {
          if (!res.ok) throw new Error('Analytics fetch failed');
          return res.json();
        }).catch(() => ({ todayViews: 0, totalViews: 0 })) // Return default on error
      ]);

      const articles = articlesResponse || [];
      const viewsData = viewsResponse || { todayViews: 0, totalViews: 0 };

      const totalArticles = articles.length;
      const publishedArticles = articles.filter(a => a.status === 'published').length;
      const draftArticles = articles.filter(a => a.status === 'draft').length;
      const featuredArticles = articles.filter(a => a.isFeatured).length;

      setStats({
        totalArticles,
        publishedArticles,
        draftArticles,
        featuredArticles,
        todayViews: viewsData.todayViews || 0,
        totalViews: viewsData.totalViews || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        featuredArticles: 0,
        todayViews: 0,
        totalViews: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Articles', 
      value: stats.totalArticles, 
      color: 'blue',
      icon: '📝'
    },
    { 
      label: 'Published', 
      value: stats.publishedArticles, 
      color: 'green',
      icon: '✅'
    },
    { 
      label: 'Drafts', 
      value: stats.draftArticles, 
      color: 'yellow',
      icon: '📄'
    },
    { 
      label: 'Featured', 
      value: stats.featuredArticles, 
      color: 'purple',
      icon: '⭐'
    },
    { 
      label: "Today's Views", 
      value: stats.todayViews, 
      color: 'orange',
      icon: '👁️'
    },
    { 
      label: 'Total Views', 
      value: stats.totalViews, 
      color: 'red',
      icon: '📊'
    },
  ];

  const getColorClass = (color) => {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      red: 'text-red-600'
    };
    return colorMap[color] || 'text-gray-600';
  };

  if (!currentWebsite) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-700">Please select a website to view statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome to your multi-site CMS dashboard</p>
          <p className="text-sm text-blue-600 mt-1">
            Managing: <strong>{currentWebsite.name}</strong>
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">View Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading statistics...</div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map(stat => (
              <div key={stat.label} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className={`text-3xl font-bold ${getColorClass(stat.color)} mt-2`}>
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/articles/create"
                  className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Create New Article
                </Link>
                <Link
                  to="/articles"
                  className="block w-full px-4 py-3 bg-gray-600 text-white text-center rounded-md hover:bg-gray-700 transition-colors font-medium"
                >
                  Manage Articles
                </Link>
                <Link
                  to="/ai-settings"
                  className="block w-full px-4 py-3 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  AI Settings
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <div>
                      <p className="font-medium">System Ready</p>
                      <p className="text-sm text-gray-500">All services are running</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Just now</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-500 text-xl">📝</span>
                    <div>
                      <p className="font-medium">Articles Loaded</p>
                      <p className="text-sm text-gray-500">{stats.totalArticles} articles in system</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Today</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;