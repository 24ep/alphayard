import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';
import { authenticateAdmin } from '../../middleware/adminAuth';
import { requirePermission } from '../../middleware/permissionCheck';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Apply admin auth middleware to all routes
router.use(authenticateAdmin as any);

// Supported provider types
const PROVIDER_TYPES = ['google', 'facebook', 'apple', 'github', 'microsoft', 'twitter', 'x', 'linkedin', 'discord', 'slack', 'line', 'custom', 'saml', 'oidc'];

// Get all SSO providers
router.get('/', requirePermission('settings', 'view'), async (req: Request, res: Response) => {
  try {
    const { enabled } = req.query;
    
    // Build where conditions for Prisma
    const whereConditions: any = {};
    
    if (enabled !== undefined) {
      whereConditions.isEnabled = enabled === 'true';
    }
    
    const result = await prisma.oAuthProvider.findMany({
      where: whereConditions,
      orderBy: [
        { displayOrder: 'asc' },
        { providerName: 'asc' }
      ]
    });
    
    res.json({
      success: true,
      providers: result.map((row: any) => ({
        id: row.id,
        name: row.providerName,
        displayName: row.displayName,
        providerType: row.providerName, // Mapping provider_name to providerType
        enabled: row.isEnabled,
        clientId: row.clientId,
        clientSecret: row.clientSecret ? '********' : null,
        authorizationUrl: row.authorizationUrl,
        tokenUrl: row.tokenUrl,
        userinfoUrl: row.userinfoUrl,
        jwksUrl: row.jwksUrl,
        scopes: row.scopes,
        claimsMapping: row.claimsMapping,
        iconUrl: row.iconUrl,
        buttonColor: row.buttonColor,
        displayOrder: row.displayOrder,
        autoCreateUsers: row.allowSignup,
        allowedDomains: row.allowedDomains,
        defaultRole: row.defaultRole,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching SSO providers:', error);
    res.status(500).json({ error: 'Failed to fetch SSO providers' });
  }
});

// Get a single SSO provider
router.get('/:id', requirePermission('settings', 'view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const provider = await prisma.oAuthProvider.findUnique({
      where: { id }
    });
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json({
      success: true,
      provider: {
        id: provider.id,
        name: provider.providerName,
        displayName: provider.displayName,
        providerType: provider.providerName,
        enabled: provider.isEnabled,
        clientId: provider.clientId,
        clientSecret: provider.clientSecret ? '********' : null,
        authorizationUrl: provider.authorizationUrl,
        tokenUrl: provider.tokenUrl,
        userinfoUrl: provider.userinfoUrl,
        jwksUrl: provider.jwksUrl,
        scopes: provider.scopes,
        claimsMapping: provider.claimsMapping,
        iconUrl: provider.iconUrl,
        buttonColor: provider.buttonColor,
        displayOrder: provider.displayOrder,
        autoCreateUsers: provider.allowSignup,
        allowedDomains: provider.allowedDomains,
        defaultRole: provider.defaultRole,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching SSO provider:', error);
    res.status(500).json({ error: 'Failed to fetch SSO provider' });
  }
});

// Create a new SSO provider
router.post('/', [
  requirePermission('settings', 'edit'),
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('providerType').isIn(PROVIDER_TYPES).withMessage('Invalid provider type'), // Assuming name from frontend is providerType
  body('clientId').optional().trim(),
  body('clientSecret').optional().trim(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name, // providerName from frontend
      displayName,
      providerType, // redundant if name is providerType? Front end sends providerType.
      enabled = false,
      clientId,
      clientSecret,
      authorizationUrl,
      tokenUrl,
      userinfoUrl,
      jwksUrl,
      scopes,
      claimsMapping,
      iconUrl,
      buttonColor,
      displayOrder,
      autoCreateUsers = true,
      allowedDomains,
      defaultRole = 'user'
    } = req.body;
    
    const id = uuidv4();
    
    // Use providerType as provider_name if available, else name
    const providerName = providerType || name || 'custom';

    const provider = await prisma.oAuthProvider.create({
      data: {
        providerName,
        displayName: displayName || providerName,
        isEnabled: enabled,
        clientId: clientId || '',
        clientSecret: clientSecret || '',
        authorizationUrl,
        tokenUrl,
        userinfoUrl,
        jwksUrl,
        scopes: scopes || [],
        claimsMapping: claimsMapping || {},
        iconUrl,
        buttonColor,
        displayOrder: displayOrder || 0,
        allowSignup: autoCreateUsers,
        allowedDomains: allowedDomains || [],
        defaultRole
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'SSO provider created',
      provider: {
        id: provider.id,
        name: provider.providerName,
        displayName: provider.displayName,
        providerType: provider.providerName,
        enabled: provider.isEnabled,
        clientId: provider.clientId,
        clientSecret: provider.clientSecret ? '********' : null,
        authorizationUrl: provider.authorizationUrl,
        tokenUrl: provider.tokenUrl,
        userinfoUrl: provider.userinfoUrl,
        jwksUrl: provider.jwksUrl,
        scopes: provider.scopes,
        claimsMapping: provider.claimsMapping,
        iconUrl: provider.iconUrl,
        buttonColor: provider.buttonColor,
        displayOrder: provider.displayOrder,
        autoCreateUsers: provider.allowSignup,
        allowedDomains: provider.allowedDomains,
        defaultRole: provider.defaultRole,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error creating SSO provider:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A provider with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create SSO provider' });
  }
});

// Update an SSO provider
router.put('/:id', [
  requirePermission('settings', 'edit'),
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      displayName,
      providerType,
      enabled,
      clientId,
      clientSecret,
      authorizationUrl,
      tokenUrl,
      userinfoUrl,
      jwksUrl,
      scopes,
      claimsMapping,
      iconUrl,
      buttonColor,
      displayOrder,
      autoCreateUsers,
      allowedDomains,
      defaultRole
    } = req.body;
    
    // Build update data object
    const updateData: any = {};
    
    if (name !== undefined) { updateData.providerName = name; }
    if (displayName !== undefined) { updateData.displayName = displayName; }
    if (enabled !== undefined) { updateData.isEnabled = enabled; }
    if (clientId !== undefined) { updateData.clientId = clientId; }
    // Only update client_secret if it's not the masked value
    if (clientSecret !== undefined && clientSecret !== '********') {
      updateData.clientSecret = clientSecret;
    }
    if (authorizationUrl !== undefined) { updateData.authorizationUrl = authorizationUrl; }
    if (tokenUrl !== undefined) { updateData.tokenUrl = tokenUrl; }
    if (userinfoUrl !== undefined) { updateData.userinfoUrl = userinfoUrl; }
    if (jwksUrl !== undefined) { updateData.jwksUrl = jwksUrl; }
    if (scopes !== undefined) { updateData.scopes = scopes; }
    if (claimsMapping !== undefined) { updateData.claimsMapping = claimsMapping; }
    if (iconUrl !== undefined) { updateData.iconUrl = iconUrl; }
    if (buttonColor !== undefined) { updateData.buttonColor = buttonColor; }
    if (displayOrder !== undefined) { updateData.displayOrder = displayOrder; }
    if (autoCreateUsers !== undefined) { updateData.allowSignup = autoCreateUsers; }
    if (allowedDomains !== undefined) { updateData.allowedDomains = allowedDomains; }
    if (defaultRole !== undefined) { updateData.defaultRole = defaultRole; }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const provider = await prisma.oAuthProvider.update({
      where: { id },
      data: updateData
    });
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json({
      success: true,
      message: 'SSO provider updated',
      provider: {
        id: provider.id,
        name: provider.providerName,
        displayName: provider.displayName,
        enabled: provider.isEnabled
      }
    });
  } catch (error) {
    console.error('Error updating SSO provider:', error);
    res.status(500).json({ error: 'Failed to update SSO provider' });
  }
});

// Delete an SSO provider
router.delete('/:id', [
  requirePermission('settings', 'edit'),
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.oAuthProvider.delete({
      where: { id }
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json({
      success: true,
      message: 'SSO provider deleted'
    });
  } catch (error) {
    console.error('Error deleting SSO provider:', error);
    res.status(500).json({ error: 'Failed to delete SSO provider' });
  }
});

// Toggle provider status
router.patch('/:id/toggle', [
  requirePermission('settings', 'edit'),
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Toggle the boolean value
    // First get current provider to check current status
    const currentProvider = await prisma.oAuthProvider.findUnique({
      where: { id },
      select: { isEnabled: true }
    });
    
    if (!currentProvider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    // Toggle the status
    const provider = await prisma.oAuthProvider.update({
      where: { id },
      data: { isEnabled: !currentProvider.isEnabled }
    });
    
    res.json({
      success: true,
      enabled: provider.isEnabled
    });
  } catch (error) {
    console.error('Error toggling SSO provider:', error);
    res.status(500).json({ error: 'Failed to toggle SSO provider' });
  }
});

export default router;
