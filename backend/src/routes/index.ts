import { Router } from 'express';
import plaidRoutes from './plaid.routes';
import userRoutes from './user.routes';
import transactionRoutes from './transaction.routes';
import testRoutes from './test.routes';

const router = Router();

router.use('/plaid', plaidRoutes);
router.use('/users', userRoutes);
router.use('/transactions', transactionRoutes);
router.use('/test', testRoutes);

export default router; 