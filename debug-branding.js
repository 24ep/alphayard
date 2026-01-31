const fetch = require('node-fetch');

async function check() {
  try {
    const res = await fetch('http://localhost:4000/api/mobile/branding');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

check();
