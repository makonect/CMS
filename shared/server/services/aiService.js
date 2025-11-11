import AIService from '../models/AIService.js';

class AIServiceManager {
  constructor() {
    this.services = {};
    this.loadServices();
  }

async loadServices() {
    try {
      const services = await AIService.find({ isActive: true });
      services.forEach(service => {
        this.services[service.name.toLowerCase()] = service;
      });
      console.log('✅ AI Services loaded:', Object.keys(this.services));
    } catch (error) {
      console.error('❌ Error loading AI services:', error);
    }
  }

  async getService(serviceName) {
    await this.loadServices(); // Reload to get latest API keys
    return this.services[serviceName.toLowerCase()];
  }

  async generateWithOpenAI(prompt, topic, generateImage = false) {
    const service = await this.getService('OpenAI ChatGPT');
    if (!service || !service.apiKey) {
      throw new Error('OpenAI service not configured or API key missing');
    }

    let OpenAI;
    try {
      OpenAI = (await import('openai')).default;
    } catch (error) {
      throw new Error('OpenAI library not available');
    }

    const openai = new OpenAI({ apiKey: service.apiKey });

    if (generateImage) {
      try {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: `${topic}: ${prompt}`,
          n: 1,
          size: "1024x1024",
        });
        return { type: 'image', content: response.data[0].url };
      } catch (error) {
        throw new Error(`OpenAI Image Generation Error: ${error.message}`);
      }
    } else {
      try {
        const completion = await openai.chat.completions.create({
          model: service.model || "gpt-4",
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
          max_tokens: 2000
        });
        return { type: 'text', content: completion.choices[0].message.content };
      } catch (error) {
        throw new Error(`OpenAI Text Generation Error: ${error.message}`);
      }
    }
  }

  async generateWithDeepSeek(prompt, topic) {
    const service = await this.getService('DeepSeek');
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
      const response = await axios.post(`${service.baseUrl}/chat/completions`, {
        model: service.model || "deepseek-chat",
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
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${service.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return { type: 'text', content: response.data.choices[0].message.content };
    } catch (error) {
      throw new Error(`DeepSeek Error: ${error.message}`);
    }
  }

  async generateWithGemini(prompt, topic, generateImage = false) {
    const service = await this.getService('Google Gemini');
    if (!service || !service.apiKey) {
      throw new Error('Gemini service not configured or API key missing');
    }

    let GoogleGenerativeAI;
    try {
      GoogleGenerativeAI = (await import('@google/generative-ai')).GoogleGenerativeAI;
    } catch (error) {
      throw new Error('Google Generative AI library not available');
    }

    const genAI = new GoogleGenerativeAI(service.apiKey);

    if (generateImage) {
      // Note: Gemini currently doesn't support image generation
      throw new Error('Image generation not supported with Gemini yet');
    } else {
      try {
        const model = genAI.getGenerativeModel({ model: service.model || "gemini-pro" });
        const result = await model.generateContent(`Topic: ${topic}\nPrompt: ${prompt}\n\nCreate comprehensive content:`);
        const response = await result.response;
        return { type: 'text', content: response.text() };
      } catch (error) {
        throw new Error(`Gemini Error: ${error.message}`);
      }
    }
  }

  async generateContent(aiService, topic, prompt, options = {}) {
    const { generateImage = false } = options;

    if (!topic) {
      throw new Error('Topic is required');
    }

    switch (aiService.toLowerCase()) {
      case 'openai':
        return await this.generateWithOpenAI(prompt, topic, generateImage);
      case 'deepseek':
        return await this.generateWithDeepSeek(prompt, topic);
      case 'gemini':
        return await this.generateWithGemini(prompt, topic, generateImage);
      default:
        throw new Error('Unsupported AI service');
    }
  }

  getAvailableServices() {
    return Object.values(this.services).map(service => ({
      name: service.name,
      type: service.serviceType,
      isActive: service.isActive
    }));
  }
}

export default new AIServiceManager();