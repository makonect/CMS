import Article from '../models/Article.js';
import Website from '../models/Website.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

// Create article
export const createArticle = async (req, res) => {
  try {
    console.log('Creating article with data:', req.body);
    
    const { title, content, categories, featuredImage, status, isFeatured, website } = req.body;

    // Validate required fields
    if (!title || !content || !categories || !website) {
      return res.status(400).json({
        error: 'Missing required fields: title, content, categories, and website are required'
      });
    }

    // Find website by name or ID
    let websiteDoc;
    if (mongoose.Types.ObjectId.isValid(website)) {
      websiteDoc = await Website.findById(website);
    } else {
      // Try case-insensitive search for website name
      websiteDoc = await Website.findOne({ 
        name: { $regex: new RegExp(`^${website}$`, 'i') } 
      });
    }

    if (!websiteDoc) {
      return res.status(404).json({
        error: `Website not found: ${website}`
      });
    }

    console.log('Found website:', websiteDoc.name, 'ID:', websiteDoc._id);
    console.log('Looking for categories:', categories);

    // FIX: Use websiteId instead of website
    const validCategories = await Category.find({
      _id: { $in: categories },
      websiteId: websiteDoc._id  // CHANGED FROM 'website' TO 'websiteId'
    });

    console.log('Found valid categories:', validCategories.map(cat => ({id: cat._id, name: cat.name})));

    if (validCategories.length !== categories.length) {
      const foundIds = validCategories.map(cat => cat._id.toString());
      const missingIds = categories.filter(id => !foundIds.includes(id));
      
      console.log('Missing category IDs:', missingIds);
      console.log('All categories in database for this website:');
      const allWebsiteCategories = await Category.find({ websiteId: websiteDoc._id });
      console.log(allWebsiteCategories.map(cat => ({id: cat._id, name: cat.name})));
      
      return res.status(400).json({
        error: 'One or more categories not found for this website',
        details: {
          website: websiteDoc.name,
          foundCategories: validCategories.length,
          requestedCategories: categories.length,
          missingCategoryIds: missingIds,
          availableCategories: allWebsiteCategories.map(cat => ({id: cat._id, name: cat.name}))
        }
      });
    }

    // Create article
    const article = new Article({
      title,
      content,
      categories,
      featuredImage: featuredImage || '',
      status: status || 'draft',
      isFeatured: isFeatured || false,
      website: websiteDoc._id
    });

    const savedArticle = await article.save();
    
    // Populate the saved article with category and website details
    const populatedArticle = await Article.findById(savedArticle._id)
      .populate('categories', 'name')
      .populate('website', 'name logo');

    console.log('Article created successfully:', populatedArticle);
    
    res.status(201).json(populatedArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({
      error: 'Failed to create article',
      details: error.message
    });
  }
};

// Get articles with filters
export const getArticles = async (req, res) => {
  try {
    const { website, status, category, featured } = req.query;
    let filter = {};

    // Filter by website name or ID
    if (website) {
      let websiteDoc;
      if (mongoose.Types.ObjectId.isValid(website)) {
        websiteDoc = await Website.findById(website);
      } else {
        websiteDoc = await Website.findOne({ 
          name: { $regex: new RegExp(`^${website}$`, 'i') } 
        });
      }
      
      if (websiteDoc) {
        filter.website = websiteDoc._id;
      }
    }

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.categories = category;
    }

    if (featured !== undefined) {
      filter.isFeatured = featured === 'true';
    }

    const articles = await Article.find(filter)
      .populate('categories', 'name')
      .populate('website', 'name logo')
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: 'Failed to fetch articles',
      details: error.message
    });
  }
};

// Get single article
export const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('categories', 'name')
      .populate('website', 'name logo');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      error: 'Failed to fetch article',
      details: error.message
    });
  }
};

// Update article
export const updateArticle = async (req, res) => {
  try {
    const { title, content, categories, featuredImage, status, isFeatured, website } = req.body;

    // Find website if provided
    let websiteDoc;
    if (website) {
      if (mongoose.Types.ObjectId.isValid(website)) {
        websiteDoc = await Website.findById(website);
      } else {
        websiteDoc = await Website.findOne({ 
          name: { $regex: new RegExp(`^${website}$`, 'i') } 
        });
      }

      if (!websiteDoc) {
        return res.status(404).json({
          error: 'Website not found'
        });
      }
    }

    // Validate categories if provided
    if (categories && categories.length > 0) {
      const validCategories = await Category.find({
        _id: { $in: categories },
        websiteId: websiteDoc ? websiteDoc._id : undefined
      });

      if (validCategories.length !== categories.length) {
        return res.status(400).json({
          error: 'One or more categories not found'
        });
      }
    }

    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(categories && { categories }),
      ...(featuredImage !== undefined && { featuredImage }),
      ...(status && { status }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(websiteDoc && { website: websiteDoc._id })
    };

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('categories', 'name')
      .populate('website', 'name logo');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({
      error: 'Failed to update article',
      details: error.message
    });
  }
};

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      error: 'Failed to delete article',
      details: error.message
    });
  }
};

// Get related articles
export const getRelatedArticles = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const relatedArticles = await Article.find({
      _id: { $ne: article._id },
      website: article.website,
      categories: { $in: article.categories },
      status: 'published'
    })
      .populate('categories', 'name')
      .populate('website', 'name logo')
      .limit(5)
      .sort({ createdAt: -1 });

    res.json(relatedArticles);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    res.status(500).json({
      error: 'Failed to fetch related articles',
      details: error.message
    });
  }
};

// Get article categories
export const getArticleCategories = async (req, res) => {
  try {
    const { website } = req.query;
    
    let filter = {};
    if (website) {
      let websiteDoc;
      if (mongoose.Types.ObjectId.isValid(website)) {
        websiteDoc = await Website.findById(website);
      } else {
        websiteDoc = await Website.findOne({ 
          name: { $regex: new RegExp(`^${website}$`, 'i') } 
        });
      }
      
      if (websiteDoc) {
        filter.websiteId = websiteDoc._id; // CHANGED TO websiteId
      }
    }

    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching article categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      details: error.message
    });
  }
};

// AI content generation (placeholder)
export const generateAIContent = async (req, res) => {
  try {
    const { prompt, type } = req.body;
    
    // Placeholder for AI content generation
    // You can integrate with OpenAI, DeepSeek, Gemini, etc.
    const generatedContent = `<p>This is AI-generated content based on your prompt: "${prompt}"</p><p>You can integrate with your preferred AI service to generate actual content.</p>`;
    
    res.json({ content: generatedContent });
  } catch (error) {
    console.error('Error generating AI content:', error);
    res.status(500).json({
      error: 'Failed to generate AI content',
      details: error.message
    });
  }
};