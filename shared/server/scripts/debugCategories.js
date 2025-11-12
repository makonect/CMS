import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Website from '../models/Website.js';

const debugCategories = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/your-database-name');
    
    console.log('=== DEBUGGING CATEGORIES ===');
    
    // Check all websites
    const websites = await Website.find();
    console.log('Websites in database:');
    websites.forEach(website => {
      console.log(`- ${website.name} (ID: ${website._id})`);
    });
    
    // Check all categories
    const categories = await Category.find();
    console.log('\nAll categories in database:');
    categories.forEach(category => {
      console.log(`- ${category.name} (ID: ${category._id}) - WebsiteId: ${category.websiteId}`);
    });
    
    // Specifically check the categories we're trying to use
    const targetCategoryIds = ['691383974dc4409dba54a84a', '69137cf4b2b54258bd3318b0'];
    console.log('\nChecking specific categories:');
    
    for (const catId of targetCategoryIds) {
      const category = await Category.findById(catId);
      if (category) {
        const website = await Website.findById(category.websiteId);
        console.log(`✓ FOUND: ${category.name} (ID: ${category._id}) - Website: ${website ? website.name : 'Unknown'} (ID: ${category.websiteId})`);
      } else {
        console.log(`✗ NOT FOUND: Category with ID ${catId}`);
      }
    }
    
    // Check if these categories belong to the leledumbo website
    const leledumboWebsite = await Website.findOne({ name: /leledumbo/i });
    if (leledumboWebsite) {
      console.log(`\nChecking categories for website: ${leledumboWebsite.name}`);
      const websiteCategories = await Category.find({ websiteId: leledumboWebsite._id });
      console.log(`Categories for ${leledumboWebsite.name}:`, websiteCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        websiteId: cat.websiteId
      })));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error debugging categories:', error);
    process.exit(1);
  }
};

debugCategories();