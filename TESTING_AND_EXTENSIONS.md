# RAG System - Testing & Extension Guide

## 🧪 Testing the RAG System

### Test Document 1: Python Basics

Create `ai-code-assistant/test_doc1.txt`:

```
Python Basics and Fundamentals

Python is a high-level, interpreted programming language known for its simplicity and readability.
The language was created in 1989 by Guido van Rossum and first released in 1991.
Python emphasizes code readability and uses clean, whitespace-sensitive syntax.

Data Types in Python:
- Integers: whole numbers like 5, -3, 100
- Floats: decimal numbers like 3.14, -0.5
- Strings: text data enclosed in quotes
- Lists: ordered collections of items
- Tuples: immutable ordered collections
- Dictionaries: key-value paired collections
- Sets: unordered collections of unique items

Control Flow:
if statements allow conditional execution
for loops iterate over sequences
while loops repeat until a condition is false
Functions are reusable blocks of code

Object-Oriented Programming:
Classes define blueprints for objects
Objects are instances of classes
Inheritance allows code reuse
Polymorphism allows flexible method calls
Encapsulation protects internal state

Modules and Packages:
import statements load code from other files
pip is the package manager
Virtual environments isolate project dependencies
Popular libraries: NumPy, Pandas, Django, Flask
```

### Test Document 2: Machine Learning

Create `ai-code-assistant/test_doc2.txt`:

```
Introduction to Machine Learning

Machine Learning is a subset of Artificial Intelligence that enables systems to learn from data.
Instead of being explicitly programmed, ML systems identify patterns and improve through experience.
ML algorithms use statistical techniques to find patterns in large datasets.

Types of Machine Learning:

Supervised Learning:
Requires labeled training data with input-output pairs
Used for prediction and classification tasks
Examples: regression, classification, decision trees
Algorithms: Linear Regression, Logistic Regression, SVM, Neural Networks

Unsupervised Learning:
Works with unlabeled data to find hidden patterns
Used for clustering and dimensionality reduction
Examples: K-means clustering, hierarchical clustering
Algorithms: K-Means, DBSCAN, Principal Component Analysis (PCA)

Reinforcement Learning:
Agent learns by interacting with environment
Receives rewards or penalties for actions
Used for game playing, robotics, optimization
Algorithms: Q-Learning, Deep Q-Networks, Policy Gradient

Deep Learning:
Subset of ML using neural networks with multiple layers
Inspired by biological neural systems
Processes data through interconnected nodes
Used in: computer vision, NLP, speech recognition
Frameworks: TensorFlow, PyTorch, Keras

Key Concepts:
Training: optimize model parameters
Validation: check performance on unseen data
Testing: evaluate final model performance
Overfitting: model memorizes training data
Underfitting: model too simple to learn patterns
Regularization: techniques to prevent overfitting

Neural Networks:
Input layer: receives data
Hidden layers: process information
Output layer: produces predictions
Activation functions: introduce non-linearity
Backpropagation: algorithm for training
```

### Test Document 3: Data Science

Create `ai-code-assistant/test_doc3.txt`:

```
Data Science Fundamentals

Data Science combines statistics, programming, and domain knowledge to extract insights.
Data scientists work with data pipeline from collection to visualization to decision-making.
The field requires skills in mathematics, programming, and business understanding.

Data Types:
Structured: organized in tables with defined schema (databases, CSV)
Unstructured: raw formats like text, images, video, audio
Semi-structured: mix of both like JSON, XML documents

Data Processing Pipeline:

1. Data Collection
   Sources: databases, APIs, web scraping, surveys, sensors
   Considerations: volume, velocity, variety, veracity

2. Data Cleaning
   Handle missing values
   Remove duplicates
   Fix inconsistencies
   Validate data quality

3. Exploratory Data Analysis (EDA)
   Understand data distribution
   Identify outliers
   Find correlations
   Visualize patterns

4. Feature Engineering
   Select relevant features
   Create new features
   Transform variables
   Normalize/standardize data

5. Model Building
   Choose algorithm
   Split into train/test sets
   Train the model
   Tune hyperparameters

6. Evaluation
   Measure performance
   Compare metrics
   Cross-validation
   Error analysis

7. Deployment
   Productionize model
   Monitor performance
   Update as needed
   Handle drift

Tools and Technologies:
- Programming: Python, R, SQL
- Libraries: Pandas, NumPy, Scikit-learn, Matplotlib
- Databases: PostgreSQL, MongoDB, Cassandra
- Big Data: Spark, Hadoop
- Cloud: AWS, Google Cloud, Azure

Statistical Concepts:
Mean: average value
Median: middle value
Standard Deviation: measure of spread
Correlation: relationship between variables
Probability: likelihood of events
Hypothesis Testing: verify assumptions

Visualization:
Charts for different data types
Dashboards for insights
Interactive plots
Business intelligence tools
```

