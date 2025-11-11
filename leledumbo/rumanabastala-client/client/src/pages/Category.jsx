import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ArticleList from '../components/Articles/ArticleList';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import AdBanner from '../components/Ads/AdBanner';

const Category = () => {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/articles?category=${category}&status=published`);
        setArticles(response.data.articles || []);
      } catch (error) {
        console.error('Error fetching category articles:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryArticles();
  }, [category]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 capitalize mb-2">
          {category} Articles
        </h1>
        <p className="text-gray-600 text-lg">
          Explore our latest articles about {category}
        </p>
        <div className="mt-4 text-sm text-gray-500">
          {articles.length} article{articles.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Between Posts Ad */}
      <AdBanner position="between-posts" />

      <ArticleList articles={articles} />

      {/* Footer Ad */}
      <AdBanner position="footer" />
    </div>
  );
};

export default Category;