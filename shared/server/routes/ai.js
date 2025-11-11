import express from 'express';
import { generateAIContent, getAIServices, updateAIService, testAIService } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate', generateAIContent);
router.get('/services', getAIServices);
router.put('/services/:id', updateAIService);
router.post('/services/:id/test', testAIService);

export default router;