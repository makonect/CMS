import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import SocialShare from '../components/UI/SocialShare';
import AdBanner from '../components/Ads/AdBanner';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        const [articleResponse, relatedResponse] = await Promise.all([
          axios.get(`/api/articles/${id}`),
          axios.get(`/api/articles/related/${id}`)
        ]);
        
        setArticle(articleResponse.data);
        setRelatedArticles(relatedResponse.data);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticleData();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Article Not Found</h2>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Article Header */}
      <header className="mb-8">
        {article.featuredImage && (
          <img 
            src={article.featuredImage} 
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
          />
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {article.categories.map(category => (
            <Link
              key={category}
              to={`/category/${category.toLowerCase()}`}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
        
        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Published on {new Date(article.createdAt).toLocaleDateString()}
            </span>
            {article.aiGenerated && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                AI Assisted
              </span>
            )}
          </div>
          
          <SocialShare 
            title={article.title}
            url={window.location.href}
          />
        </div>
      </header>

      {/* In-Article Ad */}
      <AdBanner position="in-article" />

      {/* Article Content */}
      <div className="prose prose-lg max-w-none mb-8">
        <div 
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: article.content.replace(/\n/g, '<br />') 
          }}
        />
      </div>

      {/* Between Posts Ad */}
      <AdBanner position="between-posts" />

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedArticles.slice(0, 4).map(relatedArticle => (
              <div key={relatedArticle._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                {relatedArticle.featuredImage && (
                  <img 
                    src={relatedArticle.featuredImage} 
                    alt={relatedArticle.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-lg mb-2">
                    <Link 
                      to={`/article/${relatedArticle._id}`}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {relatedArticle.title}
                    </Link>
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {relatedArticle.content.substring(0, 100)}...
                  </p>
                  <Link 
                    to={`/article/${relatedArticle._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default ArticleDetail;