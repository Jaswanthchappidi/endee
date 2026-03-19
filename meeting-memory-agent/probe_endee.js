import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080';
const ENDPOINTS = [
  '/api/v1/health',
  '/api/v1/index/list',
  '/api/v1/stats',
  '/health',
  '/index/list',
  '/v1/index/list'
];

async function probe() {
  for (const path of ENDPOINTS) {
    const url = `${BASE_URL}${path}`;
    try {
      console.log(`📡 Probing ${url}...`);
      const res = await fetch(url);
      const text = await res.text();
      console.log(`  [${res.status}] ${text.substring(0, 100)}`);
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }
  }
}

probe();
