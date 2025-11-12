import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ArticleForm from '../components/Articles/ArticleForm';

const EditArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch article data when component mounts
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setFetchLoading(true);
        console.log('Fetching article with ID:', id);
        
        const response = await axios.get(`/api/articles/${id}`);
        
        console.log('Article data fetched:', response.data);
        setArticle(response.data);
      } catch (error) {
        console.error('Error fetching article:', error);
        if (error.response) {
          console.error('Server response:', error.response.data);
          alert(`Error loading article: ${error.response.data.error || 'Unknown error'}`);
        } else {
          alert('Error loading article. Please try again.');
        }
        navigate('/articles');
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, navigate]);

  const handleSubmit = async (articleData) => {
    try {
      setLoading(true);
      console.log('Updating article data:', articleData);
      
      const response = await axios.put(`/api/articles/${id}`, articleData);
      
      console.log('Article updated successfully:', response.data);
      alert('Article updated successfully!');
      navigate('/articles');
    } catch (error) {
      console.error('Error updating article:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        alert(`Error updating article: ${error.response.data.error || 'Unknown error'}`);
      } else {
        alert('Error updating article. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading article...</div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Article not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Article</h1>
        <p className="text-gray-600">Edit your article with AI assistance</p>
      </div>

      <ArticleForm 
        onSubmit={handleSubmit}
        loading={loading}
        initialData={article}
      />
    </div>
  );
};

export default EditArticle;