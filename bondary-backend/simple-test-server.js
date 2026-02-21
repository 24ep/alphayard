const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Admin auth endpoints
app.post('/api/v1/admin/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/admin/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'super_admin',
      permissions: ['all'],
      isSuperAdmin: true
    },
    message: 'Admin user retrieved successfully',
    timestamp: new Date().toISOString()
  });
});

// SSO providers endpoint (direct path, not under config)
app.get('/api/v1/admin/sso-providers', (req, res) => {
  res.json({
    success: true,
    data: { 
      providers: [
        {
          id: 'google',
          name: 'Google',
          clientId: 'google-client-id',
          enabled: true
        },
        {
          id: 'microsoft',
          name: 'Microsoft',
          clientId: 'ms-client-id', 
          enabled: false
        }
      ]
    },
    message: 'SSO providers retrieved successfully',
    timestamp: new Date().toISOString()
  });
});

// Applications endpoint (direct path, not under config)
app.post('/api/admin/applications', (req, res) => {
  res.status(201).json({
    success: true,
    data: { 
      application: {
        id: 'new-' + Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
      }
    },
    message: 'Application created successfully',
    timestamp: new Date().toISOString()
  });
});

// Simple branding endpoint
app.get('/api/v1/admin/config/branding', (req, res) => {
  res.json({
    success: true,
    data: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#60a5fa',
      fontFamily: 'Inter, sans-serif',
      tagline: 'Welcome to Admin Panel',
      description: 'Admin configuration panel',
      logoUrl: '/logo.png',
      appName: 'Boundary Admin'
    },
    message: 'Branding retrieved successfully',
    timestamp: new Date().toISOString()
  });
});

// Simple SSO providers endpoint (under config)
app.get('/api/v1/admin/config/sso-providers', (req, res) => {
  res.json({
    success: true,
    data: { 
      providers: [
        {
          id: 'google',
          name: 'Google',
          clientId: 'google-client-id',
          enabled: true
        },
        {
          id: 'microsoft',
          name: 'Microsoft',
          clientId: 'ms-client-id', 
          enabled: false
        }
      ]
    },
    message: 'SSO providers retrieved successfully',
    timestamp: new Date().toISOString()
  });
});

// Simple applications endpoint (under config)
app.get('/api/v1/admin/config/applications', (req, res) => {
  res.json({
    success: true,
    data: { 
      applications: [
        {
          id: '1',
          name: 'Boundary Mobile',
          slug: 'boundary-mobile',
          description: 'Mobile application for boundary management',
          isActive: true,
          logoUrl: '/mobile-logo.png',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: {
            users: 150,
            appSettings: 5
          }
        },
        {
          id: '2',
          name: 'Boundary Admin',
          slug: 'boundary-admin',
          description: 'Admin panel for boundary management',
          isActive: true,
          logoUrl: '/admin-logo.png',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: {
            users: 25,
            appSettings: 10
          }
        }
      ]
    },
    message: 'Applications retrieved successfully',
    timestamp: new Date().toISOString()
  });
});

// Also support /api/admin/config routes for compatibility
app.get('/api/admin/config/branding', (req, res) => res.redirect('/api/v1/admin/config/branding'));
app.get('/api/admin/config/sso-providers', (req, res) => res.redirect('/api/v1/admin/config/sso-providers'));
app.get('/api/admin/config/applications', (req, res) => res.redirect('/api/v1/admin/config/applications'));

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test server is running', 
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/v1/admin/auth/logout',
      'GET  /api/v1/admin/auth/me',
      'GET  /api/v1/admin/config/branding',
      'GET  /api/v1/admin/sso-providers',
      'POST /api/admin/applications',
      'GET  /api/v1/admin/config/sso-providers', 
      'GET  /api/v1/admin/config/applications',
      'GET  /api/admin/config/branding',
      'GET  /api/admin/config/sso-providers',
      'GET  /api/admin/config/applications'
    ]
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
  console.log(`\n📊 Available endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/v1/admin/auth/logout`);
  console.log(`   GET  http://localhost:${PORT}/api/v1/admin/auth/me`);
  console.log(`   GET  http://localhost:${PORT}/api/v1/admin/config/branding`);
  console.log(`   GET  http://localhost:${PORT}/api/v1/admin/sso-providers`);
  console.log(`   POST http://localhost:${PORT}/api/admin/applications`);
  console.log(`   GET  http://localhost:${PORT}/api/v1/admin/config/sso-providers`);
  console.log(`   GET  http://localhost:${PORT}/api/v1/admin/config/applications`);
  console.log(`\n🔧 Test with curl:`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/v1/admin/auth/logout`);
  console.log(`   curl http://localhost:${PORT}/api/v1/admin/config/branding`);
  console.log(`   curl http://localhost:${PORT}/api/v1/admin/sso-providers`);
});
