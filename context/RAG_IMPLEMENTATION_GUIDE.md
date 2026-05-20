# RAG (Retrieval-Augmented Generation) Implementation Guide

**Document Purpose:** Detailed technical guide for implementing RAG pipeline in SecureDocs AI  
**Target:** Phase 4 implementation  
**Status:** Planning/Design phase

---

## 1. What is RAG?

### Definition

RAG combines **retrieval** (finding relevant data) with **generation** (creating new content) to improve LLM responses.

### Traditional LLM vs RAG LLM

**Without RAG:**

```
Query → LLM (trained knowledge only) → Response
Problem: May hallucinate, uses stale training data
```

**With RAG:**

```
Query
  ↓
1. Convert to Vector
  ↓
2. Search Historical Data (ChromaDB)
  ↓
3. Retrieve Top-K Relevant Documents
  ↓
4. Augment Prompt with Retrieved Context
  ↓
5. Send to LLM (with context) → Better Response
```

### Benefits for SecureDocs AI

- ✅ Incorporate historical fraud cases into analysis
- ✅ Match current document against past patterns
- ✅ Improve accuracy with real data vs general knowledge
- ✅ Enable transparency (show which historical cases were considered)
- ✅ Update knowledge without retraining LLM

---

## 2. Architecture Components

### 2.1 Embedding Layer

**Purpose:** Convert text → numerical vectors (embeddings)

```
"High-income loan application"
    ↓
Embedding Model (OpenAI, Gemini, etc.)
    ↓
[0.123, -0.456, 0.789, ..., 0.234]  ← 1536-dimensional vector
```

**Why Vectors?**

- Enable semantic similarity search
- Find similar documents even with different words
- Fast retrieval using vector similarity (cosine, L2 distance)

**Supported Models:**

```typescript
// 1. OpenAI Embeddings (Best for English text)
- Model: text-embedding-3-small (1536 dims)
- Cost: $0.02 per 1M tokens
- Speed: ~100ms per document

// 2. Google Vertex AI Embeddings
- Model: text-embedding-004
- Cost: $0.01 per 1M tokens
- Speed: ~150ms per document

// 3. Open-source (Hugging Face)
- Model: all-MiniLM-L6-v2 (384 dims, runs locally)
- Cost: Free
- Speed: ~10ms per document (local)
```

### 2.2 Vector Storage Layer (ChromaDB)

**Purpose:** Store & retrieve embeddings efficiently

```typescript
// ChromaDB Structure
Collection: "fraud-cases"
  ├── Document ID: "fraud-2024-001"
  │   ├── text: "Customer loan application with forged income..."
  │   ├── embedding: [0.123, -0.456, ...]  ← Vector
  │   └── metadata: {
  │         type: "fraud",
  │         severity: "high",
  │         date: "2024-03-15",
  │         pattern: "income_falsification"
  │       }
  │
  ├── Document ID: "fraud-2024-002"
  │   ├── text: "Suspicious activity pattern detected..."
  │   ├── embedding: [0.234, -0.567, ...]
  │   └── metadata: { ... }
  │
  └── ... (thousands more)
```

**Query Process:**

```
Query: "Applicant claims $500k income but documents show $50k"
  ↓
Convert to embedding: [0.321, -0.654, ...]
  ↓
Find similar vectors in ChromaDB (cosine similarity)
  ↓
Retrieve top-5 matching documents:
  1. fraud-2024-001 (similarity: 0.92) ← Most similar
  2. fraud-2024-045 (similarity: 0.88)
  3. fraud-2024-089 (similarity: 0.85)
  4. ... (0.82, 0.80)
```

### 2.3 Retrieval Engine

**Purpose:** Execute similarity searches efficiently

```typescript
interface RetrievalEngine {
  // 1. Vector Search (primary)
  async search(query: string, topK: number): Promise<Document[]> {
    // Find most similar documents
  }

  // 2. Metadata Filtering (optional)
  async searchWithFilter(
    query: string,
    filters: { type?: string; severity?: string; dateRange?: [Date, Date] },
    topK: number
  ): Promise<Document[]> {
    // Find similar + apply filters
  }

  // 3. Hybrid Search (text + semantic)
  async hybridSearch(query: string, topK: number) {
    // Combine keyword search + semantic search
  }
}
```

**Similarity Metrics:**

```
Cosine Similarity = (A · B) / (|A| × |B|)
Range: -1 to 1
  - 1.0 = identical
  - 0.8+ = very similar
  - 0.5-0.8 = similar
  - <0.5 = dissimilar
```

### 2.4 Context Formatter

**Purpose:** Format retrieved documents for LLM consumption

```typescript
// Input: Retrieved fraud cases + current document
// Output: Formatted context string

function formatContext(query: string, retrievedDocs: Document[]): string {
  return `
