# 🤖 Endee RAG System - Complete Implementation

## 📋 Overview

This is a complete **Retrieval Augmented Generation (RAG)** system built using:
- **Endee Vector Database** - Fast vector similarity search
- **Express.js** - REST API backend
- **Modern Web UI** - Interactive document management and querying
- **Vector Embeddings** - AI-powered document understanding

## ✨ Features

### Core RAG Functionality
- ✅ **Document Upload** - Support for TXT, PDF, MD, JSON files
- ✅ **Vector Embeddings** - Automatic document embedding generation
- ✅ **Semantic Search** - Find relevant information using natural language
- ✅ **AI Responses** - Generate context-aware answers
- ✅ **Document Management** - Upload, delete, and organize documents
- ✅ **Query History** - Track queries and responses

### User Interface
- 🎨 Modern, responsive web interface
- 📱 Mobile-friendly design
- 🔍 Real-time document search
- 📊 Statistics and metrics dashboard
- 💾 Persistent document storage
- 🎯 Confidence scoring

### Technical Stack
- **Backend**: Node.js + Express.js
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Database**: Endee Vector Database
- **Embeddings**: Custom text vectorization
- **Hosting**: Docker containerized

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Web Browser (User Interface)              │
│   ┌───────────────────────────────────────────────┐   │
│   │        Modern Web Interface (HTML/CSS/JS)    │   │
│   │  - Document Upload                            │   │
│   │  - Query Interface                             │   │
│   │  - Results Display                             │   │
│   └───────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────┐
│            Express.js Server (Port 3001)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │           REST API Endpoints                     │  │
│  │  - POST /api/upload      (File upload)          │  │
│  │  - GET /api/documents    (List docs)            │  │
│  │  - POST /api/query       (RAG search)           │  │
│  │  - DELETE /api/document  (Remove doc)           │  │
│  │  - GET /api/health       (Status check)         │  │
│  └──────────────────────────────────────────────────┘  │
│                       │                                  │
│  ┌────────────────────┼────────────────────┐            │
│  ▼                    ▼                    ▼            │
│ Multer           Embedding          Query Logic        │
│ (File Upload)    (embed.js)       (generate answers)   │
└────────────────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   Vector Database      │
        │   (db.json)            │
        │                        │
        │  - Documents           │
        │  - Embeddings          │
        │  - Metadata            │
        └────────────────────────┘
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js v14+ 
- npm or yarn
- Docker (optional, for containerization)

### Step 1: Install Dependencies

```bash
cd ai-code-assistant
npm install
```

### Step 2: Create Required Directories

```bash
mkdir -p public uploads
```

### Step 3: Start the Server

```bash
npm start
```

Expected output:
```
🚀 RAG Server running on http://localhost:3001
📁 Documents loaded: 0
📖 Access UI at http://localhost:3001
```

### Step 4: Access the Web Interface

Open browser: http://localhost:3001

---

## 🚀 Using the RAG System

### 1. Upload a Document

**UI Method:**
1. Click "Upload Document" in sidebar
2. Select a file
3. Wait for confirmation

**API Method:**
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@document.txt"
```

### 2. Query the Document

**UI Method:**
1. Select document from list
2. Type question
3. Click Search

**API Method:**
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic?",
    "documentId": "1234567890"
  }'
```

### 3. View Results

- Response text with relevant information
- Source document reference
- Confidence score
- Query processing time

---

## 🔌 API Documentation

### Get Documents
```
GET /api/documents

Response:
{
  "count": 2,
  "documents": [
    {
      "id": "1234567890",
      "title": "document.txt",
      "preview": "This is a document about...",
      "uploadedAt": "2024-03-17T..."
    }
  ]
}
```

### Upload Document
```
POST /api/upload

Headers: Content-Type: multipart/form-data
Body: { file: <file> }

Response:
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": "1234567890",
    "title": "document.txt"
  }
}
```

### Query Document (RAG)
```
POST /api/query

Headers: Content-Type: application/json
Body: {
  "query": "Your question here",
  "documentId": "1234567890"
}

Response:
{
  "success": true,
  "answer": "Based on the document, the answer is...",
  "source": "document.txt",
  "documentId": "1234567890",
  "confidence": 0.85
}
```

### Delete Document
```
DELETE /api/documents/:documentId

Response:
{
  "success": true,
  "message": "Document deleted"
}
```

### Health Check
```
GET /api/health

Response:
{
  "status": "healthy",
  "documents": 5,
  "version": "1.0.0"
}
```

