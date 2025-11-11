import express from 'express';
import { submitContactForm, testEmailService } from '../controllers/contactController.js';

const router = express.Router();

router.post('/submit', submitContactForm);
router.get('/test', testEmailService);

export default router;