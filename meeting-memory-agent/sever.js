import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import natural from 'natural';
import dotenv from 'dotenv';
import msgpack from 'msgpack-lite';
import fetch from 'node-fetch';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Endee Configuration
const ENDEE_URL = process.env.ENDEE_URL || 'http://localhost:8081/api/v1';
const INDEX_NAME = 'meetings';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/**
 * Endee Request Helper
 */
async function endeeRequest(path, method = 'GET', body = null) {
  const url = `${ENDEE_URL}${path}`;
  console.log(`📡 [Endee Req] ${method} ${path}`);
  
  try {
    const options = {
      method,
      headers: { 
        'Content-Type': 'application/json', // Using JSON for reliability
        'Authorization': process.env.NDD_AUTH_TOKEN || ''
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
      if (path.includes('search')) {
        console.log(`📡 [Endee Search Detail] k=${body.k}, filter=${body.filter || 'none'}`);
      }
    }
    
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const buffer = await res.arrayBuffer();
    
    if (buffer.byteLength === 0) {
      return { success: res.ok };
    }

    let decoded;
    const bodyStr = Buffer.from(buffer).toString();
    if (contentType.includes('msgpack')) {
      decoded = msgpack.decode(Buffer.from(buffer));
    } else {
      try {
        decoded = JSON.parse(bodyStr);
      } catch (e) {
        // Fallback for plain text responses
        decoded = { success: true, message: bodyStr };
      }
    }
    
    if (!res.ok) {
      console.error(`❌ Endee Error (${res.status}):`, decoded);
      return { error: decoded, status: res.status };
    }
    
    return decoded;
  } catch (e) {
    console.error(`❌ Endee Connection Error:`, e.message);
    return { error: e.message };
  }
}

/**
 * Improved Vector Generation (Pseudorandom distributed hashing)
 */
function generateVector(text) {
  const dim = 1536;
  const vector = new Array(dim).fill(0.1); // Base noise
  const words = text.toLowerCase().match(/\w+/g) || [];
  
  if (words.length > 0) {
    words.forEach((word) => {
      // MurmurHash3-style hashing
      let h = 0x811c9dc5;
      for (let i = 0; i < word.length; i++) {
        h = Math.imul(h ^ word.charCodeAt(i), 0x01000193);
      }
      
      // Add "spikes" to the vector
      for (let i = 0; i < 5; i++) {
          h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
          h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
          h ^= (h >>> 16);
          // Proper modulo for negative hashes
          const idx = ((h % dim) + dim) % dim;
          vector[idx] += 10.0; // Stronger signal
      }
    });
  }

  // L2 Normalization
  const mag = Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
  return vector.map(v => v / mag);
}

// Vector Processing Logic (Reused & Adapted)
class MeetingManager {
  constructor() {
    this.dbPath = path.join(__dirname, 'meetings_db.json');
    this.load() || this.reset();
    this.initIndex();
  }

  async initIndex() {
    console.log(`🔍 Checking Endee index: ${INDEX_NAME}`);
    const res = await endeeRequest(`/index/${INDEX_NAME}/info`);
    
    if (res?.status === 404 || res?.error?.status === 404) {
        console.log(`🚀 Creating index: ${INDEX_NAME}`);
        await endeeRequest(`/index/create`, 'POST', {
            index_name: INDEX_NAME,
            dim: 1536,
            space_type: 'cosine',
            precision: 'int16'
        });
    } else if (res && !res.error) {
        console.log(`✅ Endee index ready: ${res.total_elements || 0} vectors`);
    } else {
        console.warn(`⚠️ Endee index status unclear:`, res?.error || 'Unknown error');
    }
  }

  async reset() {
    this.meetings = [];
    this.save();
    console.log(`🧹 Deleting entire Endee index: ${INDEX_NAME}`);
    await endeeRequest(`/index/${INDEX_NAME}/delete`, 'DELETE');
    // Manager will automatically re-init on next check or we can call it now
    await this.initIndex();
  }

  load() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
        this.meetings = data.meetings || [];
        return true;
      }
    } catch (e) { console.error('Error loading DB:', e); }
    return false;
  }

  save() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify({
        meetings: this.meetings
      }, null, 2));
    } catch (e) { console.error('Error saving DB:', e); }
  }

  async addMeeting(title, date, project, content) {
    // 1. Chunking
    const sentences = content.match(/[^.!?\n]+[.!?\n]*/g) || [content];
    const meetingChunks = [];
    let cur = '';

    for (const s of sentences) {
      if ((cur + s).length > 400 && cur.length > 0) {
        meetingChunks.push(cur.trim());
        cur = s;
      } else {
        cur += s;
      }
    }
    if (cur.trim()) meetingChunks.push(cur.trim());

    console.log(`🧠 Processing ${meetingChunks.length} chunks for "${title}"...`);

    // 2. Vector Indexing in Endee
    for (let i = 0; i < meetingChunks.length; i++) {
        const text = meetingChunks[i];
        const vector = generateVector(text);
        
        // Wrap object in array for batch-capable insert endpoint
        await endeeRequest(`/index/${INDEX_NAME}/vector/insert`, 'POST', [{
            id: `${Date.now()}_${i}`,
            vector: vector,
            meta: JSON.stringify({
                meetingTitle: title,
                date,
                project,
                text
            })
        }]);
    }

    this.meetings.push({ title, date, project, chunkCount: meetingChunks.length });
    this.save();
    return meetingChunks.length;
  }

  async deleteMeeting(title) {
    this.meetings = this.meetings.filter(m => m.title !== title);
    this.save();

    const filter = [{
        "meetingTitle": { "$eq": title }
    }];

    await endeeRequest(`/index/${INDEX_NAME}/vectors/delete`, 'DELETE', {
        filter: filter 
    });
  }

  async search(query, project = null, topK = 6) {
    const vector = generateVector(query);
    console.log(`🔎 Searching for: "${query}" (Project: ${project || 'All'})`);
    console.log(`🧠 Query Vector (1st 3): [${vector.slice(0, 3).join(', ')}]`);

    const searchParams = {
        vector: vector,
        k: topK, // Server expects 'k'
        ef: 128  // CRITICAL: Search depth must be > 0 for HNSW
    };

    if (project) {
        searchParams.filter = JSON.stringify([{ "project": { "$eq": project } }]);
    }

    const results = await endeeRequest(`/index/${INDEX_NAME}/search`, 'POST', searchParams);
    
    // Log raw structure for debugging retrieval issues
    console.log(`📊 Raw Results:`, JSON.stringify(results)?.substring(0, 500));
    const resultList = results?.results || (Array.isArray(results) ? results : []);
    console.log(`📊 Endee returned ${resultList.length} items`);

    if (!resultList || resultList.length === 0) return [];

    return resultList.map(r => {
        if (!Array.isArray(r)) return { score: 0 };
        
        // Results are in array format: [score, id, meta, ...]
        const score = r[0];
        const rawMeta = r[2];
        
        // Handle metadata which might be a Buffer or String
        let metaStr = '{}';
        if (rawMeta) {
            if (Buffer.isBuffer(rawMeta)) {
                metaStr = rawMeta.toString();
            } else if (typeof rawMeta === 'object' && rawMeta.type === 'Buffer') {
                metaStr = Buffer.from(rawMeta.data).toString();
            } else {
                metaStr = String(rawMeta);
            }
        }
        
        const meta = JSON.parse(metaStr || '{}');
        return {
            ...meta,
            score
        };
    });
  }
}

