import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArticleForm from '../components/Articles/ArticleForm';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`/api/articles/${id}`);
        setArticle(response.data);
      } catch (error) {
        console.error('Error fetching article:', error);
        alert('Error loading article. Please try again.');
        navigate('/articles');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await axios.put(`/api/articles/${id}`, formData);
      navigate('/articles');
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Error updating article. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Article Not Found</h2>
        <button
          onClick={() => navigate('/articles')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Edit Article</h1>
        <p className="text-gray-600">Update your catfish article content and settings</p>
      </div>

      <ArticleForm 
        onSubmit={handleSubmit}
        loading={submitting}
        initialData={article}
      />
    </div>
  );
};

export default EditArticle;