// Simple test to verify schema changes
const { PrismaClient } = require('@prisma/client');

async function testSchema() {
  try {
    const prisma = new PrismaClient();
    
    // Test if models are available
    console.log('Testing model availability...');
    
    const models = [
      'page',
      'pageVersion', 
      'publishingWorkflow',
      'cmsTemplate',
      'cmsComponent',
      'componentStyle',
      'cmsCategory',
      'cmsContent',
      'cmsComment'
    ];
    
    for (const model of models) {
      if (prisma[model]) {
        console.log(`✅ ${model} model available`);
      } else {
        console.log(`❌ ${model} model NOT available`);
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error testing schema:', error);
  }
}

testSchema();