---

## 🚀 Running Tests

### Test Case 1: Basic Document Upload & Query

```bash
# Start the server
npm start

# In another terminal, test upload with curl
curl -X POST http://localhost:3001/api/upload \
  -F "file=@test_doc1.txt"

# Get documents list
curl http://localhost:3001/api/documents

# Query the document
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are Python data types?",
    "documentId": "YOUR_DOC_ID"
  }'
```

### Test Case 2: Web UI Testing

1. Open http://localhost:3001
2. Upload test_doc1.txt
3. Try these queries:
   - "What is Python?"
   - "List the data types"
   - "Explain classes"
   - "What is inheritance?"

### Test Case 3: Multiple Document Handling

1. Upload all three test documents
2. Switch between documents
3. Query each one about their topics
4. Delete one document
5. Verify count updates

---

## 🤖 Extending with Real AI

### Option 1: OpenAI Integration

Update `server.js`:

```javascript
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateResponse(query, context) {
  const message = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that answers questions based on provided context."
      },
      {
        role: "user",
        content: `Context: ${context}\n\nQuestion: ${query}`
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return message.choices[0].message.content;
}
```

Install dependency:
```bash
npm install openai
```

### Option 2: Hugging Face Integration

```javascript
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_TOKEN);

async function generateResponse(query, context) {
  const response = await hf.textGeneration({
    model: "meta-llama/Llama-2-7b-chat",
    inputs: `Context: ${context}\n\nQuestion: ${query}\n\nAnswer:`,
    parameters: {
      max_new_tokens: 200,
    },
  });

  return response[0].generated_text;
}
```

### Option 3: Local LLM with Ollama

```javascript
import fetch from 'node-fetch';

async function generateResponse(query, context) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama2',
      prompt: `Context: ${context}\n\nQuestion: ${query}\n\nAnswer:`,
      stream: false
    })
  });

  const data = await response.json();
  return data.response;
}
```

---

## 📊 Advanced Features

### Implement Similarity Scoring

```javascript
function cosineSimilarity(vec1, vec2) {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const word in vec1) {
    if (word in vec2) {
      dotProduct += vec1[word] * vec2[word];
    }
    norm1 += vec1[word] * vec1[word];
  }

  for (const word in vec2) {
    norm2 += vec2[word] * vec2[word];
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  return dotProduct / (norm1 * norm2);
}

// Use in query
const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
confidence = similarity;
```

### Add Chat History

```javascript
// Add to server state
let chatHistory = [];

// After query
chatHistory.push({
  query,
  answer: response,
  timestamp: new Date(),
  documentId,
  confidence
});

// New endpoint
app.get('/api/history', (req, res) => {
  res.json(chatHistory.slice(-20)); // Last 20 conversations
});
```

### Implement Document Chunks

```javascript
function chunkDocument(content, chunkSize = 1000) {
  const chunks = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  return chunks;
}

// Embed each chunk
const chunks = chunkDocument(content);
const embeddings = await Promise.all(
  chunks.map(chunk => embedText(chunk))
);
```

---

## 🔍 Performance Metrics

Monitor your RAG system:

```javascript
// Add timing
const startTime = Date.now();

// ... RAG operations ...

const duration = Date.now() - startTime;
console.log(`Query processed in ${duration}ms`);

// Track metrics
const metrics = {
  totalQueries: 0,
  avgResponseTime: 0,
  successRate: 1.0,
  avgConfidence: 0.85
};
```

---

## 📈 Scaling Strategies

### Optimize Embeddings
- Use dimensionality reduction
- Pre-compute embeddings
- Use GPU for computation

### Database Optimization
- Implement SQLite for metadata
- Use vector indexes (FAISS, Annoy)
- Partition large document sets

### API Performance
- Add response caching
- Implement pagination
- Use compression

### Deployment
- Horizontal scaling with load balancer
- Containerization with Docker/Kubernetes
- Database replication

---

## 🧠 Future Enhancements

1. **Multi-modal Support**: Add image and audio processing
2. **Real-time Collaboration**: Multiple users querying together
3. **Knowledge Graphs**: Build relationships between concepts
4. **Fine-tuning**: Train custom models on domain data
5. **Analytics Dashboard**: Visualize usage patterns
6. **Mobile App**: Native iOS/Android application
7. **API Keys**: Secure API access for third parties
8. **Webhooks**: Event-driven architecture

---

## 📚 References

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Hugging Face Inference API](https://huggingface.co/inference-api)
- [Ollama Local Models](https://ollama.ai)
- [Vector Databases](https://en.wikipedia.org/wiki/Vector_database)
- [RAG Papers](https://arxiv.org/search/cs?query=retrieval+augmented+generation)

---

Happy Testing! 🚀
