# Phase 4: RAG Pipeline Implementation Guide

**Retrieval-Augmented Generation for SecureDocs AI**

---

## Overview

Phase 4 implements a complete **Retrieval-Augmented Generation (RAG)** pipeline that enhances LLM accuracy by automatically retrieving and injecting relevant historical context into prompts.

```
Document Ingestion → Vector Embedding → Semantic Storage → Query Execution
                                                               ↓
                                                      Context Retrieval
                                                               ↓
                                                      Prompt Augmentation
                                                               ↓
                                                      Enhanced LLM Query
```

---

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      RAG PIPELINE ORCHESTRATOR                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐   ┌──────────────────┐  ┌──────────────┐ │
│  │ ChromaDB Client  │   │ Similarity Search│  │ Context Aug. │ │
│  │ (Vector Storage) │   │ (Result Ranking) │  │ (Prompt Build)│ │
│  └──────────────────┘   └──────────────────┘  └──────────────┘ │
│         ↓                       ↓                     ↓          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        Embedding Service (OpenAI text-embedding-3-small)│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Module Files

| File                      | Purpose                   | Exports                                                         |
| ------------------------- | ------------------------- | --------------------------------------------------------------- |
| `chroma-client.ts`        | Vector store management   | `ChromaClient`, `getChromaClient()`                             |
| `similarity-search.ts`    | Semantic search & ranking | `SimilaritySearchService`, `getSimilaritySearchService()`       |
| `context-augmentation.ts` | Prompt enrichment         | `ContextAugmentationService`, `getContextAugmentationService()` |
| `rag-pipeline.ts`         | Orchestration             | `RAGPipeline`, `getRAGPipeline()`                               |

---

## Implementation Details

### 1. ChromaDB Client (`chroma-client.ts`)

**Purpose**: Manages vector storage and retrieval operations

**Key Features**:

- Initialize ChromaDB connection
- Add documents with metadata
- Semantic similarity search
- Metadata filtering
- Collection management

**Usage**:

```typescript
import { getChromaClient } from "src/ai/vector-db/chroma-client.js";

const chromaClient = getChromaClient({
  collectionName: "fraud_documents",
});

await chromaClient.initialize();

// Add documents
const docs = [
  {
    pageContent: "Customer submitted forged income documents",
    metadata: { documentId: "doc-123", type: "Income" },
  },
];
await chromaClient.addDocuments(docs);

// Search similar documents
const results = await chromaClient.search(
  "income document validation",
  5, // top K
);
```

**Methods**:

- `initialize()` - Connect to ChromaDB
- `addDocuments(docs)` - Index documents
- `search(query, k, filter)` - Semantic search
- `searchWithMetadata(query, metadata, k)` - Filtered search
- `deleteDocuments(ids)` - Remove documents
- `clearCollection()` - Clear all documents
- `getStats()` - Collection statistics
- `isInitialized()` - Check connection status

### 2. Similarity Search (`similarity-search.ts`)

**Purpose**: Semantic search with ranking and relevance scoring

**Key Features**:

- Single and multi-query search
- Query expansion (automatic variations)
- Result ranking by similarity/relevance
- Threshold filtering
- Hybrid ranking strategies

**Usage**:

```typescript
import { getSimilaritySearchService } from "src/ai/vector-db/similarity-search.js";

const searchService = getSimilaritySearchService("fraud_documents");

const results = await searchService.search("How to detect forged documents?", {
  topK: 5,
  similarityThreshold: 0.5,
  expandQueries: true, // Auto-expand with variations
  rankingStrategy: "hybrid", // similarity + relevance
});

// Results: [{ id, content, similarity, rank, relevanceScore, metadata }]
```

**Ranking Strategies**:

- `similarity`: Sort by cosine similarity only
- `relevance`: Sort by relevance score
- `hybrid`: Combine both metrics

**Query Expansion**:

- Automatically generates variations
- Examples: "fraud" → "suspicious", "anomaly"

### 3. Context Augmentation (`context-augmentation.ts`)

**Purpose**: Automatically enrich prompts with retrieved context

**Key Features**:

- Dynamic context retrieval
- Token-aware truncation
- Metadata enrichment
- Multiple ranking strategies
- Augmentation scoring

**Usage**:

```typescript
import { getContextAugmentationService } from "src/ai/rag/context-augmentation.js";

const augmentationService = getContextAugmentationService("fraud_documents");

const augmented = await augmentationService.augmentContext(
  "Analyze this income statement for fraud indicators",
  "You are a fraud detection expert...", // system prompt
  {
    maxContextTokens: 2000,
    contextCount: 5,
    threshold: 0.5,
    includeMetadata: true,
    rankingStrategy: "hybrid",
  },
);

// Result: { systemContext, relevantDocuments[], tokenCount, augmentationScore }
```

**Augmented Prompt Format**:

