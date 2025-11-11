import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ArticleList from '../components/Articles/ArticleList';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import AdBanner from '../components/Ads/AdBanner';

const Search = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const searchArticles = async () => {
      if (!query) {
        setArticles([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`/api/articles?search=${encodeURIComponent(query)}&status=published`);
        setArticles(response.data.articles || []);
      } catch (error) {
        console.error('Error searching articles:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    searchArticles();
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">Search Results</h1>
        <p className="text-gray-600 text-lg">
          {query ? `Search results for: "${query}"` : 'Please enter a search term'}
        </p>
        {query && (
          <div className="mt-4 text-sm text-gray-500">
            {articles.length} result{articles.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {/* Between Posts Ad */}
      <AdBanner position="between-posts" />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {query && articles.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No articles found for your search.</p>
              <p className="text-gray-500 text-sm mt-2">Try different keywords or browse our categories.</p>
            </div>
          )}
          <ArticleList articles={articles} />
        </>
      )}

      {/* Footer Ad */}
      <AdBanner position="footer" />
    </div>
  );
};

export default Search;