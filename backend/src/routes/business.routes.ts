import { Router } from 'express';
import { classifyBusiness } from '../controllers/business.controller';

const router = Router();

router.post('/classify', classifyBusiness);

export default router; 