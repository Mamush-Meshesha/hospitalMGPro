const fetch = require('node-fetch');

async function test() {
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'AdminPassword123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  console.log('Fetching beds...');
  const bedRes = await fetch('http://localhost:3000/api/v1/bed', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const beds = await bedRes.json();
  console.log('BEDS TYPE:', Array.isArray(beds) ? 'Array' : typeof beds);
  console.log('BEDS PAYLOAD:', beds);

  console.log('\nTrying admit...');
  const locRes = await fetch('http://localhost:3000/api/v1/location', { headers: { 'Authorization': `Bearer ${token}` } });
  const locs = await locRes.json();
  const locUuid = locs.results[0].uuid;

  const vtRes = await fetch('http://localhost:3000/api/v1/visittype', { headers: { 'Authorization': `Bearer ${token}` } });
  const vts = await vtRes.json();
  const vtUuid = vts.results[0].uuid;

  const patRes = await fetch('http://localhost:3000/api/v1/patient', { headers: { 'Authorization': `Bearer ${token}` } });
  const pats = await patRes.json();
  const patUuid = pats.results[0].uuid;

  console.log(`P: ${patUuid}, L: ${locUuid}, VT: ${vtUuid}`);

  const admitRes = await fetch('http://localhost:3000/api/v1/visit/admit', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientUuid: patUuid, locationUuid: locUuid, visitTypeUuid: vtUuid })
  });
  const admitData = await admitRes.json();
  console.log('ADMIT RESULT:', admitData);
}

test();
