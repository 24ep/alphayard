import express from 'express';
import { authenticateToken, optionalCircleMember } from '../../middleware/auth';
// import NotesController from '../../controllers/mobile/NotesController';
import storageService from '../../services/storageService';

const router = express.Router();

router.use(authenticateToken as any);
router.use(optionalCircleMember as any);

// Temporarily disabled - controller needs more methods
// TODO: Implement all required NotesController methods

// Mock endpoint to prevent 404s - trigger restart
router.get('/', (req, res) => {
  res.json({ notes: [], message: 'Notes endpoint temporarily disabled' });
});

export default router;
