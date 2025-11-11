import React from 'react';
import { Link } from 'react-router-dom';

const FeaturedArticle = ({ article }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {article.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={article.featuredImage} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
              Featured
            </span>
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {article.categories.map(category => (
            <span 
              key={category}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          <Link 
            to={`/article/${article._id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {article.title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.content.substring(0, 200)}...
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {new Date(article.createdAt).toLocaleDateString()}
          </span>
          <Link 
            to={`/article/${article._id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Read more
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedArticle;