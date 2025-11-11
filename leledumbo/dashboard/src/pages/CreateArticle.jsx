import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArticleForm from '../components/Articles/ArticleForm';

const CreateArticle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (articleData) => {
    try {
      setLoading(true);
      await axios.post('/api/articles', articleData);
      navigate('/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Error creating article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Create New Article</h1>
        <p className="text-gray-600">Create a new catfish article with AI assistance</p>
      </div>

      <ArticleForm 
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default CreateArticle;