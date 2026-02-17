import { prisma } from '../src/lib/prisma';

async function seedApplication() {
  try {
    console.log('Seeding test application...');
    
    // Check if application already exists
    const existingApp = await prisma.application.findFirst({
      where: { slug: 'test-app' }
    });
    
    if (existingApp) {
      console.log('Test application already exists');
      return;
    }
    
    // Create test application
    const app = await prisma.application.create({
      data: {
        name: 'Test Application',
        slug: 'test-app',
        description: 'A test application for login configuration',
        branding: {
          appName: 'Test App',
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          accentColor: '#f59e0b'
        },
        settings: {},
        isActive: true
      }
    });
    
    console.log('Test application created:', app);
    
    // Create another test app
    const app2 = await prisma.application.create({
      data: {
        name: 'Demo Application',
        slug: 'demo-app',
        description: 'A demo application for showcasing login configuration',
        branding: {
          appName: 'Demo App',
          primaryColor: '#8b5cf6',
          secondaryColor: '#ec4899',
          accentColor: '#10b981'
        },
        settings: {},
        isActive: true
      }
    });
    
    console.log('Demo application created:', app2);
    
  } catch (error) {
    console.error('Error seeding application:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedApplication();
