
import { Router } from 'express';
// import { authenticate } from '../middleware/auth'; // or adminAuth
import { requireAdmin } from '../middleware/adminAuth'; // Assuming this exists based on pattern
import { PageController } from '../controllers/PageController';

const router = Router();
const pageController = new PageController();

// All routes require admin authentication
router.use(requireAdmin);

// Page Management
router.get('/', (req, res) => pageController.getPages(req, res));
router.post('/', (req, res) => pageController.createPage(req, res));
router.get('/:id', (req, res) => pageController.getPage(req, res));
router.put('/:id', (req, res) => pageController.updatePage(req, res));
router.delete('/:id', (req, res) => pageController.deletePage(req, res));

// Page Actions
router.post('/:id/publish', (req, res) => pageController.publishPage(req, res));
router.put('/:id/components', (req, res) => pageController.saveComponents(req, res));

export default router;
