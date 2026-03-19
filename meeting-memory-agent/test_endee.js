import msgpack from 'msgpack-lite';
import fetch from 'node-fetch';

const ENDEE_URL = 'http://localhost:8081/api/v1';
const INDEX_NAME = 'meetings';

async function testConnection() {
  console.log(`🔍 Checking Endee index: ${INDEX_NAME}`);
  
  try {
    const res = await fetch(`${ENDEE_URL}/index/${INDEX_NAME}/info`);
    if (res.ok) {
        const data = await res.json();
        console.log('✅ Endee index ready:', data);
    } else {
        const text = await res.text();
        console.error('❌ Endee index error:', res.status, text);
    }
  } catch (e) {
    console.error('❌ Failed to connect to Endee:', e.message);
    console.log('💡 Make sure Endee is running via docker-compose (port 8080)');
  }
}

testConnection();
