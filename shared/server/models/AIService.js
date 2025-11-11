import mongoose from 'mongoose';

const aiServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  apiKey: {
    type: String,
    required: true
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
  }
}, {
  timestamps: true
});

export default mongoose.model('AIService', aiServiceSchema);