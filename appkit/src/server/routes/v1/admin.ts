import { Router } from 'express';

// Admin & CMS Routes
import adminRoutes from '../admin/admin';
import adminUsersRoutes from '../admin/adminUsers';
import entityRoutes from '../admin/entityRoutes';
import preferencesRoutes from '../admin/preferences';
import applicationRoutes from '../admin/applicationRoutes';
import auditRoutes from '../admin/audit';
import cmsRoutes from '../admin/cmsRoutes';
import marketingRoutes from '../admin/marketingRoutes';
import localizationRoutes from '../admin/localizationRoutes';
import dynamicContentRoutes from '../admin/dynamicContentRoutes';
import versionControlRoutes from '../admin/versionControlRoutes';
import ssoProvidersRoutes from '../admin/ssoProviders';
import configRoutes from '../admin/config';
import appConfigRoutes from '../admin/appConfigRoutes';
import extendedSettingsRoutes from '../admin/extendedSettingsRoutes';
import pageBuilderRoutes from '../admin/pageBuilderRoutes';
import componentStudioRoutes from '../admin/componentStudio';
import componentRoutes from '../admin/componentRoutes';
import databaseExplorerRoutes from '../admin/databaseExplorer';

const router = Router();

// Authentication Routes
router.use('/admin/auth', adminUsersRoutes);

// Admin Service Routes
// Order is important: specific routes before generic ones
router.use('/admin/applications', applicationRoutes);
router.use('/admin/entities', entityRoutes);
router.use('/admin/preferences', preferencesRoutes);
router.use('/admin/sso-providers', ssoProvidersRoutes);
router.use('/admin/config', configRoutes);
router.use('/admin/app-config', appConfigRoutes);
router.use('/admin', adminRoutes);
router.use('/settings', extendedSettingsRoutes);

// CMS Routes
router.use('/cms', cmsRoutes);
router.use('/cms/marketing', marketingRoutes);
router.use('/cms/localization', localizationRoutes);
router.use('/cms/content', dynamicContentRoutes);
router.use('/cms/versions', versionControlRoutes);

// Page & Component Builder
router.use('/page-builder', pageBuilderRoutes);
router.use('/component-studio', componentStudioRoutes);
router.use('/components', componentRoutes);

// Database Routes
router.use('/database', databaseExplorerRoutes);

// Audit & Other
router.use('/audit', auditRoutes);

export default router;
