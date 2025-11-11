import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Get all articles and extract unique categories
        const response = await api.get('/articles?status=published&limit=1000');
        const articles = response.data.articles || [];
        
        // Extract and deduplicate categories
        const allCategories = articles.flatMap(article => article.categories || []);
        const uniqueCategories = [...new Set(allCategories)].sort();
        
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

// Hook to get popular categories (most used)
export const usePopularCategories = (limit = 6) => {
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/articles?status=published&limit=1000');
        const articles = response.data.articles || [];
        
        // Count category occurrences
        const categoryCount = {};
        articles.forEach(article => {
          (article.categories || []).forEach(category => {
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          });
        });
        
        // Sort by count and take top N
        const sorted = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, limit)
          .map(([category]) => category);
        
        setPopularCategories(sorted);
      } catch (error) {
        console.error('Error fetching popular categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCategories();
  }, [limit]);

  return { popularCategories, loading };
};