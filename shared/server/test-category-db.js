import mongoose from 'mongoose';
import Category from './models/Category.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leledumbo';

async function testCategoryDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if Category collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const categoryCollectionExists = collections.some(col => col.name === 'categories');
    console.log('📊 Category collection exists:', categoryCollectionExists);

    // Test 2: Try to create a category
    console.log('🆕 Creating test category...');
    const testCategory = new Category({
      name: 'Test Category',
      websiteId: 'leledumbo-website-id'
    });

    await testCategory.save();
    console.log('✅ Test category created successfully:', testCategory);

    // Test 3: Count categories
    const categoryCount = await Category.countDocuments();
    console.log('📈 Total categories in database:', categoryCount);

    // Test 4: List all categories
    const allCategories = await Category.find();
    console.log('📋 All categories:');
    allCategories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name} (ID: ${cat._id})`);
    });

    // Clean up: delete test category
    await Category.deleteOne({ name: 'Test Category' });
    console.log('🧹 Test category cleaned up');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Database test failed:', error);
    if (error.code === 11000) {
      console.log('ℹ️ Duplicate key error - category already exists');
    }
  }
}

testCategoryDatabase();