import React from 'react';
import ArticleCard from './ArticleCard';

const ArticleList = ({ articles }) => {
  // Handle case where articles is an object with articles array
  const articlesArray = Array.isArray(articles) ? articles : (articles?.articles || []);
  
  if (!articlesArray || articlesArray.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No articles found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articlesArray.map(article => (
        <ArticleCard key={article._id} article={article} />
      ))}
    </div>
  );
};

export default ArticleList;