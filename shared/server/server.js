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
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/logos', express.static(path.join(__dirname, 'uploads', 'logos')));

// Routes
app.use('/api/articles', articleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/websites', websiteRoutes);

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
      // Fallback: return empty array or get categories from articles
      return res.json([]);
    }
    if (req.method === 'POST' && req.path === '/create') {
      // Fallback: return a temporary category object
      return res.json({ 
        _id: `temp-${Date.now()}`, 
        name: req.body.name 
      });
    }
    next();
  });
}

// Website Settings Routes (Add these new routes)
app.use('/api/website-settings', async (req, res, next) => {
  try {
    const websiteSettingsRoutes = await import('./routes/websiteSettings.js');
    return websiteSettingsRoutes.default(req, res, next);
  } catch (error) {
    console.log('⚠️ Website settings routes not found, using fallback');
    // Fallback routes for website settings
    if (req.method === 'PUT' && req.path === '/logo') {
      return res.json({ 
        message: 'Logo upload functionality not available',
        logoUrl: '/uploads/logos/default-logo.png'
      });
    }
    if (req.method === 'PUT' && req.path === '/theme') {
      return res.json({ 
        message: 'Theme update functionality not available',
        theme: req.body.theme || '#000000'
      });
    }
    if (req.method === 'POST' && req.path === '/category') {
      return res.json({ 
        _id: `temp-cat-${Date.now()}`,
        name: req.body.name,
        websiteId: req.body.websiteId
      });
    }
    next();
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LeleDumbo API is running',
    timestamp: new Date().toISOString(),
    categoriesRoutes: categoriesRoutesLoaded ? 'loaded' : 'fallback'
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
});
