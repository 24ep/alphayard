const axios = require('axios');

async function check() {
  try {
    const res = await axios.get('http://localhost:4000/api/mobile/branding');
    const screens = res.data.branding.screens;
    const targetIds = ['welcome', 'onboarding'];
    
    console.log('--- TARGET SCREENS ---');
    screens.filter(s => targetIds.includes(s.id)).forEach(s => {
      console.log(`ID: ${s.id}`);
      console.log(`Name: ${s.name}`);
      console.log(`Background: ${JSON.stringify(s.background, null, 2)}`);
      console.log('-------------------');
    });
  } catch (err) {
    console.error('Error fetching branding:', err.message);
  }
}

check();
