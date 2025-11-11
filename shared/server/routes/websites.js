import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';
import Website from '../models/Website.js';
import Category from '../models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads/logos');
    mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// GET ALL WEBSITES
router.get('/', async (req, res) => {
  try {
    const websites = await Website.find().sort({ createdAt: -1 });
    
    // Transform data to include full logo URLs
    const transformedWebsites = websites.map(website => ({
      _id: website._id,
      name: website.name,
      domain: website.url,
      description: website.description,
      logo: website.logo ? `http://localhost:3001${website.logo}` : null,
      themeColor: website.themeColor,
      createdAt: website.createdAt,
      updatedAt: website.updatedAt
    }));

    res.json(transformedWebsites);
  } catch (error) {
    console.error('Get websites error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch websites',
      message: error.message 
    });
  }
});

// GET WEBSITE BY ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const website = await Website.findById(id);
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const transformedWebsite = {
      _id: website._id,
      name: website.name,
      domain: website.url,
      description: website.description,
      logo: website.logo ? `http://localhost:3001${website.logo}` : null,
      themeColor: website.themeColor,
      createdAt: website.createdAt,
      updatedAt: website.updatedAt
    };

    res.json(transformedWebsite);
  } catch (error) {
    console.error('Get website error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch website',
      message: error.message 
    });
  }
});

// CREATE NEW WEBSITE
router.post('/', async (req, res) => {
  try {
    const { name, domain, description, themeColor } = req.body;
    
    if (!name || !domain) {
      return res.status(400).json({ 
        error: 'Website name and domain are required' 
      });
    }

    const newWebsite = new Website({
      name,
      url: domain,
      description: description || '',
      themeColor: themeColor || '#000000',
      userId: 'default-user-id',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedWebsite = await newWebsite.save();

    const transformedWebsite = {
      _id: savedWebsite._id,
      name: savedWebsite.name,
      domain: savedWebsite.url,
      description: savedWebsite.description,
      logo: savedWebsite.logo ? `http://localhost:3001${savedWebsite.logo}` : null,
      themeColor: savedWebsite.themeColor,
      createdAt: savedWebsite.createdAt,
      updatedAt: savedWebsite.updatedAt
    };

    res.status(201).json({
      message: 'Website created successfully',
      website: transformedWebsite
    });
  } catch (error) {
    console.error('Create website error:', error);
    res.status(500).json({ 
      error: 'Failed to create website',
      message: error.message 
    });
  }
});

// UPDATE WEBSITE
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, domain, description, themeColor } = req.body;
    
    const updatedWebsite = await Website.findByIdAndUpdate(
      id,
      { 
        name,
        url: domain,
        description,
        themeColor,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedWebsite) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const transformedWebsite = {
      _id: updatedWebsite._id,
      name: updatedWebsite.name,
      domain: updatedWebsite.url,
      description: updatedWebsite.description,
      logo: updatedWebsite.logo ? `http://localhost:3001${updatedWebsite.logo}` : null,
      themeColor: updatedWebsite.themeColor,
      createdAt: updatedWebsite.createdAt,
      updatedAt: updatedWebsite.updatedAt
    };

    res.json({
      message: 'Website updated successfully',
      website: transformedWebsite
    });
  } catch (error) {
    console.error('Update website error:', error);
    res.status(500).json({ 
      error: 'Failed to update website',
      message: error.message 
    });
  }
});

// DELETE WEBSITE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedWebsite = await Website.findByIdAndDelete(id);
    
    if (!deletedWebsite) {
      return res.status(404).json({ error: 'Website not found' });
    }

    res.json({
      message: 'Website deleted successfully',
      website: deletedWebsite
    });
  } catch (error) {
    console.error('Delete website error:', error);
    res.status(500).json({ 
      error: 'Failed to delete website',
      message: error.message 
    });
  }
});

// Upload logo for website
router.put('/:id/logo', upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Logo upload request for website:', id);

    if (!req.file) {
      return res.status(400).json({ error: 'No logo file uploaded' });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;
    const fullLogoUrl = `http://localhost:3001${logoUrl}`;
    
    // Check if file actually exists
    const filePath = path.join(__dirname, '../uploads/logos', req.file.filename);
    console.log('File saved at:', filePath);
    console.log('File exists:', existsSync(filePath));
    
    console.log('Updating website with logo URL:', fullLogoUrl);

    const updatedWebsite = await Website.findByIdAndUpdate(
      id,
      { 
        logo: logoUrl, // Store relative path in database
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedWebsite) {
      return res.status(404).json({ error: 'Website not found' });
    }

    console.log('Logo update successful for website:', updatedWebsite.name);

    res.json({
      message: 'Logo uploaded successfully',
      logoUrl: fullLogoUrl, // Return full URL to frontend
      website: {
        ...updatedWebsite.toObject(),
        logo: fullLogoUrl // Return website with full URL
      }
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload logo',
      message: error.message
    });
  }
});

// Update theme color for website
router.put('/:id/theme', async (req, res) => {
  try {
    const { id } = req.params;
    const { themeColor } = req.body;
    
    console.log('Theme update request for website:', id, themeColor);
    
    if (!themeColor) {
      return res.status(400).json({ 
        error: 'Theme color is required' 
      });
    }

    const updatedWebsite = await Website.findByIdAndUpdate(
      id,
      { 
        themeColor: themeColor,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedWebsite) {
      return res.status(404).json({ error: 'Website not found' });
    }

    console.log('Theme update successful for website:', updatedWebsite.name);

    res.json({
      message: 'Theme color updated successfully',
      themeColor: themeColor,
      website: updatedWebsite
    });
  } catch (error) {
    console.error('Theme update error:', error);
    res.status(500).json({ 
      error: 'Failed to update theme color',
      message: error.message 
    });
  }
});

// Add category to website
router.post('/:id/category', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        error: 'Category name is required' 
      });
    }

    const website = await Website.findById(id);
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const newCategory = new Category({
      name,
      description: description || '',
      websiteId: id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      message: 'Category created successfully',
      category: savedCategory
    });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create category',
      message: error.message 
    });
  }
});

// Get categories for website
router.get('/:id/categories', async (req, res) => {
  try {
    const { id } = req.params;
    
    const categories = await Category.find({ websiteId: id }).sort({ createdAt: -1 });
    
    res.json({
      categories: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error.message 
    });
  }
});

// Delete category
router.delete('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      message: 'Category deleted successfully',
      category: deletedCategory
    });
  } catch (error) {
    console.error('Category deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete category',
      message: error.message 
    });
  }
});

export default router;