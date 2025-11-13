import AIService from '../models/AIService.js';
import aiServiceManager from '../services/aiService.js';

export const generateAIContent = async (req, res) => {
  try {
    const { aiService, topic, prompt, generateImage = false, useFallback = true } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    let result;
    
    if (useFallback) {
      // Use the new fallback system
      console.log(`🔄 Using AI service fallback system for topic: "${topic}"`);
      result = await aiServiceManager.generateContentWithFallback(topic, prompt, {
        generateImage,
        preferredService: aiService // Use preferred service if specified
      });
    } else {
      // Use the original single-service approach
      if (!aiService) {
        return res.status(400).json({
          success: false,
          error: 'AI service is required when fallback is disabled'
        });
      }
      result = await aiServiceManager.generateContent(aiService, topic, prompt, { generateImage });
      result.serviceUsed = aiService;
      result.fallbackUsed = false;
      result.servicesTried = [aiService];
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('AI generation error:', error);
    
    // Provide more specific error messages
    let userMessage = error.message;
    if (error.message.includes('All AI services failed')) {
      userMessage = 'All AI services are currently unavailable. This could be due to:\n• Service overload or maintenance\n• API quota limits reached\n• Network connectivity issues\n\nPlease try again in a few minutes or check your AI service configurations.';
    } else if (error.message.includes('No AI services available')) {
      userMessage = 'No AI services are currently available. Please check your AI service configurations in the settings.';
    } else if (error.message.includes('Service temporarily unavailable')) {
      userMessage = 'The AI service is temporarily unavailable. Please try again in a few moments or use a different service.';
    }

    res.status(500).json({
      success: false,
      error: userMessage
    });
  }
};

export const getAIServices = async (req, res) => {
  try {
    const services = await AIService.find().sort({ isDefault: -1, name: 1 });
    
    // Add health information
    const servicesWithHealth = services.map(service => {
      const health = aiServiceManager.getServiceHealth().find(h => h.name === service.name);
      return {
        ...service.toObject(),
        health: health || { isHealthy: true, healthScore: 0, failureCount: 0, successCount: 0 }
      };
    });

    res.json(servicesWithHealth);
  } catch (error) {
    console.error('Error fetching AI services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI services'
    });
  }
};

export const createAIService = async (req, res) => {
  try {
    const serviceData = req.body;

    // If this is set as default, unset other defaults
    if (serviceData.isDefault) {
      await AIService.updateMany(
        { isDefault: true },
        { isDefault: false }
      );
    }

    const service = new AIService(serviceData);
    await service.save();

    await aiServiceManager.loadServices();

    res.status(201).json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Error creating AI service:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateAIService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const service = await AIService.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'AI service not found'
      });
    }

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      await AIService.updateMany(
        { isDefault: true, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    const updatedService = await AIService.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    await aiServiceManager.loadServices();

    res.json({
      success: true,
      service: updatedService
    });
  } catch (error) {
    console.error('Error updating AI service:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteAIService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await AIService.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'AI service not found'
      });
    }

    await aiServiceManager.loadServices();

    res.json({
      success: true,
      message: 'AI service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting AI service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete AI service'
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

    console.log(`Testing AI service: ${service.name} with ID: ${service._id}`);

    const result = await aiServiceManager.generateContent(
      service.name, // Use service name instead of ID
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

export const getAIStats = async (req, res) => {
  try {
    const stats = await AIService.aggregate([
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          activeServices: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalUsage: { $sum: '$usageCount' },
          mostUsedService: { $max: '$usageCount' }
        }
      }
    ]);

    const topServices = await AIService.find()
      .sort({ usageCount: -1 })
      .limit(5);

    // Get health information
    const serviceHealth = aiServiceManager.getServiceHealth();

    res.json({
      success: true,
      stats: stats[0] || { totalServices: 0, activeServices: 0, totalUsage: 0, mostUsedService: 0 },
      topServices,
      serviceHealth
    });
  } catch (error) {
    console.error('Error fetching AI stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI statistics'
    });
  }
};

// NEW: Endpoint to reset service health
export const resetServiceHealth = async (req, res) => {
  try {
    const { serviceName } = req.body;
    
    aiServiceManager.resetServiceHealth(serviceName);
    
    res.json({
      success: true,
      message: serviceName ? `Health reset for ${serviceName}` : 'All service health data reset'
    });
  } catch (error) {
    console.error('Error resetting service health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset service health'
    });
  }
};