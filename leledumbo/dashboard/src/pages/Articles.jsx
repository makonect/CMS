import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWebsite } from '../contexts/WebsiteContext';

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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {articles.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{article.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {article.categories?.join(', ') || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <Link
                      to={`/articles/edit/${article._id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteArticle(article._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No articles found for {currentWebsite.name}. Create your first article!
            <div className="mt-4">
              <Link
                to="/articles/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-block"
              >
                Create First Article
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;