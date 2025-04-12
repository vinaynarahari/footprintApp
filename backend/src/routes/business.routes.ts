import { Router } from 'express';
import { classifyBusiness, classifyBusinessBatch } from '../controllers/business.controller';

const router = Router();

router.post('/classify', classifyBusiness);
router.post('/classify/batch', classifyBusinessBatch);

export default router; 