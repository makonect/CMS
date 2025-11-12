import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import AIGenerator from '../AI/AIGenerator';
import { useWebsite } from '../../contexts/WebsiteContext';
import { useNavigate } from 'react-router-dom';

const ArticleForm = ({ onSubmit, loading, initialData }) => {
  const { currentWebsite } = useWebsite();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categories: [],
    featuredImage: '',
    status: 'draft',
    isFeatured: false,
    website: currentWebsite?._id || '',
    ...initialData
  });

  const [existingCategories, setExistingCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);

  // Simple Quill configuration without custom image handler
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link', 'image'
  ];

  // Update form data when currentWebsite changes
  useEffect(() => {
    if (currentWebsite) {
      setFormData(prev => ({
        ...prev,
        website: currentWebsite._id // CHANGE: Use ID instead of name
      }));
      fetchExistingCategories();
    }
  }, [currentWebsite]);

  // Fix categories when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && initialData.categories) {
      // Convert category objects to IDs if needed
      const fixedCategories = initialData.categories.map(cat => {
        if (typeof cat === 'object' && cat._id) {
          return cat._id;
        }
        return cat;
      });
      
      setFormData(prev => ({
        ...prev,
        categories: fixedCategories
      }));
    }
  }, [initialData]);

  // Fetch categories for the current website
  const fetchExistingCategories = async () => {
    if (!currentWebsite) return;
    
    setCategoryLoading(true);
    try {
      console.log('Fetching categories for website:', currentWebsite._id);
      const response = await axios.get(`/api/websites/${currentWebsite._id}/categories`);
      
      console.log('Categories API response:', response.data);
      
      if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
        setExistingCategories(response.data.categories);
        console.log('Categories loaded:', response.data.categories);
      } else {
        console.log('No categories found, using fallback');
        // Try alternative API endpoint
        try {
          const altResponse = await axios.get(`/api/categories?website=${currentWebsite._id}`);
          if (altResponse.data && Array.isArray(altResponse.data)) {
            setExistingCategories(altResponse.data);
            console.log('Categories loaded from alternative endpoint:', altResponse.data);
          } else {
            // Create default categories if none exist
            await createDefaultCategories();
          }
        } catch (altError) {
          console.error('Alternative categories fetch failed:', altError);
          // Create default categories if none exist
          await createDefaultCategories();
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Create default categories if none exist
      await createDefaultCategories();
    } finally {
      setCategoryLoading(false);
    }
  };

  // Create default categories for the website
  const createDefaultCategories = async () => {
    if (!currentWebsite) return;
    
    const defaultCategories = getDefaultCategories(currentWebsite.name);
    
    try {
      console.log('Creating default categories for:', currentWebsite.name);
      
      // Create categories one by one
      const createdCategories = [];
      for (const category of defaultCategories) {
        try {
          const response = await axios.post(`/api/websites/${currentWebsite._id}/category`, {
            name: category.name,
            description: `Default ${category.name} category`
          });
          if (response.data && response.data.category) {
            createdCategories.push(response.data.category);
          }
        } catch (catError) {
          console.error(`Error creating category ${category.name}:`, catError);
        }
      }
      
      if (createdCategories.length > 0) {
        setExistingCategories(createdCategories);
        console.log('Default categories created:', createdCategories);
      } else {
        // If we can't create categories, use the fallback ones
        setExistingCategories(defaultCategories);
        console.log('Using fallback categories:', defaultCategories);
      }
    } catch (error) {
      console.error('Error creating default categories:', error);
      // Use fallback categories as last resort
      setExistingCategories(defaultCategories);
    }
  };

  // Default categories fallback (with proper structure)
  const getDefaultCategories = (website) => {
    if (website === 'leledumbo') {
      return [
        { _id: 'default-leledumbo-1', name: 'Budidaya Lele' },
        { _id: 'default-leledumbo-2', name: 'Pakan Ikan' },
        { _id: 'default-leledumbo-3', name: 'Kolam Lele' },
        { _id: 'default-leledumbo-4', name: 'Penyakit Ikan' },
        { _id: 'default-leledumbo-5', name: 'Bisnis Lele' }
      ];
    } else {
      return [
        { _id: 'default-rumanabastala-1', name: 'Pertanian Organik' },
        { _id: 'default-rumanabastala-2', name: 'Budidaya Tanaman' },
        { _id: 'default-rumanabastala-3', name: 'Pupuk Alami' },
        { _id: 'default-rumanabastala-4', name: 'Hama Tanaman' },
        { _id: 'default-rumanabastala-5', name: 'Teknologi Pertanian' }
      ];
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'categories') {
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
        let imageUrl = response.data.images.original;
        // Fix the URL if it's relative - prepend backend URL
        if (!imageUrl.startsWith('http')) {
          imageUrl = `http://localhost:3001${imageUrl}`;
        }
        
        setFormData(prev => ({
          ...prev,
          featuredImage: imageUrl
        }));
      }
    } catch (error) {
      console.error('Error uploading featured image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if onSubmit is a function
    if (typeof onSubmit !== 'function') {
      console.error('onSubmit is not a function:', onSubmit);
      alert('Form submission error: onSubmit function not available');
      return;
    }
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    const cleanContent = formData.content.replace(/<p><br><\/p>/g, '').trim();
    if (!cleanContent || cleanContent === '<p></p>') {
      alert('Please enter article content');
      return;
    }
    
    if (formData.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    
    console.log('Submitting form data:', formData);
    console.log('Selected categories:', formData.categories);
    console.log('Available categories:', existingCategories);
    
    onSubmit(formData);
  };

  const handleAIContent = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  // Get category name by ID for display
  const getCategoryName = (categoryId) => {
    // Handle case where categoryId might be an object
    if (typeof categoryId === 'object' && categoryId._id) {
      return categoryId.name || `Unknown (${categoryId._id})`;
    }
    
    const category = existingCategories.find(cat => cat._id === categoryId);
    return category ? category.name : `Unknown (${categoryId})`;
  };

  // Get clean category ID (in case it's an object)
  const getCleanCategoryId = (categoryId) => {
    if (typeof categoryId === 'object' && categoryId._id) {
      return categoryId._id;
    }
    return categoryId;
  };

  // Add a new category on the fly
  const handleAddNewCategory = async (categoryName) => {
    if (!categoryName.trim() || !currentWebsite) return;
    
    try {
      const response = await axios.post(`/api/websites/${currentWebsite._id}/category`, {
        name: categoryName.trim(),
        description: ''
      });
      
      if (response.status === 201) {
        // Refresh categories list
        fetchExistingCategories();
        // Add the new category to selected categories
        setFormData(prev => ({
          ...prev,
          categories: [...prev.categories, response.data.category._id]
        }));
      }
    } catch (error) {
      console.error('Error adding new category:', error);
      alert('Error adding new category');
    }
  };

  // If no current website, show message
  if (!currentWebsite) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700">Please select a website first to create an article.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 gap-6">
        {/* Current Website Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Website</label>
          <div className="px-3 py-2 bg-gray-100 rounded-md border border-gray-300">
            <div className="flex items-center space-x-2">
              {currentWebsite?.logo && (
                <img 
                  src={currentWebsite.logo} 
                  alt={`${currentWebsite.name} logo`}
                  className="w-6 h-6 object-cover rounded"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <span className="text-sm font-medium text-gray-800">
                {currentWebsite?.name || 'No website selected'}
              </span>
            </div>
          </div>
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

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories *
            {categoryLoading && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
          </label>
          
          {existingCategories.length === 0 && !categoryLoading ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-3">
              <p className="text-yellow-700 text-sm">
                No categories found for this website. Please add categories first or try refreshing the page.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <select
                  name="categories"
                  multiple
                  value={formData.categories.map(cat => getCleanCategoryId(cat))}
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
              
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-2">
                  Selected categories: {formData.categories.length}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map(categoryId => (
                    <span key={getCleanCategoryId(categoryId)} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {getCategoryName(categoryId)}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(getCleanCategoryId(categoryId))}
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
            </>
          )}

          {/* Quick Add Category (Optional) */}
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">Quick Add Category (if needed):</label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="newCategory"
                placeholder="New category name"
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('newCategory');
                  if (input.value.trim()) {
                    handleAddNewCategory(input.value);
                    input.value = '';
                  }
                }}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image (Optional)</label>
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
                onError={(e) => {
                  console.error('Featured image failed to load:', formData.featuredImage);
                  e.target.style.display = 'none';
                  // Show error message
                  const parent = e.target.parentElement;
                  const errorMsg = document.createElement('div');
                  errorMsg.className = 'text-red-500 text-sm';
                  errorMsg.textContent = 'Image failed to load. Please re-upload.';
                  parent.appendChild(errorMsg);
                }}
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
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <ReactQuill
              value={formData.content}
              onChange={handleContentChange}
              modules={modules}
              formats={formats}
              theme="snow"
              placeholder="Start writing your article here..."
              style={{ 
                height: '300px',
                border: 'none'
              }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Use the toolbar to format your text. For images, upload them as featured image above or use image URLs.
          </div>
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-gray-200">
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
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate('/articles')}
          className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading || existingCategories.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : initialData ? 'Update Article' : 'Save Article'}
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;