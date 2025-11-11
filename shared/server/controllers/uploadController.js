import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadsDir, 'images');
const logosDir = path.join(uploadsDir, 'logos');

[uploadsDir, imagesDir, logosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const createStorage = (destination) => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, 'file-' + uniqueSuffix + extension);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
  }
};

// Initialize multer instances
export const uploadImage = multer({
  storage: createStorage(imagesDir),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

export const uploadLogo = multer({
  storage: createStorage(logosDir),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: fileFilter
});

// Convert to WebP and create multiple sizes
const processImage = async (filePath, filename) => {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch (error) {
    throw new Error('Sharp image processing library not available');
  }

  const webpFilename = filename.replace(path.extname(filename), '.webp');
  const webpPath = path.join(path.dirname(filePath), webpFilename);

  try {
    // Convert to WebP
    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(webpPath);

    // Create thumbnail (300x200)
    const thumbFilename = `thumb-${webpFilename}`;
    const thumbPath = path.join(path.dirname(filePath), thumbFilename);
    await sharp(filePath)
      .resize(300, 200, { fit: 'inside' })
      .webp({ quality: 70 })
      .toFile(thumbPath);

    // Delete original file
    fs.unlinkSync(filePath);

    return {
      original: `/uploads/images/${webpFilename}`,
      thumbnail: `/uploads/images/${thumbFilename}`
    };
  } catch (error) {
    throw new Error(`Image processing error: ${error.message}`);
  }
};

// Upload image controller
export const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const processedImages = await processImage(req.file.path, req.file.filename);

    res.json({ 
      success: true, 
      images: processedImages,
      message: 'Image uploaded and converted to WebP successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process image',
      details: error.message 
    });
  }
};

// Upload logo controller
export const handleLogoUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const logoPath = `/uploads/logos/${req.file.filename}`;

    res.json({ 
      success: true, 
      logoUrl: logoPath,
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload logo',
      details: error.message 
    });
  }
};