import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/leledumbo';

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test Category model
    const Category = mongoose.model('Category', new mongoose.Schema({
      name: String,
      websiteId: String,
      createdAt: { type: Date, default: Date.now }
    }));
    
    const categories = await Category.find();
    console.log('✅ Categories in database:', categories.length);
    
    if (categories.length === 0) {
      console.log('ℹ️  No categories found. Creating sample categories...');
      
      const sampleCategories = [
        { name: 'Budidaya Lele', websiteId: 'leledumbo-website-id' },
        { name: 'Pakan Ikan', websiteId: 'leledumbo-website-id' },
        { name: 'Kolam Lele', websiteId: 'leledumbo-website-id' },
        { name: 'Pertanian Organik', websiteId: 'rumanabastala-website-id' },
        { name: 'Budidaya Tanaman', websiteId: 'rumanabastala-website-id' }
      ];
      
      for (const catData of sampleCategories) {
        const category = new Category(catData);
        await category.save();
        console.log(`✅ Created category: ${catData.name}`);
      }
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

testConnection();