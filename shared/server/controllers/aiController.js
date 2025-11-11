import AIService from '../models/AIService.js';
import aiServiceManager from '../services/aiService.js';

export const generateAIContent = async (req, res) => {
  try {
    const { aiService, topic, prompt, generateImage = false } = req.body;

    if (!aiService || !topic) {
      return res.status(400).json({
        success: false,
        error: 'AI service and topic are required'
      });
    }

    const result = await aiServiceManager.generateContent(aiService, topic, prompt, { generateImage });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getAIServices = async (req, res) => {
  try {
    const services = await AIService.find().sort({ name: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error fetching AI services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI services'
    });
  }
};

export const updateAIService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const service = await AIService.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'AI service not found'
      });
    }

    // Reload services in the manager
    await aiServiceManager.loadServices();

    res.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Error updating AI service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update AI service'
    });
  }
};

export const testAIService = async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, topic } = req.body;

    const service = await AIService.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'AI service not found'
      });
    }

    if (!service.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key not configured for this service'
      });
    }

    const result = await aiServiceManager.generateContent(
      service.name.toLowerCase(),
      topic || 'Test',
      prompt || 'Write a short test message to verify the connection is working properly.'
    );

    res.json({
      success: true,
      content: result.content,
      service: service.name
    });
  } catch (error) {
    console.error('AI service test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// Add this function to the existing articleController.js
export const getArticleCategories = async (req, res) => {
  try {
    const { website } = req.query;
    
    let filter = {};
    if (website) {
      filter.website = website;
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