const manager = new MeetingManager();

// Endpoints
app.get('/api/meetings', (req, res) => {
  res.json({ success: true, meetings: manager.meetings });
});

app.post('/api/index', async (req, res) => {
  const { title, date, project, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

  try {
    const count = await manager.addMeeting(title, date, project || 'General', content);
    res.json({ success: true, chunksIndex: count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/meetings/:title', async (req, res) => {
  const { title } = req.params;
  try {
    await manager.deleteMeeting(title);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/query', async (req, res) => {
  const { query, project } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  try {
    const relevantChunks = await manager.search(query, project);

    if (relevantChunks.length === 0) {
      return res.json({
        answer: "I couldn't find any relevant information across your meeting notes. Try being more specific or adding more notes.",
        sources: []
      });
    }

    const context = relevantChunks.map(c =>
      `[Meeting: "${c.meetingTitle}" | Date: ${c.date} | Project: ${c.project}]\n${c.text}`
    ).join('\n\n---\n\n');

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Meeting Memory'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: `You are a Senior Meeting Analyst. Answer based ONLY on the context below. 
            Identify action items, owners, and decisions. Be professional and concise.
            Context:\n${context}`
          },
          { role: 'user', content: query }
        ]
      })
    });

    const data = await aiRes.json();

    if (!aiRes.ok) {
      console.error(`❌ OpenRouter Error (${aiRes.status}):`, data);
      return res.status(aiRes.status).json({ error: 'AI Provider Error', details: data });
    }

    const answer = data.choices?.[0]?.message?.content || 'No answer generated.';

    res.json({
      answer,
      sources: relevantChunks.map(c => ({ title: c.meetingTitle, date: c.date, text: c.text }))
    });
  } catch (e) {
    console.error('❌ AI Integration Error:', e);
    res.status(500).json({ error: `AI Error: ${e.message}` });
  }
});

app.post('/api/clear', (req, res) => {
  manager.reset();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Meeting Memory with Endee Vector DB`);
  console.log(`📡 Serving UI at http://localhost:${PORT}`);
  console.log(`📚 Meetings: ${manager.meetings.length}\n`);
});