## Current Document Analysis
Query: ${query}

## Similar Historical Cases Found:

${retrievedDocs
  .map(
    (doc, idx) => `
**Case ${idx + 1}: ${doc.metadata.id}**
- Severity: ${doc.metadata.severity}
- Pattern: ${doc.metadata.pattern}
- Date: ${doc.metadata.date}
- Details: ${doc.text.substring(0, 200)}...
- Similarity: ${(doc.similarity * 100).toFixed(1)}%
`,
  )
  .join("\n")}

## Instructions:
Use these historical cases to inform your fraud risk assessment.
  `;
}
```

---

## 3. Implementation Roadmap

### Step 1: Setup Embedding Service

**File:** `src/ai/embeddings/embedding-service.ts`

```typescript
import { OpenAIEmbeddings } from "@langchain/openai";
import * as fs from "fs";
import * as path from "path";

interface EmbeddingCache {
  text: string;
  embedding: number[];
  timestamp: number;
}

export class EmbeddingService {
  private embeddings: OpenAIEmbeddings;
  private cache: Map<string, number[]> = new Map();
  private cacheFile = path.join(process.cwd(), "embeddings-cache.json");

  constructor(apiKey: string) {
    this.embeddings = new OpenAIEmbeddings({
      apiKey,
      modelName: "text-embedding-3-small",
      stripNewLines: true,
    });
    this.loadCache();
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = this.hashText(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Generate new embedding
    const embedding = await this.embeddings.embedQuery(text);
    this.cache.set(cacheKey, embedding);
    this.saveCache(); // Persist to disk

    return embedding;
  }

  async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    // Batch process for efficiency
    const embeddings = await this.embeddings.embedDocuments(texts);

    // Cache results
    texts.forEach((text, idx) => {
      const cacheKey = this.hashText(text);
      this.cache.set(cacheKey, embeddings[idx]);
    });
    this.saveCache();

    return embeddings;
  }

  private hashText(text: string): string {
    const crypto = require("crypto");
    return crypto.createHash("md5").update(text).digest("hex");
  }

  private loadCache() {
    if (fs.existsSync(this.cacheFile)) {
      const data = JSON.parse(fs.readFileSync(this.cacheFile, "utf-8"));
      data.forEach((item: EmbeddingCache) => {
        this.cache.set(this.hashText(item.text), item.embedding);
      });
    }
  }

  private saveCache() {
    const data = Array.from(this.cache.entries()).map(([key, embedding]) => ({
      text: key,
      embedding,
      timestamp: Date.now(),
    }));
    fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
  }
}
```

### Step 2: Initialize ChromaDB

**File:** `src/ai/vector-db/chroma-client.ts`

```typescript
import { Chroma } from "@langchain/community/vectorstores/chroma";
import type { Document } from "@langchain/core/documents";
import { EmbeddingService } from "../embeddings/embedding-service";

export class ChromaVectorDB {
  private vectorStore: Chroma;
  private embeddingService: EmbeddingService;

  async initialize(
    apiKey: string,
    chromaURL = "http://localhost:8000",
  ): Promise<void> {
    this.embeddingService = new EmbeddingService(apiKey);

    this.vectorStore = await Chroma.fromExistingCollection(
      this.embeddingService,
      {
        url: chromaURL,
        collectionName: "fraud-cases",
      },
    );
  }

  async addDocuments(docs: Document[]): Promise<string[]> {
    // Add new documents to ChromaDB
    return await this.vectorStore.addDocuments(docs);
  }

  async search(query: string, topK = 5): Promise<Document[]> {
    // Semantic similarity search
    return await this.vectorStore.similaritySearch(query, topK);
  }

  async searchWithMetadata(
    query: string,
    filters: Record<string, unknown>,
    topK = 5,
  ): Promise<Document[]> {
    // Search with metadata filtering
    return await this.vectorStore.similaritySearch(query, topK, filters);
  }

  async getStats(): Promise<{
    totalDocuments: number;
    collections: string[];
  }> {
    // Get ChromaDB statistics
    return {
      totalDocuments: await this.vectorStore.collection.count(),
      collections: ["fraud-cases"], // Can add more collections
    };
  }
}
```

### Step 3: Build RAG Pipeline

**File:** `src/ai/rag/rag-pipeline.ts`

