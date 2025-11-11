import express from 'express';
import Category from '../models/Category.js';
import Article from '../models/Article.js';

const router = express.Router();

// Get all categories (with optional website filter)
router.get('/all', async (req, res) => {
  try {
    const { website } = req.query;
    
    let filter = {};
    if (website) {
      // Find website by name to get its ID
      const Website = await import('../models/Website.js').then(mod => mod.default);
      const websiteDoc = await Website.findOne({ name: website });
      
      if (websiteDoc) {
        filter.websiteId = websiteDoc._id;
      } else {
        // If website not found, return empty array
        return res.json([]);
      }
    }
    
    const categories = await Category.find(filter)
      .sort({ name: 1 })
      .lean();
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all categories for a specific website by ID
router.get('/website/:websiteId', async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    const categories = await Category.find({ websiteId })
      .sort({ name: 1 })
      .lean();
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all categories with article counts
router.get('/with-counts/:websiteId', async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    const categories = await Category.find({ websiteId })
      .sort({ name: 1 })
      .lean();

    // Get article counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const articleCount = await Article.countDocuments({ 
          category: category._id,
          websiteId 
        });
        return {
          ...category,
          articleCount
        };
      })
    );
    
    res.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories with counts:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create a new category
router.post('/create', async (req, res) => {
  try {
    const { name, description, websiteId } = req.body;

    if (!name || !websiteId) {
      return res.status(400).json({ 
        error: 'Category name and website ID are required' 
      });
    }

    // Check if category already exists for this website
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, 
      websiteId 
    });

    if (existingCategory) {
      return res.status(400).json({ 
        error: 'Category with this name already exists for this website' 
      });
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
      websiteId
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { 
        name: name.trim(), 
        description: description?.trim(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has articles
    const articlesCount = await Article.countDocuments({ category: id });
    
    if (articlesCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. It has ${articlesCount} article(s) associated with it.` 
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;