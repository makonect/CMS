import AIService from '../models/AIService.js';

class AIServiceManager {
  constructor() {
    this.services = new Map();
    this.serviceHealth = new Map(); // Track service health
    this.loadServices();
  }

  async loadServices() {
    try {
      const services = await AIService.find({ isActive: true });
      this.services.clear();
      services.forEach(service => {
        const key = service.isGlobal ? `global-${service.name.toLowerCase()}` : `${service.website}-${service.name.toLowerCase()}`;
        this.services.set(key, service);
        
        // Initialize health tracking if not exists, but don't reset existing health data
        if (!this.serviceHealth.has(service.name)) {
          this.serviceHealth.set(service.name, {
            successCount: 0,
            failureCount: 0,
            lastUsed: null,
            isHealthy: true,
            lastFailure: null
          });
        }
      });
      console.log('✅ AI Services loaded:', Array.from(this.services.values()).map(s => s.name));
    } catch (error) {
      console.error('❌ Error loading AI services:', error);
    }
  }

  // Update service health based on success/failure
  updateServiceHealth(serviceName, success) {
    const health = this.serviceHealth.get(serviceName) || {
      successCount: 0,
      failureCount: 0,
      lastUsed: null,
      isHealthy: true,
      lastFailure: null
    };
    
    if (success) {
      health.successCount++;
      health.failureCount = 0; // Reset failure count on success
      health.isHealthy = true;
      health.lastUsed = new Date();
      console.log(`✅ ${serviceName} health updated: Success #${health.successCount}`);
    } else {
      health.failureCount++;
      health.lastFailure = new Date();
      health.lastUsed = new Date();
      
      // Only mark as unhealthy after 2 consecutive failures (reduced from 3)
      if (health.failureCount >= 2) {
        health.isHealthy = false;
        console.log(`🚨 Marking ${serviceName} as unhealthy due to ${health.failureCount} consecutive failures`);
      } else {
        console.log(`⚠️ ${serviceName} failure #${health.failureCount}, still considered healthy`);
      }
    }
    
    this.serviceHealth.set(serviceName, health);
  }

  // Get services sorted by health and priority
  async getHealthyServices() {
    await this.loadServices();
    const services = Array.from(this.services.values());
    
    return services
      .filter(service => {
        const health = this.serviceHealth.get(service.name);
        // Consider service healthy if:
        // 1. No health data exists (new service)
        // 2. Health data exists and service is marked healthy
        // 3. OR service had failures but not enough to mark as unhealthy
        return service.isActive && (!health || health.isHealthy !== false);
      })
      .sort((a, b) => {
        // Prefer default service
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        
        // Then by health score (successes - failures)
        const healthA = this.serviceHealth.get(a.name);
        const healthB = this.serviceHealth.get(b.name);
        const scoreA = (healthA?.successCount || 0) - (healthA?.failureCount || 0);
        const scoreB = (healthB?.successCount || 0) - (healthB?.failureCount || 0);
        
        return scoreB - scoreA;
      });
  }

  async getService(serviceName) {
    await this.loadServices();
    
    // Normalize the service name for matching
    const normalizedServiceName = serviceName.toLowerCase().trim();
    
    // Find service by name (case insensitive)
    for (let [key, service] of this.services) {
      if (service.name.toLowerCase() === normalizedServiceName) {
        return service;
      }
    }
    
    // If not found by exact name, try partial matching
    for (let [key, service] of this.services) {
      if (service.name.toLowerCase().includes(normalizedServiceName) || 
          normalizedServiceName.includes(service.name.toLowerCase())) {
        return service;
      }
    }
    
    return null;
  }

  async getDefaultService() {
    await this.loadServices();
    
    // Find default service
    for (let [key, service] of this.services) {
      if (service.isDefault) {
        return service;
      }
    }
    
    return null;
  }

  async getAvailableServices() {
    await this.loadServices();
    return Array.from(this.services.values());
  }

  async updateUsage(serviceId) {
    try {
      await AIService.findByIdAndUpdate(serviceId, {
        $inc: { usageCount: 1 },
        lastUsed: new Date()
      });
    } catch (error) {
      console.error('Error updating AI service usage:', error);
    }
  }

