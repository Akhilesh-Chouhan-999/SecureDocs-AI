# Phase 4: RAG Pipeline - Quick Start

**Get Started with Retrieval-Augmented Generation in 5 Minutes**

---

## Installation & Setup

### 1. Install ChromaDB (5 minutes)

#### Option A: Docker (Recommended)

```bash
# Pull and run ChromaDB
docker run -p 8000:8000 chromadb/chroma

# Or use docker-compose
docker-compose up chromadb
```

#### Option B: Local Installation

```bash
pip install chromadb
chroma run --host 0.0.0.0 --port 8000
```

#### Option C: In-Memory (Development Only)

```bash
# No installation needed, uses in-process storage
```

### 2. Verify Installation

```bash
# Test ChromaDB connection
curl http://localhost:8000/api/v1/heartbeat

# Expected response: 200 OK with version info
```

### 3. Set Environment Variables

```bash
# .env file
CHROMA_URL=http://localhost:8000
OPENAI_API_KEY=sk-...
```

---

## 5-Minute Quickstart

### Step 1: Initialize RAG Pipeline

```typescript
import { getRAGPipeline } from "src/ai/rag/rag-pipeline.js";

const rag = getRAGPipeline({
  collectionName: "fraud_documents",
  maxContextTokens: 2000,
  topK: 5,
});

await rag.initialize();
console.log("✓ RAG Pipeline ready");
```

### Step 2: Ingest Sample Documents

```typescript
const documents = [
  {
    pageContent: "Income Statement: Monthly income $5,000, annual $60,000",
    metadata: { type: "Income", customerId: "cust-001", year: 2024 },
  },
  {
    pageContent: "Photo ID: Valid passport, expires 2028",
    metadata: { type: "ID", customerId: "cust-001", status: "verified" },
  },
  {
    pageContent: "Previous fraud case: Forged income, detected 2023",
    metadata: { type: "HistoricalCase", severity: "High", resolved: true },
  },
];

const result = await rag.ingestDocuments(documents);
console.log(`✓ Ingested ${result.count} documents`);
```

### Step 3: Query with Augmentation

```typescript
const query = "Is this income statement legitimate?";
const systemPrompt = "You are a fraud detection expert.";

const { augmentedPrompt, retrievedDocuments } =
  await rag.queryToAugmentedPrompt(query, systemPrompt);

console.log("🔍 Retrieved documents:");
retrievedDocuments.forEach((doc) => {
  console.log(`  - ${doc.id} (${(doc.similarity * 100).toFixed(1)}% similar)`);
});

console.log("\n📝 Augmented prompt:");
console.log(augmentedPrompt);
```

### Step 4: Use with LLM

```typescript
import { getLLMManager } from "src/ai/llm/llm-manager.js";

const llm = await getLLMManager().getModel();
const response = await llm.invoke(augmentedPrompt);

console.log("🤖 LLM Response:");
console.log(response);
```

---

## Common Tasks

### Task 1: Search Similar Documents

```typescript
import { getSimilaritySearchService } from "src/ai/vector-db/similarity-search.js";

const searchService = getSimilaritySearchService("fraud_documents");

const results = await searchService.search("Forged income documents", {
  topK: 3,
  similarityThreshold: 0.7,
  expandQueries: true,
});

results.forEach((doc, i) => {
  console.log(`${i + 1}. ${doc.content}`);
  console.log(`   Similarity: ${(doc.similarity * 100).toFixed(1)}%`);
  console.log(`   Relevance Score: ${doc.relevanceScore}/100\n`);
});
```

### Task 2: Add Single Document

```typescript
await rag.ingestDocuments([
  {
    pageContent: "New fraud case: Identity theft with fake docs",
    metadata: {
      type: "Case",
      caseId: "case-2024-001",
      status: "open",
    },
  },
]);
```

### Task 3: Get Pipeline Statistics

```typescript
const stats = rag.getStats();
console.log(stats);
// {
//   documentsIngested: 150,
//   queriesProcessed: 45,
//   avgRetrievalTime: 245,
//   avgAugmentationTime: 78,
//   totalDocumentsInIndex: 150
// }
```

### Task 4: Health Check

