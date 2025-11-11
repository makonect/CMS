import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import AIGenerator from '../AI/AIGenerator';

const ArticleForm = ({ onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    content: '',
    categories: [],
    featuredImage: '',
    status: 'draft',
    isFeatured: false,
    website: 'leledumbo'
  });

  const [existingCategories, setExistingCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // Simple Quill editor modules (reduced to avoid issues)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link', 'image'
  ];

  // Simple image handler
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        await uploadImageToEditor(file);
      }
    };
  };

  const uploadImageToEditor = async (file) => {
    if (!file.type.match('image.*')) {
      alert('Only images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await axios.post('/api/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const quill = editorRef.current?.getEditor();
        const range = quill?.getSelection();
        quill?.insertEmbed(range?.index || 0, 'image', response.data.images.original);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchExistingCategories();
  }, [formData.website]);

  // Fetch all categories for the current website
  // Fetch all categories for the current website
const fetchExistingCategories = async () => {
  setCategoryLoading(true);
  try {
    const token = localStorage.getItem('token');
    
    // First, get the website ID based on the website name
    const websitesResponse = await axios.get('/api/websites');
    const currentWebsite = websitesResponse.data.find(w => w.name === formData.website);
    
    if (!currentWebsite) {
      console.error('❌ Website not found:', formData.website);
      const fallbackCategories = getDefaultCategories(formData.website);
      setExistingCategories(fallbackCategories);
      return;
    }
    
    console.log('🔄 Fetching categories for website ID:', currentWebsite.name);
    
    const response = await axios.get(`/api/categories/website/${currentWebsite._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📦 Categories API Response:', {
      status: response.status,
      data: response.data,
      count: response.data?.length || 0
    });
    
    if (response.data && Array.isArray(response.data)) {
      console.log('✅ Setting categories:', response.data.length);
      setExistingCategories(response.data);
    } else {
      console.error('❌ Unexpected response format:', response.data);
      const fallbackCategories = getDefaultCategories(formData.website);
      console.log('🔄 Using fallback categories:', fallbackCategories);
      setExistingCategories(fallbackCategories);
    }
  } catch (error) {
    console.error('💥 Error fetching categories from API:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    const fallbackCategories = getDefaultCategories(formData.website);
    console.log('🔄 Using error fallback categories:', fallbackCategories);
    setExistingCategories(fallbackCategories);
  } finally {
    setCategoryLoading(false);
  }
};

  // Default categories fallback
  const getDefaultCategories = (website) => {
    if (website === 'leledumbo') {
      return [
        { _id: 'cat-leledumbo-1', name: 'Budidaya Lele' },
        { _id: 'cat-leledumbo-2', name: 'Pakan Ikan' },
        { _id: 'cat-leledumbo-3', name: 'Kolam Lele' },
        { _id: 'cat-leledumbo-4', name: 'Penyakit Ikan' },
        { _id: 'cat-leledumbo-5', name: 'Bisnis Lele' }
      ];
    } else {
      return [
        { _id: 'cat-rumanabastala-1', name: 'Pertanian Organik' },
        { _id: 'cat-rumanabastala-2', name: 'Budidaya Tanaman' },
        { _id: 'cat-rumanabastala-3', name: 'Pupuk Alami' },
        { _id: 'cat-rumanabastala-4', name: 'Hama Tanaman' },
        { _id: 'cat-rumanabastala-5', name: 'Teknologi Pertanian' }
      ];
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'categories') {
      // Handle multiple select for categories
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({
        ...prev,
        categories: selectedOptions
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleContentChange = (content) => {
    console.log('Content changed:', content);
    setFormData(prev => ({ ...prev, content }));
  };

  const handleRemoveCategory = (categoryIdToRemove) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(catId => catId !== categoryIdToRemove)
    }));
  };

  const handleFeaturedImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Only images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await axios.post('/api/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          featuredImage: response.data.images.original
        }));
      }
    } catch (error) {
      console.error('Error uploading featured image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    const cleanContent = formData.content.replace(/<p><br><\/p>/g, '').trim();
    if (!cleanContent) {
      alert('Please enter article content');
      return;
    }
    
    if (formData.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    
    // Submit the form data
    onSubmit(formData);
  };

  const handleAIContent = (content) => {
    console.log('AI Content received:', content);
    setFormData(prev => ({ ...prev, content }));
  };

  // Get category name by ID for display
  const getCategoryName = (categoryId) => {
    const category = existingCategories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 gap-6">
        {/* Website Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <select
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="leledumbo">🐟 LeleDumbo (Catfish)</option>
            <option value="rumanabastala">🌱 Rumana Bastala (Agriculture)</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter article title"
          />
        </div>

        {/* Categories - Multiple Select Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories *
            {categoryLoading && <span className="ml-2 text-sm text-gray-500">Loading categories...</span>}
          </label>
          
          {/* Multiple Select Dropdown */}
          <div className="mb-3">
            <select
              name="categories"
              multiple
              value={formData.categories}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
              size="5"
            >
              {existingCategories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Hold Ctrl (or Cmd on Mac) to select multiple categories
            </div>
          </div>
          
          {/* Selected Categories Display */}
          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-2">
              Selected categories: {formData.categories.length}
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.categories.map(categoryId => (
                <span key={categoryId} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getCategoryName(categoryId)}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(categoryId)}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {formData.categories.length === 0 && (
                <span className="text-sm text-gray-500">No categories selected</span>
              )}
            </div>
          </div>
        </div>

        {/* Featured Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="url"
              name="featuredImage"
              value={formData.featuredImage}
              onChange={handleChange}
              placeholder="Image URL or upload below"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
              {uploading ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageUpload}
                className="hidden"
                ref={fileInputRef}
              />
            </label>
          </div>
          {formData.featuredImage && (
            <div className="mt-2">
              <img 
                src={formData.featuredImage} 
                alt="Featured preview" 
                className="h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>

        {/* AI Generator */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">AI Content Generator</label>
          <AIGenerator onContentGenerated={handleAIContent} />
        </div>

        {/* Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Article Content *</label>
          <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
            <ReactQuill
              ref={editorRef}
              value={formData.content}
              onChange={handleContentChange}
              modules={modules}
              formats={formats}
              theme="snow"
              style={{ 
                height: '400px',
                border: 'none'
              }}
              className="react-quill-editor"
            />
          </div>
          {(!formData.content.trim() || formData.content === '<p><br></p>') && (
            <div className="text-sm text-red-600 mt-1">
              Article content is required
            </div>
          )}
          {uploading && (
            <div className="mt-2 text-sm text-blue-600">
              Uploading image...
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Featured Article</label>
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-700">Status:</label>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={formData.status === 'draft'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label className="text-sm text-gray-700">Draft</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                value="published"
                checked={formData.status === 'published'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label className="text-sm text-gray-700">Published</label>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : 'Save Article'}
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;