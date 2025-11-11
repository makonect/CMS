import express from 'express';
import { trackPageView, getTrafficStats, getTrafficOverTime } from '../controllers/trafficController.js';

const router = express.Router();

router.post('/track', trackPageView);
router.get('/stats', getTrafficStats);
router.get('/overtime', getTrafficOverTime);

export default router;