import { Router } from 'express';
import { handleCreateEvent } from '../controllers/eventsController.js';

const router = Router();

router.post('/', handleCreateEvent);

export default router;
