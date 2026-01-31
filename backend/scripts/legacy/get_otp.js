const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
});

async function getOtp() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT raw_user_meta_data 
      FROM public.users 
      WHERE email = 'test_manual_verify@bondarys.com'
    `);
    
    if (res.rows.length > 0) {
      console.log('OTP Data:', JSON.stringify(res.rows[0].raw_user_meta_data));
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

getOtp();