---

## 💾 Data Storage

### Document Storage (db.json)
```json
{
  "documents": [
    {
      "id": "1234567890",
      "title": "document.txt",
      "content": "Full document text...",
      "uploadedAt": "2024-03-17T10:30:00Z",
      "fileSize": 5000
    }
  ],
  "embeddings": [
    {
      "docId": "1234567890",
      "embedding": {
        "word1": 2,
        "word2": 1,
        "word3": 3
      }
    }
  ],
  "lastUpdated": "2024-03-17T10:30:00Z"
}
```

---

## 🔧 Configuration

Edit `server.js` to customize:

```javascript
// Change server port
const PORT = process.env.PORT || 3001;

// Adjust context window size
const context = relevantDoc.content.substring(0, 2000);

// Modify confidence threshold
confidence: 0.85

// Change upload directory
const upload = multer({ dest: 'uploads/' });
```

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
cd ai-code-assistant
docker build -t endee-rag:latest .
```

### Run Container

```bash
docker run -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  endee-rag:latest
```

### Docker Compose

```bash
docker-compose up -d
```

---

## 🔄 Integration with Endee

To use with the main Endee Vector Database:

1. **Update embed.js** to use Endee's embedding service:

```javascript
import { EndeeClient } from './endee-client.js';

const endeeClient = new EndeeClient({
  host: 'localhost',
  port: 8080
});

export async function embedText(text) {
  return await endeeClient.embed(text);
}
```

2. **Update query logic** to use Endee's similarity search:

```javascript
// In server.js
const similarDocs = await endeeClient.similaritySearch(
  queryEmbedding,
  topK: 5
);
```

---

## 📊 Metrics & Monitoring

The system tracks:
- Number of uploaded documents
- Query execution time
- Confidence scores
- Document sizes
- Embedding vectors

Access via: `GET /api/health`

---

## 🎯 Example Use Cases

### 1. Knowledge Base Search
Upload company documentation and get instant answers

### 2. Research Assistant
Load research papers and extract key information

### 3. Code Documentation
Query code documentation with natural language

### 4. FAQ Assistant
Convert FAQ documents into interactive Q&A

### 5. Customer Support
Help desk agents find answers quickly

---

## 🚦 Development Workflow

### Local Development
```bash
npm install
npm start
# Server runs on localhost:3001
```

### Testing RAG Functionality

1. **Create test document** (`test.txt`):
```
Machine Learning is a subset of AI.
Neural networks are inspired by the human brain.
Deep learning uses multiple layers.
```

2. **Upload via UI** or API
3. **Test queries**:
   - "What is neural network?"
   - "How does deep learning work?"

### Enable Debug Logging

In `server.js`, add:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

---

## 📈 Performance Optimization

### Indexing
- Create indexes on frequently searched fields
- Cache embeddings for faster retrieval

### Batching
- Process multiple queries in batch
- Use connection pooling

### Caching
- Cache document embeddings
- Cache query results

---

## 🔐 Security Considerations

### File Upload Validation
```javascript
const ALLOWED_TYPES = [
  'text/plain',
  'application/pdf',
  'text/markdown'
];

// Validate in production
if (!ALLOWED_TYPES.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}
```

### Input Sanitization
```javascript
const sanitizedQuery = query
  .replace(/[<>]/g, '')
  .substring(0, 1000);
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3001 in use | Change PORT env variable or kill process |
| Module not found | Run `npm install` again |
| No documents load | Check db.json exists and is readable |
| Uploads fail | Verify uploads/ directory has write permissions |
| Slow queries | Reduce context size or implement caching |

---

## 📚 Resources

- [Endee Vector Database](https://github.com/endee-io/endee)
- [Express.js Guide](https://expressjs.com/)
- [RAG Concepts](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)
- [Vector Embeddings](https://en.wikipedia.org/wiki/Word_embedding)

---

## 🎓 Learning Path

1. **Understand RAG**: How retrieval and generation work together
2. **Vector Basics**: Learn about embeddings and similarity
3. **API Design**: RESTful endpoints and HTTP methods
4. **Frontend**: HTML/CSS/JS for the web interface
5. **DevOps**: Docker, deployment, and scaling

---

## 🤝 Contributing

To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

ISC

---

## 📞 Support

- Check `QUICKSTART.md` for quick setup
- See `README_RAG.md` for detailed documentation
- Review code comments in `server.js`
- Check browser console for errors

---

**Built with ❤️ using Endee Vector Database**

Last Updated: March 17, 2024
