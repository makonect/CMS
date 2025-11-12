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
      console.log('Submitting article data:', articleData);
      console.log('Categories being sent:', articleData.categories);
      console.log('Website being sent:', articleData.website);
      
      // Make sure we're sending the data in the correct format
      const response = await axios.post('/api/articles', articleData);
      
      console.log('Article created successfully:', response.data);
      alert('Article created successfully!');
      navigate('/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Full error details:', error.response);
        alert(`Error creating article: ${error.response.data.error || 'Unknown error'}`);
      } else {
        alert('Error creating article. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Create New Article</h1>
        <p className="text-gray-600">Create a new article with AI assistance</p>
      </div>

      <ArticleForm 
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default CreateArticle;