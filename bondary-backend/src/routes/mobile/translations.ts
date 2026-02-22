import { Router } from 'express';
import { TranslationController } from '../../controllers/admin/TranslationController';
// import { authenticateToken, requireAdmin } from '../../middleware/auth'; // Uncomment when auth is ready

const router = Router();

// Create new routes
router.get('/', TranslationController.getAllTranslations);
router.post('/', TranslationController.upsertTranslation);
router.delete('/:key', TranslationController.deleteTranslation);

export default router;