```
[Original System Prompt]

## RELEVANT CONTEXT FROM VECTOR STORE:
(Retrieved 5 documents)

### Document 1 [metadata]
**Similarity: 95.2%**
[Document content...]

### Document 2 [metadata]
**Similarity: 87.3%**
[Document content...]

## END CONTEXT

Use the above context to inform your analysis and response.
```

### 4. RAG Pipeline (`rag-pipeline.ts`)

**Purpose**: Orchestrate the complete RAG workflow

**Key Features**:

- Document ingestion
- Unified query-to-augmented-prompt pipeline
- Performance metrics
- Health checks
- Collection management

**Usage**:

```typescript
import { getRAGPipeline } from "src/ai/rag/rag-pipeline.js";

const ragPipeline = getRAGPipeline({
  collectionName: "fraud_documents",
  maxContextTokens: 2000,
  topK: 5,
  similarityThreshold: 0.5,
});

await ragPipeline.initialize();

// 1. Ingest documents
await ragPipeline.ingestDocuments([
  { pageContent: "...", metadata: { type: "Income" } },
  { pageContent: "...", metadata: { type: "ID" } },
]);

// 2. Query with augmentation
const result = await ragPipeline.retrieve(
  "Check this income statement",
  "You are a fraud expert...",
);

// Result includes: augmentedPrompt, retrievedDocuments[], stats{}
```

**Complete Workflow**:

```typescript
// Single-step: Query to Augmented Prompt
const { augmentedPrompt, context } = await ragPipeline.queryToAugmentedPrompt(
  "User query here",
  "System prompt here",
);

// Use augmentedPrompt with your LLM
const llmResponse = await llm.invoke(augmentedPrompt);
```

---

## Integration with Phase 3 Agents

### Connect RAG to FraudDetectionAgent

```typescript
import { FraudDetectionAgent } from "src/ai/agents/fraud-detection-agent.js";
import { getRAGPipeline } from "src/ai/rag/rag-pipeline.js";
import { getLLMManager } from "src/ai/llm/llm-manager.js";

async function analyzeWithRAG(documentId: string, ocrContent: string) {
  // 1. Setup RAG
  const ragPipeline = getRAGPipeline({
    collectionName: "fraud_documents",
    topK: 5,
  });

  // 2. Get augmented context
  const { augmentedPrompt, context } = await ragPipeline.queryToAugmentedPrompt(
    ocrContent,
    "Analyze for fraud indicators",
  );

  // 3. Use with agent
  const llm = await getLLMManager().getModel();
  const agent = new FraudDetectionAgent(llm);

  const result = await agent.execute({
    documentId,
    ocrContent: augmentedPrompt, // Use augmented content!
    // ... other fields
  });

  return {
    agentResult: result,
    ragContext: context,
  };
}
```

### Connect RAG to RiskScoringAgent

```typescript
async function scoreRiskWithContext(anomalies, customerEmail) {
  const ragPipeline = getRAGPipeline({
    collectionName: "historical_patterns",
  });

  // Get similar historical cases
  const { augmentedPrompt } = await ragPipeline.retrieve(
    `Customer: ${customerEmail}, Anomalies: ${anomalies}`,
    "Historical context for risk assessment",
  );

  const riskAgent = new RiskScoringAgent(llm);
  return await riskAgent.execute({
    anomalies,
    customerEmail,
    contextualInformation: augmentedPrompt,
  });
}
```

---

## Configuration

### Environment Variables

```bash
# ChromaDB Server
CHROMA_URL=http://localhost:8000

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-...

# Optional: Embedding model (default: text-embedding-3-small)
EMBEDDING_MODEL=text-embedding-3-small
```

### RAG Pipeline Options

```typescript
interface RAGPipelineConfig {
  collectionName: string; // Required: ChromaDB collection name
  maxContextTokens?: number; // Max tokens in augmented context (default: 2000)
  topK?: number; // Number of documents to retrieve (default: 5)
  similarityThreshold?: number; // Minimum similarity score (default: 0.5)
}

interface ContextAugmentationOptions {
  maxContextTokens?: number; // Token limit (default: 2000)
  contextCount?: number; // Documents to retrieve (default: 5)
  threshold?: number; // Minimum similarity (default: 0.5)
  includeMetadata?: boolean; // Add metadata to context (default: true)
  rankingStrategy?: "similarity" | "relevance" | "hybrid"; // Default: hybrid
}
```

---

## Performance Considerations

### Optimization Tips

✅ **DO**:

- Batch document ingestion for better throughput
- Reuse RAG pipeline instances (singleton pattern)
- Set appropriate similarity thresholds
- Use reasonable `topK` values (3-10 typical)
- Cache query results when appropriate
- Monitor embedding service statistics

❌ **DON'T**:

- Create new RAG pipelines repeatedly
- Set maxContextTokens too low (<500 degrades context)
- Use very high topK values (>20 is inefficient)
- Ignore similarity thresholds (requires manual review)
- Re-embed identical documents

### Latency Profile

