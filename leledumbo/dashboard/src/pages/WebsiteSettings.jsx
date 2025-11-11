import React, { useState, useEffect } from 'react';
import { useWebsite } from '../contexts/WebsiteContext';

const WebsiteSettings = () => {
  const { websites, currentWebsite, changeWebsite, refreshWebsites } = useWebsite();
  const [newWebsite, setNewWebsite] = useState({ name: '', domain: '' });
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  
  // Dual color theme state
  const [themeColors, setThemeColors] = useState({ primary: '#000000', secondary: '#ffffff' });
  const [tempThemeColors, setTempThemeColors] = useState({ primary: '#000000', secondary: '#ffffff' });
  const [themeSaving, setThemeSaving] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Load website settings when currentWebsite changes
  useEffect(() => {
    if (currentWebsite) {
      // Parse theme colors from stored format "primaryColor,secondaryColor"
      if (currentWebsite.themeColor && currentWebsite.themeColor.includes(',')) {
        const [primary, secondary] = currentWebsite.themeColor.split(',');
        setThemeColors({ primary: primary.trim(), secondary: secondary.trim() });
        setTempThemeColors({ primary: primary.trim(), secondary: secondary.trim() });
      } else {
        // Default to single color or fallback
        const defaultColors = { primary: '#000000', secondary: '#ffffff' };
        setThemeColors(defaultColors);
        setTempThemeColors(defaultColors);
      }
      fetchCategories();
    }
  }, [currentWebsite]);

  const fetchCategories = async () => {
    if (!currentWebsite) return;
    
    try {
      const response = await fetch(`/api/websites/categories/${currentWebsite._id}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateWebsite = async (e) => {
    e.preventDefault();
    if (!newWebsite.name || !newWebsite.domain) return;

    try {
      setLoading(true);
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWebsite),
      });

      if (response.ok) {
        setNewWebsite({ name: '', domain: '' });
        refreshWebsites();
        alert('Website created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to create website: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating website:', error);
      alert('Error creating website: Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebsite = async (websiteId) => {
    if (!window.confirm('Are you sure you want to delete this website?')) return;

    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        refreshWebsites();
        alert('Website deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete website: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting website:', error);
      alert('Error deleting website');
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !currentWebsite) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Recommended logo dimensions
    const recommendedDimensions = 'Recommended: 200x200px to 400x400px (Square)';

    try {
      setLogoUploading(true);
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('websiteId', currentWebsite._id);

      console.log('Uploading logo...', { websiteId: currentWebsite._id, file: file.name });

      const response = await fetch('/api/websites/logo', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Logo uploaded successfully!\n${recommendedDimensions}`);
        refreshWebsites(); // Refresh to get updated website data
      } else {
        const errorData = await response.json();
        console.error('Logo upload failed:', errorData);
        alert(`Failed to upload logo: ${errorData.error || 'Unknown error'}\n\n${recommendedDimensions}`);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert(`Error uploading logo: Network error\n\n${recommendedDimensions}`);
    } finally {
      setLogoUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleThemeColorChange = (colorType, color) => {
    setTempThemeColors(prev => ({
      ...prev,
      [colorType]: color
    }));
  };

  const handleCustomColorInput = (colorType, color) => {
    // Add # if missing
    if (!color.startsWith('#')) {
      color = '#' + color;
    }
    // Validate hex color format
    if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
      handleThemeColorChange(colorType, color);
    }
  };

  const saveThemeColors = async () => {
    if (!currentWebsite) return;

    try {
      setThemeSaving(true);
      
      // Combine colors into single string for storage: "primaryColor,secondaryColor"
      const themeColorString = `${tempThemeColors.primary},${tempThemeColors.secondary}`;
      
      console.log('Saving theme colors:', themeColorString);

      const response = await fetch('/api/websites/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteId: currentWebsite._id,
          themeColor: themeColorString,
        }),
      });

      if (response.ok) {
        setThemeColors(tempThemeColors);
        refreshWebsites(); // Refresh to get updated website data
        alert('Theme colors saved successfully!');
      } else {
        const errorData = await response.json();
        console.error('Theme save failed:', errorData);
        alert(`Failed to save theme colors: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving theme colors:', error);
      alert('Error saving theme colors: Network error');
    } finally {
      setThemeSaving(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !currentWebsite) return;

    try {
      setCategoryLoading(true);
      const response = await fetch('/api/websites/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteId: currentWebsite._id,
          name: newCategory.name,
          description: newCategory.description,
        }),
      });

      if (response.ok) {
        setNewCategory({ name: '', description: '' });
        fetchCategories(); // Refresh categories list
        alert('Category added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add category: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category: Network error');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/websites/category/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCategories(); // Refresh categories list
        alert('Category deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete category: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  // Check if theme colors have changed
  const hasThemeChanges = 
    tempThemeColors.primary !== themeColors.primary || 
    tempThemeColors.secondary !== themeColors.secondary;

  // Popular gradient combinations
  const popularGradients = [
    { primary: '#1e40af', secondary: '#60a5fa', name: 'Blue Gradient' },
    { primary: '#16a34a', secondary: '#4ade80', name: 'Green Gradient' },
    { primary: '#dc2626', secondary: '#f87171', name: 'Red Gradient' },
    { primary: '#9333ea', secondary: '#c084fc', name: 'Purple Gradient' },
    { primary: '#ea580c', secondary: '#fdba74', name: 'Orange Gradient' },
    { primary: '#000000', secondary: '#4b5563', name: 'Dark Gradient' },
    { primary: '#0891b2', secondary: '#22d3ee', name: 'Cyan Gradient' },
    { primary: '#ca8a04', secondary: '#facc15', name: 'Yellow Gradient' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Website Management</h1>
        <p className="text-gray-600">Manage your websites and their settings</p>
      </div>

      {/* Create Website Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create New Website</h2>
        <form onSubmit={handleCreateWebsite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Website Name</label>
              <input
                type="text"
                value={newWebsite.name}
                onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="e.g., LeleDumbo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website Domain</label>
              <input
                type="text"
                value={newWebsite.domain}
                onChange={(e) => setNewWebsite({ ...newWebsite, domain: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="e.g., leledumbo.com"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Website'}
          </button>
        </form>
      </div>

      {/* Current Website Settings */}
      {currentWebsite && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Settings for: {currentWebsite.name}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Website Logo</h3>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300">
                  {currentWebsite.logo && currentWebsite.logo !== '/uploads/logos/default-logo.png' ? (
                    <img 
                      src={currentWebsite.logo} 
                      alt={`${currentWebsite.name} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span className={`text-gray-500 text-sm ${currentWebsite.logo && currentWebsite.logo !== '/uploads/logos/default-logo.png' ? 'hidden' : 'block'}`}>
                    No logo
                  </span>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Logo
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, WebP up to 5MB
                  </p>
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    Recommended: 200x200px to 400x400px (Square)
                  </p>
                  {logoUploading && (
                    <p className="text-sm text-blue-600 mt-2">Uploading logo...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dual Color Theme Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Theme Colors (Gradient)</h3>
              
              {/* Color Preview */}
              <div className="p-4 rounded-lg border border-gray-300">
                <div 
                  className="w-full h-20 rounded-lg mb-2 border border-gray-300"
                  style={{ 
                    background: `linear-gradient(135deg, ${tempThemeColors.primary}, ${tempThemeColors.secondary})` 
                  }}
                ></div>
                <p className="text-sm text-gray-600 text-center">
                  Gradient Preview
                </p>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={tempThemeColors.primary}
                      onChange={(e) => handleThemeColorChange('primary', e.target.value)}
                      className="w-12 h-12 cursor-pointer rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={tempThemeColors.primary.replace('#', '')}
                      onChange={(e) => handleCustomColorInput('primary', e.target.value)}
                      placeholder="HEX color"
                      className="flex-1 border border-gray-300 rounded-md p-2 text-sm font-mono"
                      maxLength={6}
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={tempThemeColors.secondary}
                      onChange={(e) => handleThemeColorChange('secondary', e.target.value)}
                      className="w-12 h-12 cursor-pointer rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={tempThemeColors.secondary.replace('#', '')}
                      onChange={(e) => handleCustomColorInput('secondary', e.target.value)}
                      placeholder="HEX color"
                      className="flex-1 border border-gray-300 rounded-md p-2 text-sm font-mono"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>

              {/* Popular Gradients */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Popular Gradients:</p>
                <div className="grid grid-cols-4 gap-2">
                  {popularGradients.map((gradient, index) => (
                    <button
                      key={index}
                      onClick={() => setTempThemeColors({ primary: gradient.primary, secondary: gradient.secondary })}
                      className="h-10 rounded border border-gray-300 hover:scale-105 transition-transform relative group"
                      style={{ 
                        background: `linear-gradient(135deg, ${gradient.primary}, ${gradient.secondary})` 
                      }}
                      title={gradient.name}
                    >
                      <span className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded"></span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveThemeColors}
                disabled={themeSaving || !hasThemeChanges}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {themeSaving ? 'Saving...' : 'Save Theme Colors'}
              </button>
              
              {hasThemeChanges && (
                <p className="text-sm text-yellow-600 text-center">You have unsaved theme changes</p>
              )}
            </div>
          </div>

          {/* Categories Management */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Categories</h3>
            
            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category Name *</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    placeholder="e.g., Technology"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    placeholder="e.g., Technology related articles"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={categoryLoading}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {categoryLoading ? 'Adding...' : 'Add Category'}
              </button>
            </form>

            {/* Categories List */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Current Categories ({categories.length})</h4>
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium text-gray-800">{category.name}</span>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:text-red-800 text-sm p-1"
                        title="Delete category"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No categories yet. Add your first category!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Websites List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Websites</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((website) => (
            <div
              key={website._id}
              className={`border rounded-lg p-4 ${
                currentWebsite?._id === website._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                {website.logo && website.logo !== '/uploads/logos/default-logo.png' ? (
                  <img 
                    src={website.logo} 
                    alt={`${website.name} logo`}
                    className="w-8 h-8 object-cover rounded"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xs">🌐</span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{website.name}</h3>
                  <p className="text-sm text-gray-600">{website.domain}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {website.description || 'No description'}
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => changeWebsite(website.name)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Select
                </button>
                <button
                  onClick={() => handleDeleteWebsite(website._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {websites.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No websites found. Create your first website!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteSettings;