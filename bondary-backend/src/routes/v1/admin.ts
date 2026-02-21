import { Router } from 'express';

// Admin Routes
import boundaryAdminRoutes from '../admin/boundary';
import configRoutes from '../admin/configRoutes';
import authRoutes from '../admin/authRoutes';

const router = Router();

// Admin Routes
router.use('/admin', boundaryAdminRoutes);
router.use('/admin/config', configRoutes);
router.use('/admin/auth', authRoutes);

export default router;