| Operation       | Typical Latency | Factors                      |
| --------------- | --------------- | ---------------------------- |
| Embed text      | 200-500ms       | Document length, API latency |
| Search query    | 100-300ms       | Collection size, topK value  |
| Augment context | 50-100ms        | Document count, formatting   |
| Full RAG query  | 400-900ms       | Total of above operations    |

---

## Monitoring & Debugging

### Health Check

```typescript
const health = await ragPipeline.healthCheck();
console.log(health.isHealthy); // true/false
console.log(health.message); // Status message
console.log(health.details); // { chromaDBConnected, documentsInIndex, ... }
```

### Detailed Metrics

```typescript
const metrics = ragPipeline.getMetrics();

// Returns:
// - pipeline: { documentsIngested, queriesProcessed, avgRetrievalTime, ... }
// - chromaDB: ChromaDB collection statistics
// - search: Search service statistics
// - augmentation: Context augmentation statistics
```

### Logging

All components use Winston logger:

```typescript
logger.info("RAG operation started");
logger.debug("Retrieved 5 documents with avg similarity 0.87");
logger.warn("No documents found with similarity > 0.5");
logger.error("ChromaDB connection failed:", error);
```

---

## Common Patterns

### Pattern 1: Auto-Enrich LLM Queries

```typescript
async function enrichedLLMQuery(userMessage: string) {
  const ragPipeline = getRAGPipeline({
    collectionName: "knowledge_base",
  });

  const { augmentedPrompt } = await ragPipeline.queryToAugmentedPrompt(
    userMessage,
    "You are a helpful assistant.",
  );

  return await llm.call(augmentedPrompt);
}
```

### Pattern 2: Multi-Stage Document Processing

```typescript
async function processDocumentWithRAG(document) {
  // Stage 1: Find similar documents for context
  const ragPipeline = getRAGPipeline({
    collectionName: "historical_cases",
  });

  const { retrievedDocuments } = await ragPipeline.retrieve(document.content);

  // Stage 2: Analyze with agent using context
  const agent = new FraudDetectionAgent(llm);
  const analysis = await agent.execute({
    ...document,
    contextualDocuments: retrievedDocuments,
  });

  // Stage 3: Index this document for future queries
  await ragPipeline.ingestDocuments([
    {
      pageContent: document.content,
      metadata: { documentId: document.id, analysis },
    },
  ]);

  return analysis;
}
```

### Pattern 3: Similarity-Based Document Grouping

```typescript
async function groupSimilarDocuments(documents) {
  const searchService = getSimilaritySearchService("fraud_cases");

  const groups = new Map();

  for (const doc of documents) {
    // Find similar documents
    const similar = await searchService.findSimilarDocuments(doc.content, {
      topK: 10,
      threshold: 0.7,
    });

    groups.set(doc.id, similar);
  }

  return groups;
}
```

---

## Testing RAG Pipeline

### Unit Test Example

```typescript
describe("RAG Pipeline", () => {
  let pipeline: RAGPipeline;

  beforeEach(() => {
    pipeline = getRAGPipeline({ collectionName: "test_collection" });
  });

  it("should retrieve and augment context", async () => {
    // Ingest test documents
    await pipeline.ingestDocuments([
      { pageContent: "Income document validation", metadata: { type: "doc" } },
    ]);

    // Query
    const result = await pipeline.retrieve("How to validate income?");

    // Assert
    expect(result.retrievedDocuments.length).toBeGreaterThan(0);
    expect(result.augmentedPrompt).toContain("RELEVANT CONTEXT");
    expect(result.stats.totalTime).toBeLessThan(1000); // Should be fast
  });
});
```

---

## Troubleshooting

| Issue                      | Cause                          | Solution                                                  |
| -------------------------- | ------------------------------ | --------------------------------------------------------- |
| No results returned        | Low similarity threshold       | Lower threshold: `0.3` instead of `0.5`                   |
| Poor relevance             | Wrong ranking strategy         | Try `hybrid` or `relevance` strategy                      |
| Slow queries               | Large collection size          | Add metadata filters to narrow scope                      |
| Memory issues              | Too many documents loaded      | Reduce `maxContextTokens` or `topK`                       |
| ChromaDB connection failed | Server not running             | Start ChromaDB: `docker run -p 8000:8000 chromadb/chroma` |
| Low augmentation score     | Insufficient context retrieved | Check query relevance, increase `contextCount`            |

---

## Next Steps

### Immediate: Integration

1. Connect RAG to existing agents (Phase 3)
2. Set up ChromaDB server
3. Test with sample fraud documents
4. Monitor performance metrics

### Short-term: Enhancement

1. Implement query rewriting for better searches
2. Add hybrid search (combining keyword + semantic)
3. Implement cache warming for hot queries
4. Build custom embeddings for domain-specific terms

### Medium-term: Scaling

1. Implement batch ingestion pipelines
2. Add multi-collection support
3. Implement scheduled re-embedding
4. Build analytics dashboard for RAG performance

---

**Status**: ✅ Phase 4 (RAG Pipeline) Implementation Complete  
**Version**: 1.0  
**Last Updated**: May 21, 2026
