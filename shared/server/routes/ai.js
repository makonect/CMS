import express from 'express';
import {
  generateAIContent,
  getAIServices,
  createAIService,
  updateAIService,
  deleteAIService,
  testAIService,
  getAIStats
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate', generateAIContent);
router.get('/services', getAIServices);
router.post('/services', createAIService);
router.put('/services/:id', updateAIService);
router.delete('/services/:id', deleteAIService);
router.post('/services/:id/test', testAIService);
router.get('/stats', getAIStats);

export default router;