```typescript
import { ChromaVectorDB } from "../vector-db/chroma-client";
import { ChatOpenAI } from "@langchain/openai";
import type { Document } from "@langchain/core/documents";

interface RAGResponse {
  answer: string;
  sources: Document[];
  confidence: number;
}

export class RAGPipeline {
  private vectorDB: ChromaVectorDB;
  private llm: ChatOpenAI;

  constructor(chromaURL: string, openaiKey: string) {
    this.vectorDB = new ChromaVectorDB();
    this.llm = new ChatOpenAI({
      apiKey: openaiKey,
      modelName: "gpt-4",
    });
  }

  async initialize(): Promise<void> {
    await this.vectorDB.initialize(process.env.OPENAI_API_KEY!);
  }

  async answerQuestion(query: string): Promise<RAGResponse> {
    // Step 1: Retrieve relevant context
    const relevantDocs = await this.vectorDB.search(query, (topK = 5));

    if (relevantDocs.length === 0) {
      return {
        answer: "No relevant historical context found.",
        sources: [],
        confidence: 0,
      };
    }

    // Step 2: Format context for LLM
    const context = this.formatContext(query, relevantDocs);

    // Step 3: Send to LLM
    const answer = await this.llm.invoke([
      {
        role: "system",
        content: `You are a fraud detection analyst. Use the historical 
        cases provided below to inform your analysis.`,
      },
      {
        role: "user",
        content: context,
      },
    ]);

    // Step 4: Return response with sources
    return {
      answer: answer.content as string,
      sources: relevantDocs,
      confidence: this.calculateConfidence(relevantDocs),
    };
  }

  private formatContext(query: string, docs: Document[]): string {
    return `
Query: ${query}

Historical Similar Cases:
${docs
  .map((doc, idx) => {
    const metadata = doc.metadata as any;
    return `
Case ${idx + 1}:
- ID: ${metadata.id}
- Severity: ${metadata.severity}
- Pattern: ${metadata.pattern}
- Description: ${doc.pageContent.substring(0, 300)}...
`;
  })
  .join("\n")}

Based on these similar cases, analyze the fraud risk:
    `;
  }

  private calculateConfidence(docs: Document[]): number {
    // Average confidence based on similarity scores
    if (docs.length === 0) return 0;
    const similarities = docs.map(
      (doc) => (doc.metadata?.similarity as number) || 0,
    );
    return similarities.reduce((a, b) => a + b, 0) / docs.length;
  }
}
```

### Step 4: Integrate with Fraud Detection Agent

**File:** `src/ai/agents/fraud-detection-agent.ts`

```typescript
import { RAGPipeline } from "../rag/rag-pipeline";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import type { StructuredDocumentData } from "../../types/domain";

export class FraudDetectionAgent {
  private ragPipeline: RAGPipeline;

  async initialize(): Promise<void> {
    this.ragPipeline = new RAGPipeline(
      process.env.CHROMA_URL || "http://localhost:8000",
      process.env.OPENAI_API_KEY!,
    );
    await this.ragPipeline.initialize();
  }

  async analyzeFraudRisk(
    document: StructuredDocumentData,
    ocrText: string,
  ): Promise<{
    riskScore: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    historicalContext: any[];
  }> {
    // Step 1: Query RAG for similar cases
    const query = `${ocrText.substring(0, 500)} 
                   Income: ${document.declaredIncome} 
                   Borrower: ${document.borrowerName}`;

    const ragResponse = await this.ragPipeline.answerQuestion(query);

    // Step 2: Analyze with historical context
    const riskAssessment = this.assessRisk(
      document,
      ocrText,
      ragResponse.sources,
    );

    return {
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      historicalContext: ragResponse.sources.map((doc) => ({
        id: doc.metadata?.id,
        similarity: doc.metadata?.similarity,
        pattern: doc.metadata?.pattern,
      })),
    };
  }

  private assessRisk(
    document: StructuredDocumentData,
    ocrText: string,
    historicalDocs: any[],
  ): {
    riskScore: number;
    riskLevel: "low" | "medium" | "high" | "critical";
  } {
    let riskScore = 0;

    // Apply risk factors
    if (document.declaredIncome && document.declaredIncome > 500000) {
      riskScore += 15; // Higher income = higher risk
    }

    // Check similarity to fraud cases
    const fraudCaseSimilarity = historicalDocs.reduce((max, doc) => {
      return Math.max(max, doc.metadata?.similarity || 0);
    }, 0);

    if (fraudCaseSimilarity > 0.85) {
      riskScore += 40; // High similarity to fraud cases
    }

    const riskLevel: "low" | "medium" | "high" | "critical" =
      riskScore >= 81
        ? "critical"
        : riskScore >= 61
          ? "high"
          : riskScore >= 31
            ? "medium"
            : "low";

    return { riskScore: Math.min(riskScore, 100), riskLevel };
  }
}
```

---

## 4. Data Flow Diagram

