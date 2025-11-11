import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Website from '../models/Website.js';
import Category from '../models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/logos'));
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

// GET ALL WEBSITES - This is the missing endpoint that fixes your dropdown
router.get('/', async (req, res) => {
  try {
    const websites = await Website.find().sort({ createdAt: -1 });
    
    // Transform data to match frontend expectations
    const transformedWebsites = websites.map(website => ({
      _id: website._id,
      name: website.name,
      domain: website.url, // Map url to domain for frontend
      description: website.description,
      logo: website.logo,
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

    // Transform data to match frontend expectations
    const transformedWebsite = {
      _id: website._id,
      name: website.name,
      domain: website.url, // Map url to domain for frontend
      description: website.description,
      logo: website.logo,
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

    // Create new website - using domain as url
    const newWebsite = new Website({
      name,
      url: domain, // Store domain as url in database
      description: description || '',
      themeColor: themeColor || '#000000',
      userId: 'default-user-id', // You might want to update this with actual user auth
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedWebsite = await newWebsite.save();

    // Transform response for frontend
    const transformedWebsite = {
      _id: savedWebsite._id,
      name: savedWebsite.name,
      domain: savedWebsite.url, // Map url back to domain for frontend
      description: savedWebsite.description,
      logo: savedWebsite.logo,
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
        url: domain, // Update url with domain
        description,
        themeColor,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedWebsite) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Transform response for frontend
    const transformedWebsite = {
      _id: updatedWebsite._id,
      name: updatedWebsite.name,
      domain: updatedWebsite.url, // Map url back to domain
      description: updatedWebsite.description,
      logo: updatedWebsite.logo,
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

// Upload logo for website - FIXED VERSION
router.put('/logo', upload.single('logo'), async (req, res) => {
  try {
    console.log('Logo upload request received:', req.body);
    console.log('Uploaded file:', req.file);

    const { websiteId } = req.body;
    
    if (!websiteId) {
      return res.status(400).json({ error: 'Website ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No logo file uploaded' });
    }

    // Fix the logo URL path - make sure it's accessible from frontend
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    
    console.log('Updating website with logo URL:', logoUrl);

    // Update website with new logo - FIXED: Use correct field names
    const updatedWebsite = await Website.findByIdAndUpdate(
      websiteId,
      { 
        logo: logoUrl,
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
      logoUrl: logoUrl,
      website: updatedWebsite
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload logo',
      message: error.message,
      details: 'Check if uploads directory exists and has write permissions'
    });
  }
});

// Update theme color for website - FIXED VERSION
router.put('/theme', async (req, res) => {
  try {
    const { websiteId, themeColor } = req.body;
    
    console.log('Theme update request:', { websiteId, themeColor });
    
    if (!websiteId || !themeColor) {
      return res.status(400).json({ 
        error: 'Website ID and theme color are required' 
      });
    }

    // Validate themeColor format
    if (!isValidColor(themeColor)) {
      return res.status(400).json({ 
        error: 'Invalid theme color format. Use hex format (#RRGGBB)' 
      });
    }

    const updatedWebsite = await Website.findByIdAndUpdate(
      websiteId,
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

// Helper function to validate color format
function isValidColor(color) {
  // Support both single color and gradient format
  if (typeof color !== 'string') return false;
  
  // Check if it's a single hex color
  if (color.startsWith('#') && (color.length === 4 || color.length === 7)) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  }
  
  // Check if it's a gradient format (we'll handle this in frontend)
  if (color.includes(',')) {
    const colors = color.split(',');
    return colors.every(c => isValidColor(c.trim()));
  }
  
  return false;
}

// Update theme color for website
router.put('/theme', async (req, res) => {
  try {
    const { websiteId, themeColor } = req.body;
    
    if (!websiteId || !themeColor) {
      return res.status(400).json({ 
        error: 'Website ID and theme color are required' 
      });
    }

    const updatedWebsite = await Website.findByIdAndUpdate(
      websiteId,
      { 
        themeColor: themeColor,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedWebsite) {
      return res.status(404).json({ error: 'Website not found' });
    }

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
router.post('/category', async (req, res) => {
  try {
    const { websiteId, name, description } = req.body;
    
    if (!websiteId || !name) {
      return res.status(400).json({ 
        error: 'Website ID and category name are required' 
      });
    }

    // Check if website exists
    const website = await Website.findById(websiteId);
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Create new category
    const newCategory = new Category({
      name,
      description: description || '',
      websiteId,
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
router.get('/categories/:websiteId', async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    const categories = await Category.find({ websiteId }).sort({ createdAt: -1 });
    
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

// Get website settings
router.get('/:websiteId/settings', async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    const website = await Website.findById(websiteId);
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const categories = await Category.find({ websiteId }).sort({ createdAt: -1 });

    res.json({
      website: website,
      categories: categories
    });
  } catch (error) {
    console.error('Get website settings error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch website settings',
      message: error.message 
    });
  }
});

export default router;