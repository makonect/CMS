import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Website from '../models/Website.js';

const createDefaultCategories = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/your-database-name');
    
    const websites = await Website.find();
    
    for (const website of websites) {
      console.log(`Creating categories for website: ${website.name}`);
      
      const defaultCategories = website.name === 'leledumbo' ? [
        'Budidaya Lele',
        'Pakan Ikan', 
        'Kolam Lele',
        'Penyakit Ikan',
        'Bisnis Lele'
      ] : [
        'Pertanian Organik',
        'Budidaya Tanaman',
        'Pupuk Alami',
        'Hama Tanaman',
        'Teknologi Pertanian'
      ];
      
      for (const categoryName of defaultCategories) {
        const existingCategory = await Category.findOne({
          name: categoryName,
          website: website._id
        });
        
        if (!existingCategory) {
          const category = new Category({
            name: categoryName,
            description: `Default ${categoryName} category for ${website.name}`,
            website: website._id
          });
          
          await category.save();
          console.log(`Created category: ${categoryName}`);
        } else {
          console.log(`Category already exists: ${categoryName}`);
        }
      }
    }
    
    console.log('Default categories created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating categories:', error);
    process.exit(1);
  }
};

createDefaultCategories();