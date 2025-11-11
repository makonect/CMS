import mongoose from 'mongoose';
import Article from '../models/Article.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleArticles = [
  {
    title: "Introduction to Catfish Farming",
    content: "Catfish farming is one of the most popular forms of aquaculture worldwide. These resilient fish are known for their rapid growth and adaptability to various farming conditions.",
    categories: ["Farming", "Beginner"],
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "Best Catfish Breeding Techniques",
    content: "Successful catfish breeding requires careful attention to water quality, temperature, and feeding schedules. This guide covers the essential techniques for successful breeding operations.",
    categories: ["Breeding", "Techniques"],
    featuredImage: "",
    status: "published",
    isFeatured: false
  },
  {
    title: "Common Catfish Diseases and Prevention",
    content: "Learn about the most common diseases affecting catfish and how to prevent them through proper pond management and health monitoring practices.",
    categories: ["Health", "Diseases"],
    featuredImage: "",
    status: "published",
    isFeatured: true
  }
];

const createSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing articles
    await Article.deleteMany({});
    console.log('✅ Cleared existing articles');

    // Create sample articles
    await Article.insertMany(sampleArticles);
    console.log('✅ Created sample articles');

    console.log('🎉 Sample data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
};

createSampleData();