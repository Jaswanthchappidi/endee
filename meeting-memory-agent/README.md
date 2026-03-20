# 🎙️ Meeting Memory Agent

An intelligent **Retrieval-Augmented Generation (RAG)** system that acts as a searchable memory for your meetings. It lets you **store, index, and query** meeting transcripts using natural language, returning **context-grounded answers**.

Built on the **Endee Vector Database architecture**, this project demonstrates a clean, practical implementation of semantic search + RAG.

---

## 🎥 Demo

👉 [Watch Demo Video](YOUR_VIDEO_LINK_HERE)

---

## 🧠 System Flow (RAG Pipeline)

```
User Query → Embedding → Endee (Vector Store) → Similarity Retrieval → Context → LLM → Final Answer
```

### Step-by-step

1. 📄 Upload meeting transcripts / notes
2. ✂️ Chunk text into meaningful segments
3. 🔢 Convert each chunk into embeddings
4. 💾 Store embeddings in Endee-style vector storage (`meetings_db.json`)
5. ❓ Convert user query into embedding
6. 🔍 Retrieve top-k similar chunks (semantic search)
7. 🤖 Generate answer using LLM with retrieved context

---

## ⚙️ Use of Endee (Core Requirement)

This project uses **Endee Vector Database principles** for:

* **Embedding Storage**: Stores vector representations of meeting chunks
* **Similarity Search**: Retrieves relevant context using vector distance
* **RAG Workflow**: Powers retrieval-augmented generation pipeline
* **Local Indexing**: Fast and lightweight storage via `meetings_db.json`

> Designed to be compatible with full Endee core for future scalability.

---

## ✨ Key Features

* 🔍 **Semantic Search**: Finds the most relevant meeting segments (not keyword-based)
* 🧠 **RAG Pipeline**: Combines retrieval + generation for accurate answers
* 📁 **Project-based Filtering**: Organize meetings by title/project
* 📊 **Confidence Signals**: Shows retrieval strength / relevance
* 🔐 **Secure Backend**: API keys never exposed to frontend
* ⚡ **Real-time Indexing**: Instant ingestion and querying

---

## 🚀 How to Use

1. **Upload Meetings** → Add transcripts or notes
2. **Indexing** → System chunks + embeds + stores in Endee
3. **Ask Questions** → e.g., *“What were the action items from the budget meeting?”*
4. **View Sources** → See exact chunks used for answers

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express
* **LLM Access**: OpenRouter (Claude 3 Haiku or similar)
* **Vector Storage**: Endee-style local vector DB
* **Frontend**: HTML, JS (SPA)

---

## 🔒 Security

* API key stored in `.env` (server-side only)
* No client-side exposure
* `.gitignore` prevents sensitive data leaks

---

## 🧩 Project Structure

```
meeting-memory-agent/
│── index.html          # Frontend UI
│── server.js           # Backend API (Express)
│── meetings_db.json    # Vector storage (embeddings)
│── .env                # Environment variables (ignored)
│── .gitignore          # Protects sensitive files
│── probe_endee.js      # Endee interaction/testing
│── package.json        # Dependencies
```

---

## 🛠️ Setup & Installation

### Prerequisites

* Node.js (v18+)
* npm (v9+)

### 1. Install

```
cd meeting-memory-agent
npm install
```

### 2. Configure `.env`

```
OPENROUTER_API_KEY=your_key_here
PORT=3001
```

### 3. Run

```
npm start
```

👉 Open: [http://localhost:3001](http://localhost:3001)

---

## 🎯 Example Queries

* “What decisions were made in yesterday’s meeting?”
* “List all action items from the sprint review”
* “Who is responsible for deployment?”

---

## 🚧 Future Improvements

* Hybrid search (keyword + vector)
* Integration with full Endee core server
* Better UI/UX and visualization
* Multi-user support
* Cloud deployment

---

## 📌 Important Notes

* Ensure `.env` is not committed
* Verify `.gitignore` is working
* Keep dependencies updated

---

## 🏁 Conclusion

This project demonstrates a **real-world AI system using Endee**, showcasing how vector databases enable **intelligent retrieval and contextual reasoning** over unstructured meeting data.

---

**⭐ Built with Endee | RAG | Semantic Search**
