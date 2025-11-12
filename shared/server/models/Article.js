import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }],
  featuredImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiService: {
    type: String,
    enum: ['openai', 'deepseek', 'gemini', 'manual'],
    default: 'manual'
  },
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  }
}, {
  timestamps: true
});

// Add index for better performance
articleSchema.index({ website: 1, status: 1 });
articleSchema.index({ website: 1, isFeatured: 1 });
articleSchema.index({ website: 1, categories: 1 });

export default mongoose.model('Article', articleSchema);