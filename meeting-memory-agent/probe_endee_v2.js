import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080';
const ENDPOINTS = [
  '/',
  '/health',
  '/v1/health',
  '/api/v1/health',
  '/index/list',
  '/v1/index/list',
  '/api/v1/index/list',
  '/stats',
  '/v1/stats',
  '/api/v1/stats'
];

async function probe() {
  console.log(`🚀 Starting Endee API Probe...`);
  for (const path of ENDPOINTS) {
    const url = `${BASE_URL}${path}`;
    try {
      const res = await fetch(url, { timeout: 2000 });
      const text = await res.text();
      console.log(`[${res.status}] ${path} -> ${text.substring(0, 50).replace(/\n/g, ' ')}`);
    } catch (e) {
      console.log(`[ERR] ${path} -> ${e.message}`);
    }
  }
}

probe();
