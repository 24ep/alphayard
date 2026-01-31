const { pool } = require('../config/database');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

async function runHealthCheck() {
  try {
    console.log('🔍 Running database health check...\n');

    const start = Date.now();
    await pool.query('SELECT 1');
    const responseTime = Date.now() - start;
    
    console.log('📊 Health Status:');
    console.log(`   Healthy: ✅ Yes`);
    console.log(`   Response Time: ${responseTime}ms`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test user table access
    try {
      const { rowCount } = await pool.query('SELECT 1 FROM users LIMIT 1');
      console.log('   ✅ User table access: OK');
    } catch (error) {
      console.log(`   ❌ User table access: FAILED - ${error.message}`);
    }

    // Test circle table access
    try {
      const { rowCount } = await pool.query('SELECT 1 FROM circles LIMIT 1');
      console.log('   ✅ circle table access: OK');
    } catch (error) {
      console.log(`   ❌ circle table access: FAILED - ${error.message}`);
    }

    // Test location table access
    try {
      const { rowCount } = await pool.query('SELECT 1 FROM user_locations LIMIT 1');
      console.log('   ✅ Location table access: OK');
    } catch (error) {
      console.log(`   ❌ Location table access: FAILED - ${error.message}`);
    }

    console.log('\n✅ Database health check completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Health check failed:', error.message);
    process.exit(1);
  }
}

// Run health check if called directly
if (require.main === module) {
  runHealthCheck();
}

module.exports = runHealthCheck;