```typescript
const health = await rag.healthCheck();
console.log(`Pipeline healthy: ${health.isHealthy}`);
console.log(`Documents in index: ${health.details.documentsInIndex}`);
console.log(`Queries processed: ${health.details.queriesProcessed}`);
```

### Task 5: Clear Everything

```typescript
await rag.clear();
console.log("✓ Collection cleared");
```

---

## Real-World Integration Example

### Complete Fraud Analysis with RAG

```typescript
import { FraudDetectionAgent } from "src/ai/agents/fraud-detection-agent.js";
import { getRAGPipeline } from "src/ai/rag/rag-pipeline.js";
import { getLLMManager } from "src/ai/llm/llm-manager.js";

async function analyzeFraudWithRAG(document) {
  // 1. Setup
  const rag = getRAGPipeline({ collectionName: "fraud_cases" });
  const llm = await getLLMManager().getModel();
  const agent = new FraudDetectionAgent(llm);

  // 2. Get historical context
  const { augmentedPrompt, retrievedDocuments } =
    await rag.queryToAugmentedPrompt(
      `Analyze: ${document.content}`,
      "Expert fraud analyst.",
    );

  // 3. Run fraud detection with context
  const result = await agent.execute({
    documentId: document.id,
    ocrContent: augmentedPrompt, // ← Use augmented content!
    documentType: document.type,
    customerName: document.customerName,
    customerEmail: document.customerEmail,
    declaredAmount: document.amount,
  });

  return {
    analysis: JSON.parse(result.output),
    context: retrievedDocuments,
    rawResult: result,
  };
}

// Usage
const analysis = await analyzeFraudWithRAG({
  id: "doc-123",
  content: "Income statement for $100,000 annually",
  type: "Income",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  amount: 100000,
});

console.log("Risk Level:", analysis.analysis.riskLevel);
console.log("Similar Cases Found:", analysis.context.length);
```

---

## Configuration Reference

### RAGPipeline Options

```typescript
interface RAGPipelineConfig {
  collectionName: string; // ✓ Required
  maxContextTokens?: number; // Default: 2000
  topK?: number; // Default: 5 (documents to retrieve)
  similarityThreshold?: number; // Default: 0.5 (0-1 scale)
}

// Example with all options
const rag = getRAGPipeline({
  collectionName: "fraud_detection",
  maxContextTokens: 3000, // Generous token budget
  topK: 10, // More documents
  similarityThreshold: 0.6, // Stricter filtering
});
```

### Search Options

```typescript
interface SimilaritySearchOptions {
  topK?: number; // Num documents to return
  similarityThreshold?: number; // Min similarity (0-1)
  expandQueries?: boolean; // Auto-generate query variations
  metadata?: Record<string>; // Filter by metadata
}
```

### Context Augmentation Options

```typescript
interface ContextAugmentationOptions {
  maxContextTokens?: number; // Token limit
  contextCount?: number; // Num documents
  threshold?: number; // Min similarity
  includeMetadata?: boolean; // Add metadata to context
  rankingStrategy?: "similarity" | "relevance" | "hybrid";
}
```

---

## Performance Tips

### ✅ DO

```typescript
// ✓ Reuse pipeline instances
const rag = getRAGPipeline(config);
const rag2 = getRAGPipeline(config); // Returns same instance!

// ✓ Batch ingest documents
await rag.ingestDocuments(largeDocumentArray); // Fast!

// ✓ Use appropriate thresholds
similarityThreshold: 0.5; // Balanced

// ✓ Monitor metrics
const metrics = rag.getMetrics();
console.log(metrics);

// ✓ Use metadata filters
const filtered = await search(query, {
  metadata: { type: "Income", year: 2024 },
});
```

### ❌ DON'T

```typescript
// ✗ Create new pipelines repeatedly
for (let i = 0; i < 1000; i++) {
  const rag = getRAGPipeline(config); // SLOW!
}

// ✗ Set thresholds too high
similarityThreshold: 0.95; // Too strict, returns nothing

// ✗ Retrieve too many documents
topK: 100; // Inefficient, hurts quality

// ✗ Ignore errors
await rag.ingestDocuments(docs); // Ignore result?

// ✗ Forget to initialize
// await rag.initialize() → Required!
```

---

## Debugging

### Check What's in Your Index

