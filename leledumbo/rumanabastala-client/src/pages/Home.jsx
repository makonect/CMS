import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import FeaturedArticle from '../components/Articles/FeaturedArticle';
import ArticleList from '../components/Articles/ArticleList';
import AdBanner from '../components/Ads/AdBanner';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Home = () => {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const [featuredResponse, latestResponse] = await Promise.all([
          axios.get('/api/articles?website=rumanabastala&featured=true&status=published&limit=3'),
          axios.get('/api/articles?website=rumanabastala&status=published&limit=10&sort=-createdAt')
        ]);
        
        // Extract articles array from response
        setFeaturedArticles(featuredResponse.data.articles || []);
        setLatestArticles(latestResponse.data.articles || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setFeaturedArticles([]);
        setLatestArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Featured Articles Section */}
      <section>
        <h2 className="text-3xl font-bold text-green-900 mb-6 border-b-2 border-green-200 pb-2">
          Featured Articles
        </h2>
        {featuredArticles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredArticles.map(article => (
              <FeaturedArticle key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <p className="text-gray-600">No featured articles yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Between Posts Ad */}
      <AdBanner position="between-posts" />

      {/* Latest Articles Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-green-900 border-b-2 border-green-200 pb-2">
            Latest News
          </h2>
          <Link 
            to="/search" 
            className="text-green-600 hover:text-green-800 font-semibold text-sm"
          >
            View All →
          </Link>
        </div>
        
        <ArticleList articles={latestArticles} />
      </section>

      {/* In-Article Ad */}
      <AdBanner position="in-article" />
    </div>
  );
};

// Add this default export
export default Home;