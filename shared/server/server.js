import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import articleRoutes from './routes/articles.js';
import uploadRoutes from './routes/upload.js';
import aiRoutes from './routes/ai.js';
import contactRoutes from './routes/contact.js';
import trafficRoutes from './routes/traffic.js';
import websiteRoutes from './routes/websites.js';

// Initialize dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files - FIXED: Serve from the correct uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/logos', express.static(path.join(__dirname, 'uploads', 'logos')));
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));

// Create uploads directories if they don't exist
import { mkdirSync } from 'fs';
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads', 'logos'),
  path.join(__dirname, 'uploads', 'images')
];

uploadDirs.forEach(dir => {
  try {
    mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } catch (error) {
    console.log(`⚠️ Directory already exists: ${dir}`);
  }
});

// Routes
app.use('/api/articles', articleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/websites', websiteRoutes);

// Add upload error handling (import this from uploadController)
import { handleUploadError } from './controllers/uploadController.js';
app.use('/api/upload', handleUploadError);

// Categories routes with conditional loading
let categoriesRoutesLoaded = false;
try {
  const categoriesModule = await import('./routes/categories.js');
  app.use('/api/categories', categoriesModule.default);
  categoriesRoutesLoaded = true;
  console.log('✅ Categories routes loaded');
} catch (error) {
  console.log('⚠️ Categories routes not found, using fallback');
  // Create a simple categories fallback route
  app.use('/api/categories', (req, res, next) => {
    if (req.method === 'GET' && req.path === '/all') {
      return res.json([]);
    }
    if (req.method === 'POST' && req.path === '/create') {
      return res.json({ 
        _id: `temp-${Date.now()}`, 
        name: req.body.name 
      });
    }
    next();
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LeleDumbo API is running',
    timestamp: new Date().toISOString(),
    categoriesRoutes: categoriesRoutesLoaded ? 'loaded' : 'fallback',
    uploadsPath: path.join(__dirname, 'uploads')
  });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leledumbo';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(error => console.error('❌ MongoDB connection error:', error));

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed due to app termination');
  process.exit(0);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${MONGODB_URI}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`🌐 Uploads available at: http://localhost:${PORT}/uploads/`);
});