```typescript
const stats = rag.getStats();
console.log(`Documents in index: ${stats.totalDocumentsInIndex}`);

const metrics = rag.getMetrics();
console.log("Full metrics:", JSON.stringify(metrics, null, 2));
```

### Test Retrieval Quality

```typescript
const results = await rag.retrieve("Your test query", "System prompt");

console.log("Retrieved documents:", results.retrievedDocuments.length);
results.retrievedDocuments.forEach((doc) => {
  console.log(`- Similarity: ${(doc.similarity * 100).toFixed(1)}%`);
  console.log(`  Content: ${doc.content.substring(0, 100)}...`);
});

console.log("Total context tokens:", results.stats.tokenCount);
console.log("Augmentation score:", results.stats.relevanceScore);
```

### Monitor Performance

```typescript
// Track latencies
const start = Date.now();
const result = await rag.retrieve(query, prompt);
const elapsed = Date.now() - start;
console.log(`Query took ${elapsed}ms`);

// Expected ranges:
// - Retrieval: 100-300ms
// - Augmentation: 50-100ms
// - Total: 200-500ms
```

---

## Troubleshooting

| Problem                        | Solution                                                            |
| ------------------------------ | ------------------------------------------------------------------- |
| **ChromaDB connection failed** | Ensure Docker is running: `docker run -p 8000:8000 chromadb/chroma` |
| **No results from search**     | Lower threshold: `0.3` instead of `0.5`                             |
| **Empty augmented prompt**     | Try: `expandQueries: true`, lower threshold                         |
| **Slow queries**               | Add metadata filters to narrow scope, reduce `topK`                 |
| **High token count**           | Lower `maxContextTokens`, reduce `topK`                             |
| **Out of memory**              | Process documents in smaller batches                                |

---

## API Reference (30-Second Summary)

```typescript
// Initialize
const rag = getRAGPipeline({ collectionName: "docs" });
await rag.initialize();

// Ingest
await rag.ingestDocuments(documents);

// Query
const { augmentedPrompt } = await rag.queryToAugmentedPrompt(query, prompt);

// Use with LLM
const response = await llm.invoke(augmentedPrompt);

// Monitor
rag.getStats(); // Basic stats
rag.getMetrics(); // Detailed metrics
rag.healthCheck(); // System status

// Clean up
await rag.clear();
```

---

## Next Steps

1. **Test locally** with sample documents
2. **Connect to Phase 3 agents** (FraudDetectionAgent, etc.)
3. **Set up metrics dashboard** to monitor performance
4. **Fine-tune thresholds** based on your data
5. **Implement caching** for frequently searched queries

---

## Example: End-to-End Workflow

```typescript
// File: examples/rag-complete-workflow.ts

import { getRAGPipeline } from "src/ai/rag/rag-pipeline.js";
import { getLLMManager } from "src/ai/llm/llm-manager.js";

async function completeRAGWorkflow() {
  console.log("🚀 Starting RAG Pipeline Workflow\n");

  // 1. Initialize
  const rag = getRAGPipeline({
    collectionName: "fraud_examples",
    topK: 5,
  });
  await rag.initialize();
  console.log("✓ Pipeline initialized\n");

  // 2. Ingest sample data
  const documents = [
    {
      pageContent: "Fraud case: Forged income, caught 2023",
      metadata: { type: "case" },
    },
    {
      pageContent: "Valid income statement: $60K annually",
      metadata: { type: "valid" },
    },
    {
      pageContent: "Suspicious: Income tripled in one year",
      metadata: { type: "suspicious" },
    },
  ];
  const ingested = await rag.ingestDocuments(documents);
  console.log(`✓ Ingested ${ingested.count} documents\n`);

  // 3. Query
  const query = "How do we detect forged documents?";
  const result = await rag.retrieve(query);
  console.log(`✓ Retrieved ${result.retrievedDocuments.length} documents\n`);

  // 4. Show augmented prompt
  console.log("📝 Augmented Prompt:");
  console.log(result.augmentedPrompt.substring(0, 300) + "...\n");

  // 5. Stats
  console.log("📊 Statistics:");
  console.log(rag.getStats());
}

completeRAGWorkflow().catch(console.error);
```

---

**Status**: ✅ Phase 4 Quick Start Complete  
**Version**: 1.0  
**Last Updated**: May 21, 2026
