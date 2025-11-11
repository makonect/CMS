import express from 'express';
import { uploadImage, uploadLogo, handleImageUpload, handleLogoUpload } from '../controllers/uploadController.js';

const router = express.Router();

// Upload image endpoint
router.post('/image', uploadImage.single('image'), handleImageUpload);

// Upload logo endpoint
router.post('/logo', uploadLogo.single('logo'), handleLogoUpload);

export default router;