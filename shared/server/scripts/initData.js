import mongoose from 'mongoose';
import Website from '../models/Website.js';
import AIService from '../models/AIService.js';
import dotenv from 'dotenv';

dotenv.config();

const initData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create default websites
    const websites = [
      {
        name: 'LeleDumbo',
        domain: 'leledumbo.com',
        description: 'Catfish News & Information',
        theme: {
          primaryColor: '#1e40af',
          secondaryColor: '#000000',
          backgroundColor: '#ffffff'
        },
        categories: ['Breeding', 'Farming', 'Species', 'Health', 'Recipes', 'Equipment']
      },
      {
        name: 'Rumana Bastala',
        domain: 'rumanabastala.com',
        description: 'Agricultural News & Tips',
        theme: {
          primaryColor: '#16a34a',
          secondaryColor: '#1e293b',
          backgroundColor: '#f8fafc'
        },
        categories: ['Farming', 'Crops', 'Technology', 'Market', 'Sustainability', 'Innovation']
      }
    ];

    for (const websiteData of websites) {
      await Website.findOneAndUpdate(
        { domain: websiteData.domain },
        websiteData,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Websites initialized');

    // Create AI services (without API keys)
    const aiServices = [
      {
        name: 'OpenAI ChatGPT',
        apiKey: '',
        isActive: false,
        serviceType: 'both',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4'
      },
      {
        name: 'DeepSeek',
        apiKey: '',
        isActive: false,
        serviceType: 'text',
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat'
      },
      {
        name: 'Google Gemini',
        apiKey: '',
        isActive: false,
        serviceType: 'both',
        baseUrl: 'https://generativelanguage.googleapis.com/v1',
        model: 'gemini-pro'
      }
    ];

    for (const aiServiceData of aiServices) {
      await AIService.findOneAndUpdate(
        { name: aiServiceData.name },
        aiServiceData,
        { upsert: true, new: true }
      );
    }
    console.log('✅ AI Services initialized');

    console.log('🎉 Initial data setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    process.exit(1);
  }
};

initData();