```
┌─────────────────────┐
│ Upload Document     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ OCR Extraction      │  → Tesseract.js
│ (extract text)      │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Structured Parse    │  → Extract fields
│ (borrower, income)  │
└──────────┬──────────┘
           │
           ├─→ Store in MongoDB (Document model)
           │
           ↓
┌─────────────────────┐
│ Generate Embedding  │  → OpenAI Embeddings
│ (text → vector)     │
└──────────┬──────────┘
           │
           ├─→ Store in ChromaDB
           │
           ↓
┌─────────────────────┐
│ Semantic Search     │  → Find similar fraud cases
│ (RAG Retrieval)     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Augment Prompt      │  → Add historical context
│ (for LLM)           │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Fraud Detection     │  → GPT-4 with context
│ Agent (LLM)         │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Risk Scoring        │  → Calculate risk level
│ (composite score)   │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Generate Report     │  → Create FraudReport
│ (PDF + metadata)    │
└─────────────────────┘
```

---

## 5. ChromaDB Setup

### Option A: Docker (Recommended for Production)

```bash
# Run ChromaDB in Docker
docker run -p 8000:8000 ghcr.io/chroma-core/chroma:latest

# Verify it's running
curl http://localhost:8000/api/v1/heartbeat
```

### Option B: Local Install (Development)

```bash
# Install Python & ChromaDB
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000
```

### Option C: In-Memory (Quick Testing)

```typescript
// No setup needed - ChromaDB runs in-memory
import { Chroma } from "@langchain/community/vectorstores/chroma";

const vectorStore = await Chroma.fromDocuments(documents, embeddings, {
  collectionName: "test-collection",
  // No URL = in-memory mode
});
```

---

## 6. Example Usage

### Indexing Historical Fraud Cases

```typescript
const rag = new RAGPipeline(chromaURL, openaiKey);
await rag.initialize();

// Historical fraud cases to index
const fraudCases = [
  {
    pageContent: "Customer claimed $500k income but tax returns showed $50k",
    metadata: {
      id: "fraud-2024-001",
      type: "income_falsification",
      severity: "critical",
      pattern: "income_falsification",
      date: "2024-03-15",
    },
  },
  {
    pageContent: "Forged employment verification document detected",
    metadata: {
      id: "fraud-2024-002",
      type: "document_forgery",
      severity: "high",
      pattern: "forgery",
      date: "2024-03-10",
    },
  },
  // ... more cases
];

// Index them
await rag.vectorDB.addDocuments(fraudCases);
```

### Querying for Similar Cases

```typescript
const newDocument = {
  borrowerName: "John Doe",
  declaredIncome: 600000,
  documentDate: "2024-05-20",
};

const query = `Income: ${newDocument.declaredIncome}, Document Date: ${newDocument.documentDate}`;

const response = await rag.answerQuestion(query);
console.log("Risk Assessment:", response.answer);
console.log("Supporting Cases:", response.sources);
console.log("Confidence:", response.confidence);
```

---

## 7. Performance Optimization

### Caching Strategies

```typescript
// Cache embeddings to avoid recomputation
const embeddingCache = new Map<string, number[]>();

function getCachedEmbedding(text: string): number[] | null {
  return embeddingCache.get(hash(text)) || null;
}

function setCachedEmbedding(text: string, embedding: number[]): void {
  embeddingCache.set(hash(text), embedding);
}
```

### Batch Processing

```typescript
// Process multiple documents efficiently
const documents = [...]; // 1000 documents
const batchSize = 100;

for (let i = 0; i < documents.length; i += batchSize) {
  const batch = documents.slice(i, i + batchSize);
  await rag.vectorDB.addDocuments(batch);
}
```

### Indexing Strategy

```typescript
// Index by severity for faster filtered search
- High-severity cases: immediate index
- Medium cases: batch index daily
- Low cases: batch index weekly
- Resolved cases: archive after 2 years
```

---

## 8. Monitoring & Metrics

```typescript
interface RAGMetrics {
  embeddingsGenerated: number;
  embeddingsCached: number;
  vectorSearchTime: number; // milliseconds
  llmResponseTime: number;
  totalPipeline Time: number;
  cachHitRate: number; // percentage
}

// Track and log
console.log(`Cache hit rate: ${metrics.cacheHitRate}%`);
console.log(`Avg search time: ${metrics.vectorSearchTime}ms`);
```

---

## 9. Error Handling

```typescript
try {
  const results = await rag.search(query);
} catch (error) {
  if (error instanceof ChromaConnectionError) {
    // Fallback to non-RAG analysis
    logger.warn("ChromaDB unavailable, using baseline analysis");
    return baselineAnalysis(query);
  } else if (error instanceof EmbeddingError) {
    // Retry with fallback embedding model
    logger.warn("Primary embedding model failed, trying fallback");
    return await ragPipeline.withFallbackEmbedding(query);
  }
}
```
