# 🎙️ Meeting Memory Agent

**Meeting Memory Agent** is an intelligent Retrieval-Augmented Generation (RAG) system designed to serve as a high-performance memory for your meetings. It allows you to index meeting transcripts, notes, and summaries, and then query them using natural language.

Built on top of the **Endee Vector Database** architecture, this agent provides context-aware answers grounded in your specific meeting data.

---

## ✨ Key Features

- **Semantic Retrieval**: Powered by Endee-style vector retrieval patterns for finding the most relevant meeting segments.
- **AI Intelligence**: Integrated with **OpenRouter** to use state-of-the-art models (like Claude 3 Haiku) for generating nuanced answers.
- **Secure by Design**: A robust backend-only architecture ensures your API keys are never exposed to the client or user interface.
- **Project-Specific Filtering**: Organize and search meetings by project or title.
- **Real-time Progress**: Visual tracking of indexing and search confidence.

---

## 🔒 Security & API Integration

### OpenRouter API Key
The system uses the **OpenRouter API** to communicate with LLM providers. To ensure maximum security:
- **Backend-Only**: The API key is stored exclusively in a server-side `.env` file.
- **No Client Exposure**: The frontend (UI) never handles or transmits the API key. All AI requests are proxied through your local Express.js backend.
- **Git Protection**: The project includes a localized `.gitignore` that prevents your private API keys and local data from being committed to Git.

### Endee Integration
The project leverages the **Endee** ecosystem's high-performance indexing and search principles:
- **Vectorized Search**: Follows the Endee RAG implementation pattern for semantic document understanding.
- **Local Indexing**: Fast, local storage of meeting segments in `meetings_db.json`.
- **Hybrid Search Potential**: Designed to integrate with the full Endee core server for even higher performance and scalability.

---

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Initial Setup
Clone the repository and install dependencies:
```bash
cd meeting-memory-agent
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `meeting-memory-agent` directory:
```env
# Your private OpenRouter API key (Securely handled on backend)
OPENROUTER_API_KEY=your_key_here

# Port for the local backend server
PORT=3001
```

### 3. Run the Application
Start the integrated server:
```bash
node sever.js
```
The server will be reachable at: `http://localhost:3001`

---

## 🚀 How to Use

1. **Upload Meetings**: Add your meeting transcripts or notes.
2. **Indexing**: The system automatically segments and indexes the content using Endee's RAG patterns.
3. **Ask Questions**: Type natural language questions like *"What were the action items from the budget meeting?"*
4. **View Sources**: Click on the source tags to see exactly which part of the meeting the AI used for its answer.

---

## 📁 Project Structure
- `index.html`: The modern, single-page web interface.
- `sever.js`: The high-performance Node.js backend.
- `.env`: Your local, private configuration (ignored by Git).
- `.gitignore`: Ensures your private data stays private.
- `meetings_db.json`: Your local meeting index.

---

> [!IMPORTANT]
> **Always ensure your `.env` file is excluded from Git.** This project includes a local `.gitignore` for this purpose, but verify your commit history if you've recently moved files.

Powered by [Endee](https://github.com/endee-io/endee) 🚀
