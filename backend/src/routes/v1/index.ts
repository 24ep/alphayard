import { Router } from 'express';
import authRoutes from '../auth';
import userRoutes from '../users';
import circleRoutes from '../circles';
import chatRoutes from '../chat';
import chatAttachmentRoutes from '../chatAttachments';
import locationRoutes from '../location';
import safetyRoutes from '../safety';
import safetyIncidentsRoutes from '../safetyIncidents';
import storageRoutes from '../storage';
import calendarRoutes from '../calendar';
import notesRoutes from '../notes';
import todosRoutes from '../todos';
import socialRoutes from '../social';
import financialRoutes from '../financial';
import translationsRoutes from '../translations';
import emotionsRoutes from '../emotions';
import circleTypeRoutes from '../circleTypeRoutes';
import galleryRoutes from '../gallery';
import miscRoutes from '../misc';
import settingsRoutes from '../settings';
import notificationRoutes from '../notifications';

// CMS Routes
import cmsRoutes from '../cmsRoutes';
import marketingRoutes from '../marketingRoutes';
import localizationRoutes from '../localizationRoutes';
import dynamicContentRoutes from '../dynamicContentRoutes';
import versionControlRoutes from '../versionControlRoutes';
import mobileRoutes from '../mobileRoutes';

// Admin Routes
import adminRoutes from '../admin';
import adminUsersRoutes from '../adminUsers';
import entityRoutes from '../entityRoutes';
import preferencesRoutes from '../preferences';
import applicationRoutes from '../applicationRoutes';
import auditRoutes from '../audit';

const router = Router();

// Core routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes); // Dashboard, Users, Families, etc.
router.use('/admin', adminUsersRoutes); // /admin-users, /roles
router.use('/admin/auth', adminUsersRoutes); // /login (aliased for frontend compatibility)
router.use('/admin/entities', entityRoutes);
router.use('/admin/preferences', preferencesRoutes);
router.use('/admin/applications', applicationRoutes);
router.use('/audit', auditRoutes);
router.use('/users', userRoutes);
router.use('/circles', circleRoutes);

// Communication
router.use('/chat', chatRoutes);
router.use('/chat-attachments', chatAttachmentRoutes);

// Features
router.use('/location', locationRoutes);
router.use('/safety', safetyRoutes);
// Safety incidents mounted on same path in server.ts, likely should be separate or merged. 
// In server.ts: app.use('/api/v1/safety', safetyIncidentsRoutes);
// We'll keep it as is:
router.use('/safety', safetyIncidentsRoutes); 

router.use('/storage', storageRoutes);
router.use('/calendar', calendarRoutes);
router.use('/notes', notesRoutes);
router.use('/todos', todosRoutes);
router.use('/social', socialRoutes);
router.use('/finance', financialRoutes);
router.use('/emotions', emotionsRoutes);
router.use('/translations', translationsRoutes);
router.use('/circle-types', circleTypeRoutes);
router.use('/gallery', galleryRoutes);
router.use('/misc', miscRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationRoutes);

router.use('/cms', cmsRoutes);
router.use('/cms/marketing', marketingRoutes);
router.use('/cms/localization', localizationRoutes);
router.use('/cms/content', dynamicContentRoutes);
router.use('/cms/versions', versionControlRoutes);
router.use('/mobile', mobileRoutes);

export default router;