  async generateWithOpenAI(service, prompt, topic, generateImage = false) {
    if (!service || !service.apiKey) {
      throw new Error('OpenAI service not configured or API key missing');
    }

    let OpenAI;
    try {
      OpenAI = (await import('openai')).default;
    } catch (error) {
      throw new Error('OpenAI library not available');
    }

    const openai = new OpenAI({ 
      apiKey: service.apiKey,
      baseURL: service.baseUrl || 'https://api.openai.com/v1'
    });

    if (generateImage) {
      try {
        const response = await openai.images.generate({
          model: service.model || "dall-e-3",
          prompt: `${topic}: ${prompt}`,
          n: 1,
          size: "1024x1024",
        });
        await this.updateUsage(service._id);
        this.updateServiceHealth(service.name, true);
        return { type: 'image', content: response.data[0].url };
      } catch (error) {
        this.updateServiceHealth(service.name, false);
        throw new Error(`OpenAI Image Generation Error: ${error.message}`);
      }
    } else {
      try {
        const completion = await openai.chat.completions.create({
          model: service.model || "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert content creator. Create engaging, informative content."
            },
            {
              role: "user",
              content: `Topic: ${topic}\nPrompt: ${prompt}\n\nCreate comprehensive content:`
            }
          ],
          max_tokens: service.maxTokens || 2000,
          temperature: service.temperature || 0.7
        });
        await this.updateUsage(service._id);
        this.updateServiceHealth(service.name, true);
        return { type: 'text', content: completion.choices[0].message.content };
      } catch (error) {
        this.updateServiceHealth(service.name, false);
        throw new Error(`OpenAI Text Generation Error: ${error.message}`);
      }
    }
  }

  async generateWithDeepSeek(service, prompt, topic) {
    if (!service || !service.apiKey) {
      throw new Error('DeepSeek service not configured or API key missing');
    }

    let axios;
    try {
      axios = (await import('axios')).default;
    } catch (error) {
      throw new Error('Axios library not available');
    }

    try {
      const baseUrl = service.baseUrl || 'https://api.deepseek.com';
      const response = await axios.post(`${baseUrl}/chat/completions`, {
        model: service.model || "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an expert content creator. Create engaging, informative content."
          },
          {
            role: "user",
            content: `Topic: ${topic}\nAdditional instructions: ${prompt}\n\nPlease create comprehensive content about this topic:`
          }
        ],
        max_tokens: service.maxTokens || 2000,
        temperature: service.temperature || 0.7,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${service.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      if (!response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid response format from DeepSeek API');
      }

      await this.updateUsage(service._id);
      this.updateServiceHealth(service.name, true);
      return { type: 'text', content: response.data.choices[0].message.content };
    } catch (error) {
      this.updateServiceHealth(service.name, false);
      console.error('DeepSeek API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data?.error?.message === 'Insufficient Balance') {
        throw new Error('DeepSeek Error: Insufficient balance in your account. Please add funds to your DeepSeek account.');
      } else if (error.response?.status === 401) {
        throw new Error('DeepSeek Error: Invalid API key. Please check your API key.');
      } else if (error.response?.status === 429) {
        throw new Error('DeepSeek Error: Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`DeepSeek Error: ${error.response?.data?.error?.message || error.message}`);
      }
    }
  }

  async getAvailableGeminiModels(apiKey) {
    let axios;
    try {
      axios = (await import('axios')).default;
    } catch (error) {
      throw new Error('Axios library not available');
    }

    try {
      const response = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`, {
        timeout: 10000
      });
      return response.data.models || [];
    } catch (error) {
      console.error('Error fetching Gemini models:', error.message);
      return [];
    }
  }

  async findBestGeminiModel(apiKey) {
    try {
      const models = await this.getAvailableGeminiModels(apiKey);
      
      // Preferred models in order of preference
      const preferredModels = [
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
        'gemini-pro',
        'gemini-1.0-pro'
      ];
      
      // Find the first available preferred model
      for (const modelName of preferredModels) {
        const availableModel = models.find(model => model.name.includes(modelName));
        if (availableModel) {
          console.log(`✅ Found Gemini model: ${modelName}`);
          return modelName;
        }
      }
      
      // If no preferred models found, return the first available model that supports generation
      const generativeModel = models.find(model => 
        model.supportedGenerationMethods && 
        model.supportedGenerationMethods.includes('generateContent')
      );
      
      if (generativeModel) {
        const modelName = generativeModel.name.split('/').pop();
        console.log(`✅ Using available Gemini model: ${modelName}`);
        return modelName;
      }
      
      return 'gemini-1.5-flash-latest'; // Default fallback
    } catch (error) {
      console.error('Error finding Gemini model:', error.message);
      return 'gemini-1.5-flash-latest'; // Default fallback
    }
  }

  async generateWithGeminiWithRetry(service, prompt, topic, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔧 Gemini generation attempt ${attempt}/${maxRetries}`);
        
        let GoogleGenerativeAI;
        try {
          GoogleGenerativeAI = (await import('@google/generative-ai')).GoogleGenerativeAI;
        } catch (error) {
          throw new Error('Google Generative AI library not available');
        }

        const genAI = new GoogleGenerativeAI(service.apiKey);

        // Try to find the best available model
        let modelName = service.model;
        
        // If no model specified or model not found, discover available models
        if (!modelName || modelName === 'gemini-pro' || modelName === 'gemini-1.5-pro-latest') {
          console.log('🔍 Discovering available Gemini models...');
          const bestModel = await this.findBestGeminiModel(service.apiKey);
          if (bestModel) {
            modelName = bestModel;
            // Update the service with the discovered model
            await AIService.findByIdAndUpdate(service._id, { model: modelName });
            console.log(`✅ Updated Gemini service with model: ${modelName}`);
          } else {
            // Fallback to common models
            modelName = 'gemini-1.5-flash-latest';
          }
        }

        console.log(`🚀 Using Gemini model: ${modelName}`);

        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            maxOutputTokens: service.maxTokens || 2000,
            temperature: service.temperature || 0.7
          }
        });

        const fullPrompt = `Topic: ${topic}\nAdditional Instructions: ${prompt}\n\nPlease create comprehensive, well-structured content about this topic. Write in a clear, engaging style.`;
        
        console.log(`📝 Sending request to Gemini with topic: ${topic}`);
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        
        if (!response.text()) {
          throw new Error('Empty response from Gemini');
        }

        console.log(`✅ Gemini generation successful, content length: ${response.text().length}`);
        await this.updateUsage(service._id);
        this.updateServiceHealth(service.name, true);
        return { type: 'text', content: response.text() };

      } catch (error) {
        console.error(`❌ Gemini attempt ${attempt} failed:`, {
          message: error.message,
          stack: error.stack
        });

        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          this.updateServiceHealth(service.name, false);
          // Provide helpful error messages
          if (error.message.includes('503') || error.message.includes('SERVICE_UNAVAILABLE')) {
            throw new Error('Gemini Error: Service temporarily unavailable. This is often due to high demand. Please try again in a few moments.');
          } else if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('Gemini Error: Rate limit exceeded. You have made too many requests. Please wait a few minutes and try again.');
          } else if (error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED')) {
            throw new Error('Gemini Error: API quota exceeded. Please check your Google AI Studio quota and billing settings.');
          } else if (error.message.includes('404') || error.message.includes('not found')) {
            throw new Error('Gemini Error: Model not found. The system will try to auto-discover available models on next attempt.');
          } else if (error.message.includes('API key not valid') || error.message.includes('PERMISSION_DENIED')) {
            throw new Error('Gemini Error: Invalid API key or permission denied. Please check your API key in Google AI Studio.');
          } else if (error.message.includes('500') || error.message.includes('INTERNAL')) {
            throw new Error('Gemini Error: Internal server error. This is usually temporary. Please try again shortly.');
          } else {
            throw new Error(`Gemini Error: ${error.message}`);
          }
        }

        // Wait before retrying (exponential backoff with jitter)
        const baseWaitTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
        const jitter = Math.random() * 1000; // Add up to 1 second jitter
        const waitTime = baseWaitTime + jitter;
        console.log(`⏳ Waiting ${Math.round(waitTime)}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  async generateWithGemini(service, prompt, topic, generateImage = false) {
    if (!service || !service.apiKey) {
      throw new Error('Gemini service not configured or API key missing');
    }

    if (generateImage) {
      throw new Error('Image generation not supported with Gemini yet');
    }

    return await this.generateWithGeminiWithRetry(service, prompt, topic, 3);
  }

  // NEW: Generate content with fallback to other services
  async generateContentWithFallback(topic, prompt, options = {}) {
    const { generateImage = false, preferredService = null } = options;
    
    if (!topic) {
      throw new Error('Topic is required');
    }

    const healthyServices = await this.getHealthyServices();
    const allServices = await this.getAvailableServices();
    
    console.log(`📊 Service Status: ${healthyServices.length}/${allServices.length} services healthy`);
    console.log(`🎯 Preferred service: ${preferredService || 'None'}`);
    
    if (healthyServices.length === 0 && allServices.length > 0) {
      console.log('⚠️ No services marked as healthy, but will try all available services as fallback');
      // If no services are marked healthy, try all available services
      healthyServices.push(...allServices);
    }

    if (healthyServices.length === 0) {
      throw new Error('No AI services available. Please check your AI service configurations.');
    }

    let errors = [];
    let servicesTried = [];
    
    // If preferred service is specified, try it first
    if (preferredService) {
      const service = await this.getService(preferredService);
      if (service && healthyServices.some(s => s._id.toString() === service._id.toString())) {
        try {
          console.log(`🎯 Trying preferred service: ${service.name}`);
          servicesTried.push(service.name);
          const result = await this.generateWithService(service, prompt, topic, generateImage);
          console.log(`✅ Success with preferred service: ${service.name}`);
          return { ...result, serviceUsed: service.name, fallbackUsed: false, servicesTried };
        } catch (error) {
          errors.push(`${service.name}: ${error.message}`);
          console.log(`❌ Preferred service ${service.name} failed: ${error.message}`);
        }
      } else {
        console.log(`⚠️ Preferred service "${preferredService}" not found or not healthy, skipping`);
      }
    }

    // Try all healthy services in order of priority (excluding the preferred service we already tried)
    const servicesToTry = healthyServices.filter(service => 
      !preferredService || service.name !== preferredService
    );

    console.log(`🔄 Trying ${servicesToTry.length} fallback services:`, servicesToTry.map(s => s.name));

    for (const service of servicesToTry) {
      try {
        console.log(`🔄 Trying fallback service: ${service.name}`);
        servicesTried.push(service.name);
        const result = await this.generateWithService(service, prompt, topic, generateImage);
        console.log(`✅ Successfully generated content with fallback service: ${service.name}`);
        return { ...result, serviceUsed: service.name, fallbackUsed: true, servicesTried };
      } catch (error) {
        errors.push(`${service.name}: ${error.message}`);
        console.log(`❌ Fallback service ${service.name} failed: ${error.message}`);
      }
    }

    // If all services failed, throw a comprehensive error
    const errorMessage = `All AI services failed. Services tried: ${servicesTried.join(', ')}\n\nErrors:\n${errors.map(err => `• ${err}`).join('\n')}`;
    console.error('💥 All AI services failed:', errors);
    throw new Error(errorMessage);
  }

  // Helper method to generate with a specific service
  async generateWithService(service, prompt, topic, generateImage = false) {
    const serviceName = service.name.toLowerCase();

    console.log(`🎯 Generating content with ${serviceName} for topic: "${topic}"`);

    if (serviceName.includes('openai')) {
      return await this.generateWithOpenAI(service, prompt, topic, generateImage);
    } else if (serviceName.includes('deepseek')) {
      return await this.generateWithDeepSeek(service, prompt, topic);
    } else if (serviceName.includes('gemini')) {
      return await this.generateWithGemini(service, prompt, topic, generateImage);
    } else {
      throw new Error(`Unsupported AI service: ${service.name}`);
    }
  }

  // Original generateContent method (maintains backward compatibility)
  async generateContent(aiService, topic, prompt, options = {}) {
    const { generateImage = false } = options;

    if (!topic) {
      throw new Error('Topic is required');
    }

    const service = await this.getService(aiService);
    if (!service) {
      const availableServices = Array.from(this.services.values()).map(s => s.name);
      throw new Error(`AI service "${aiService}" not found. Available services: ${availableServices.join(', ')}`);
    }

    if (!service.apiKey) {
      throw new Error(`API key not configured for ${service.name}`);
    }

    if (!service.isActive) {
      throw new Error(`Service ${service.name} is not active`);
    }

    return await this.generateWithService(service, prompt, topic, generateImage);
  }

  // Get service health status
  getServiceHealth() {
    return Array.from(this.serviceHealth.entries()).map(([name, health]) => ({
      name,
      ...health,
      healthScore: health.successCount - health.failureCount
    }));
  }

  // Reset service health for a specific service
  resetServiceHealth(serviceName) {
    if (serviceName && this.serviceHealth.has(serviceName)) {
      this.serviceHealth.set(serviceName, {
        successCount: 0,
        failureCount: 0,
        lastUsed: null,
        isHealthy: true,
        lastFailure: null
      });
      console.log(`✅ Reset health for service: ${serviceName}`);
    } else if (!serviceName) {
      // Reset all services
      for (const [name] of this.serviceHealth) {
        this.serviceHealth.set(name, {
          successCount: 0,
          failureCount: 0,
          lastUsed: null,
          isHealthy: true,
          lastFailure: null
        });
      }
      console.log('✅ Reset health for all services');
    }
  }
}

export default new AIServiceManager();