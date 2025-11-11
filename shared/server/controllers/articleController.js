import Article from '../models/Article.js';
import Website from '../models/Website.js';
import aiService from '../services/aiService.js';

// Get all articles with filters
const getArticles = async (req, res) => {
  try {
    const { 
      featured, 
      status, 
      category, 
      limit = 50, 
      page = 1,
      sort = '-createdAt',
      website
    } = req.query;

    let filter = {};
    
    // Handle website filtering - support both ID and name
    if (website) {
      // Check if website is an ObjectId format (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(website);
      
      if (isObjectId) {
        // If it's an ObjectId, use it directly
        filter.website = website;
      } else {
        // If it's a name, find the website by name
        const websiteDoc = await Website.findOne({ 
          $or: [
            { name: { $regex: new RegExp(website, 'i') } },
            { domain: { $regex: new RegExp(website, 'i') } }
          ]
        });
        
        if (websiteDoc) {
          filter.website = websiteDoc._id;
        } else {
          // If no website found, return empty array
          return res.json([]);
        }
      }
    }
    
    if (featured !== undefined) filter.isFeatured = featured === 'true';
    if (status) filter.status = status;
    if (category) filter.categories = { $in: [new RegExp(category, 'i')] };

    const articles = await Article.find(filter)
      .populate('website', 'name domain logo') // Populate website data
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .exec();

    const total = await Article.countDocuments(filter);

    // Return simple array for frontend compatibility
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single article
const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('website', 'name domain logo');
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create article
const createArticle = async (req, res) => {
  try {
    // Validate website exists
    if (req.body.website) {
      const website = await Website.findById(req.body.website);
      if (!website) {
        return res.status(400).json({ error: 'Website not found' });
      }
    }

    const article = new Article(req.body);
    await article.save();
    
    // Populate website data in response
    await article.populate('website', 'name domain logo');
    
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update article
const updateArticle = async (req, res) => {
  try {
    // Validate website exists if being updated
    if (req.body.website) {
      const website = await Website.findById(req.body.website);
      if (!website) {
        return res.status(400).json({ error: 'Website not found' });
      }
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('website', 'name domain logo');
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete article
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get related articles
const getRelatedArticles = async (req, res) => {
  try {
    const currentArticle = await Article.findById(req.params.id);
    if (!currentArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const relatedArticles = await Article.find({
      _id: { $ne: currentArticle._id },
      categories: { $in: currentArticle.categories },
      status: 'published',
      website: currentArticle.website
    })
    .populate('website', 'name domain logo')
    .limit(6)
    .sort({ createdAt: -1 })
    .exec();

    res.json(relatedArticles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate AI content
const generateAIContent = async (req, res) => {
  try {
    res.status(503).json({ 
      error: 'AI features are temporarily disabled',
      message: 'AI content generation will be available after initial deployment. Please add API keys to enable.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get article categories
const getArticleCategories = async (req, res) => {
  try {
    const { website } = req.query;
    
    let filter = {};
    if (website) {
      // Handle both website ID and name
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(website);
      
      if (isObjectId) {
        filter.website = website;
      } else {
        const websiteDoc = await Website.findOne({ 
          $or: [
            { name: { $regex: new RegExp(website, 'i') } },
            { domain: { $regex: new RegExp(website, 'i') } }
          ]
        });
        
        if (websiteDoc) {
          filter.website = websiteDoc._id;
        }
      }
    }

    const articles = await Article.find(filter);
    
    // Extract and count unique categories
    const categoryCount = {};
    articles.forEach(article => {
      article.categories.forEach(category => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });

    // Sort by count descending
    const categories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .map(([category]) => category);

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};

// Export all functions
export {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getRelatedArticles,
  generateAIContent,
  getArticleCategories
};