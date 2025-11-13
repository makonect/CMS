import mongoose from 'mongoose';
import AIService from '../models/AIService.js';
import Website from '../models/Website.js';
import '../config/database.js';

const initAIServices = async () => {
  try {
    // Get all websites
    const websites = await Website.find();
    
    for (const website of websites) {
      // Check if AI services already exist for this website
      const existingServices = await AIService.find({ website: website._id });
      
      if (existingServices.length === 0) {
        console.log(`Creating default AI services for website: ${website.name}`);
        
        // Create default AI service templates
        const defaultServices = [
          {
            name: 'OpenAI ChatGPT',
            apiKey: process.env.OPENAI_API_KEY || '',
            serviceType: 'both',
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000,
            isActive: false,
            isDefault: true,
            website: website._id
          },
          {
            name: 'DeepSeek',
            apiKey: process.env.DEEPSEEK_API_KEY || '',
            serviceType: 'text',
            baseUrl: 'https://api.deepseek.com/v1',
            model: 'deepseek-chat',
            temperature: 0.7,
            maxTokens: 2000,
            isActive: false,
            isDefault: false,
            website: website._id
          },
          {
            name: 'Google Gemini',
            apiKey: process.env.GEMINI_API_KEY || '',
            serviceType: 'text',
            baseUrl: '',
            model: 'gemini-pro',
            temperature: 0.7,
            maxTokens: 2000,
            isActive: false,
            isDefault: false,
            website: website._id
          }
        ];

        await AIService.insertMany(defaultServices);
        console.log(`✅ Default AI services created for ${website.name}`);
      }
    }
    
    console.log('✅ AI services initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing AI services:', error);
    process.exit(1);
  }
};

initAIServices();