import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WebsiteProvider } from './contexts/WebsiteContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ArticleForm from './components/Articles/ArticleForm';
import WebsiteSettings from './pages/WebsiteSettings';
import WebsiteManagement from './pages/WebsiteSettings';
import AISettings from './pages/AISettings';
import Analytics from './pages/Analytics';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app start
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('selectedWebsite');
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <WebsiteProvider>
      <Router>
        {isAuthenticated ? (
          <DashboardLayout onLogout={handleLogout}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/create" element={<ArticleForm />} />
              <Route path="/articles/edit/:id" element={<ArticleForm />} />
              <Route path="/website-settings" element={<WebsiteSettings />} />
              <Route path="/website-management" element={<WebsiteManagement />} />
              <Route path="/ai-settings" element={<AISettings />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Router>
    </WebsiteProvider>
  );
}

export default App;