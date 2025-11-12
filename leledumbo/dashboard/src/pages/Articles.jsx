import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWebsite } from '../contexts/WebsiteContext';
import ArticleTable from '../components/Articles/ArticleTable';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentWebsite } = useWebsite();

  useEffect(() => {
    if (currentWebsite) {
      fetchArticles();
    } else {
      setLoading(false);
    }
  }, [currentWebsite]);

  const fetchArticles = async () => {
    if (!currentWebsite) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use website name for API call
      const websiteParam = currentWebsite.name;
      const response = await fetch(`/api/articles?website=${encodeURIComponent(websiteParam)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched articles:', data);
        setArticles(data);
      } else {
        console.error('Failed to fetch articles:', response.status);
        setError(`Failed to load articles: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Network error: Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await fetch(`/api/articles/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchArticles();
        } else {
          console.error('Failed to delete article');
          alert('Failed to delete article');
        }
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Error deleting article');
      }
    }
  };

  if (!currentWebsite) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Please select a website first from the header dropdown.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Articles</h1>
          <Link
            to="/articles/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create New Article
          </Link>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading articles for {currentWebsite.name}...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Articles</h1>
          <Link
            to="/articles/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create New Article
          </Link>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={fetchArticles}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Articles</h1>
          <p className="text-gray-600 mt-1">Managing articles for: {currentWebsite.name}</p>
        </div>
        <Link
          to="/articles/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Create New Article
        </Link>
      </div>

      {/* Replace the entire table section with ArticleTable component */}
      <ArticleTable 
        articles={articles} 
        onDelete={deleteArticle} 
      />
    </div>
  );
};

export default Articles;