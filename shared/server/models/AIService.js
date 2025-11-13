import mongoose from 'mongoose';

const aiServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  apiKey: {
    type: String,
    required: false // Make optional so users can add via dashboard
  },
  isActive: {
    type: Boolean,
    default: true
  },
  serviceType: {
    type: String,
    enum: ['text', 'image', 'both'],
    default: 'text'
  },
  baseUrl: {
    type: String,
    default: ''
  },
  model: {
    type: String,
    default: ''
  },
  temperature: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 1
  },
  maxTokens: {
    type: Number,
    default: 2000
  },
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: false // Make optional for global services
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  },
  isGlobal: {
    type: Boolean,
    default: false // Whether this service is available for all websites
  }
}, {
  timestamps: true
});

// Ensure only one default service per website (or global)
aiServiceSchema.index({ website: 1, isDefault: 1 }, { 
  unique: true, 
  partialFilterExpression: { isDefault: true, website: { $exists: true } } 
});

// Ensure only one default global service
aiServiceSchema.index({ isGlobal: 1, isDefault: 1 }, { 
  unique: true, 
  partialFilterExpression: { isDefault: true, isGlobal: true } 
});

export default mongoose.model('AIService', aiServiceSchema);