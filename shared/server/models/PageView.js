import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema({
  website: {
    type: String,
    required: true
  },
  pageUrl: {
    type: String,
    required: true
  },
  pageTitle: {
    type: String,
    required: true
  },
  viewDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
pageViewSchema.index({ website: 1, viewDate: 1 });
pageViewSchema.index({ viewDate: 1 });

export default mongoose.model('PageView', pageViewSchema);