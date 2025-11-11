import React from 'react';
import { Link } from 'react-router-dom';

const ArticleCard = ({ article }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300">
      {article.featuredImage && (
        <img 
          src={article.featuredImage} 
          alt={article.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {article.categories.map(category => (
            <span 
              key={category}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link 
            to={`/article/${article._id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {article.title}
          </Link>
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {article.content.substring(0, 150)}...
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          <Link 
            to={`/article/${article._id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;