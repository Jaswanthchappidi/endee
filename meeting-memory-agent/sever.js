import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import natural from 'natural';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Vector Processing Logic (Reused & Adapted)
class MeetingManager {
  constructor() {
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
    this.dbPath = path.join(__dirname, 'meetings_db.json');
    this.load() || this.reset();
  }

  reset() {
    this.meetings = [];
    this.chunks = [];
    this.vocab = [];
    this.save();
  }

  load() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
        this.meetings = data.meetings || [];
        this.chunks = data.chunks || [];
        this.vocab = data.vocab || [];
        return true;
      }
    } catch (e) { console.error('Error loading DB:', e); }
    return false;
  }

  save() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify({
        meetings: this.meetings,
        chunks: this.chunks,
        vocab: this.vocab
      }, null, 2));
    } catch (e) { console.error('Error saving DB:', e); }
  }

  tokenize(text) {
    return this.tokenizer.tokenize(text.toLowerCase())
      .filter(w => w.length > 2)
      .map(w => this.stemmer.stem(w));
  }

  addMeeting(title, date, project, content) {
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

    // 2. Global Indexing
    meetingChunks.forEach((text, i) => {
      const tokens = this.tokenize(text);
      this.chunks.push({
        id: `${Date.now()}_${i}`,
        meetingTitle: title,
        date,
        project,
        text,
        tokens
      });
    });

    this.meetings.push({ title, date, project, chunkCount: meetingChunks.length });
    this.save();
    return meetingChunks.length;
  }

  deleteMeeting(title) {
    this.meetings = this.meetings.filter(m => m.title !== title);
    this.chunks = this.chunks.filter(c => c.meetingTitle !== title);
    this.save();
  }

  search(query, project = null, topK = 6) {
    const qTokens = new Set(this.tokenize(query));
    if (qTokens.size === 0) return [];

    let filteredChunks = this.chunks;
    if (project) filteredChunks = filteredChunks.filter(c => c.project === project);

    const scores = filteredChunks.map(chunk => {
      let match = 0;
      const cTokens = new Set(chunk.tokens);
      qTokens.forEach(t => { if (cTokens.has(t)) match++; });
      return { chunk, score: match / Math.sqrt(chunk.tokens.length || 1) };
    });

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter(s => s.score > 0)
      .map(s => s.chunk);
  }
}

const manager = new MeetingManager();

// Endpoints
app.get('/api/meetings', (req, res) => {
  res.json({ success: true, meetings: manager.meetings, totalChunks: manager.chunks.length });
});

app.post('/api/index', (req, res) => {
  const { title, date, project, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

  const count = manager.addMeeting(title, date, project || 'General', content);
  res.json({ success: true, chunksIndex: count });
});

app.delete('/api/meetings/:title', (req, res) => {
  const { title } = req.params;
  manager.deleteMeeting(title);
  res.json({ success: true });
});

app.post('/api/query', async (req, res) => {
  const { query, project, apiKey } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  const relevantChunks = manager.search(query, project);

  if (relevantChunks.length === 0) {
    return res.json({
      answer: "I couldn't find any relevant information across your meeting notes. Try being more specific or adding more notes.",
      sources: []
    });
  }

  const context = relevantChunks.map(c =>
    `[Meeting: "${c.meetingTitle}" | Date: ${c.date} | Project: ${c.project}]\n${c.text}`
  ).join('\n\n---\n\n');

  try {
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
  console.log(`\n🚀 Meeting Memory Integrated Backend`);
  console.log(`📡 Serving UI at http://localhost:${PORT}`);
  console.log(`📚 Meetings indexed: ${manager.meetings.length}\n`);
});
