import { Router } from 'express';
import { handleGetVideoAnalytics, handleGetOverallSummary, handleGetVideoIds } from '../controllers/analyticsController.js';

const router = Router();

router.get('/videos', handleGetVideoAnalytics);
router.get('/summary', handleGetOverallSummary);
router.get('/video-ids', handleGetVideoIds);

export default router;
