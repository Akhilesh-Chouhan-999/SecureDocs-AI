# Phase 4: RAG Pipeline Architecture

**Technical Architecture & Design Decisions**

---

## System Architecture

### High-Level Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER QUERY                                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │   EMBEDDING GENERATION              │
                    │  (OpenAI text-embedding-3-small)    │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │   SEMANTIC SEARCH                   │
                    │   (ChromaDB Similarity)             │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │   RESULT RANKING                    │
                    │   (Similarity + Relevance)          │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │   CONTEXT AUGMENTATION              │
                    │   (Token-aware truncation)          │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │   AUGMENTED PROMPT                  │
                    │   (Ready for LLM)                   │
                    └──────────────────┬──────────────────┘
                                       │
              ┌────────────────────────▼────────────────────────┐
              │                    LLM                           │
              │ (GPT-4 with Phase 3 Agents)                     │
              └────────────────────────┬────────────────────────┘
                                       │
              ┌────────────────────────▼────────────────────────┐
              │              ENRICHED RESPONSE                   │
              │ (Better accuracy from contextual awareness)     │
              └────────────────────────┬────────────────────────┘
```

### Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ INGESTION PHASE                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Input Documents                                                 │
│        │                                                          │
│        ▼                                                          │
│  ┌─────────────────────────────────────────┐                    │
│  │ Embedding Service                       │                    │
│  │ - Converts text to 1536-dim vectors     │                    │
│  │ - Caches embeddings (prevents re-compu) │                    │
│  └─────────────────────────────────────────┘                    │
│        │                                                          │
│        ▼                                                          │
│  ┌─────────────────────────────────────────┐                    │
│  │ ChromaDB Client                         │                    │
│  │ - Stores vectors with metadata          │                    │
│  │ - Enables collection-based organization │                    │
│  └─────────────────────────────────────────┘                    │
│        │                                                          │
│        ▼                                                          │
│  Vector Store (ChromaDB)                                        │
│  [1536-dim vectors + metadata]                                  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ RETRIEVAL PHASE                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User Query                                                      │
│        │                                                          │
│        ▼                                                          │
│  ┌─────────────────────────────────────────┐                    │
│  │ Query Embedding                         │                    │
│  │ - Same embedding model as documents     │                    │
│  │ - Cached for identical queries          │                    │
│  └─────────────────────────────────────────┘                    │
│        │                                                          │
│        ▼                                                          │
│  ┌─────────────────────────────────────────┐                    │
│  │ Similarity Search                       │                    │
│  │ - Cosine similarity in vector space     │                    │
│  │ - Optional: Query expansion (synonyms) │                    │
│  └─────────────────────────────────────────┘                    │
│        │                                                          │
│        ▼                                                          │
│  ┌─────────────────────────────────────────┐                    │
│  │ Result Ranking                          │                    │
│  │ - Similarity Score: 70% weight         │                    │
│  │ - Rank Position: 30% weight             │                    │
│  │ - Relevance Score: 0-100 combined       │                    │
│  └─────────────────────────────────────────┘                    │
│        │                                                          │
│        ▼                                                          │
│  Top-K Documents (e.g., top 5)                                  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ AUGMENTATION PHASE                                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  System Prompt + Retrieved Documents                             │
│        │                                                          │
│        ▼                                                          │
│  ┌─────────────────────────────────────────┐                    │
│  │ Token Counting                          │                    │
│  │ - Estimate tokens per document          │                    │
│  │ - Respect max context token limit       │                    │
│  └─────────────────────────────────────────┘                    │
│        │                                                          │
│        ▼                                                          │
│  ┌─────────────────────────────────────────┐                    │
│  │ Context Formatting                      │                    │
│  │ - Add document markers                  │                    │
│  │ - Include metadata                      │                    │
│  │ - Add instructions                      │                    │
│  └─────────────────────────────────────────┘                    │
│        │                                                          │
│        ▼                                                          │
│  Augmented Prompt (Ready for LLM)                                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Embedding Service Layer

**File**: `src/ai/embeddings/embedding-service.ts`

```typescript
EmbeddingService
├── OpenAI Integration
│   ├── text-embedding-3-small model (default)
│   ├── 1536 dimensions
│   └── Batch processing (10 items/batch)
├── Caching Layer
│   ├── In-memory cache (Map<text_hash, vector>)
│   └── Persistent cache (JSON file backup)
├── Statistics
│   ├── Cache hit rate tracking
│   ├── Average latency monitoring
│   └── Total embeddings generated
└── Error Handling
    ├── Retry logic (up to 3 attempts)
    └── Fallback strategies
```

**Key Methods**:

- `generateEmbedding(text)` → `number[]` (1536-dimensional vector)
- `batchGenerateEmbeddings(texts)` → `number[][]`
- `embedQuery(text)` → `number[]`
- `cosineSimilarity(vectorA, vectorB)` → `number` (0-1)

**Caching Strategy**:

- SHA256 hash of text as key
- Avoids re-embedding identical content
- Typical cache hit rate: 40-60% in production

### 2. ChromaDB Client Layer

**File**: `src/ai/vector-db/chroma-client.ts`

```typescript
ChromaClient (Singleton per collection)
├── Initialization
│   ├── Connect to ChromaDB server
│   ├── Create/verify collection
│   └── Initialize embedding connection
├── Document Operations
│   ├── addDocuments(docs) → Vectorize + Store
│   ├── search(query, k, filter) → Ranked Results
│   ├── deleteDocuments(ids) → Remove from index
│   └── clearCollection() → Full reset
├── Metadata Management
│   ├── Store custom metadata with vectors
│   ├── Filter search by metadata
│   └── Preserve metadata in results
└── Statistics
    ├── Total documents indexed
    ├── Last update timestamp
    └── Average similarity in results
```

**Collection Structure**:

```
Collection "fraud_documents"
├── Document 1
│   ├── id: "doc-001"
│   ├── vector: [1.2, 0.5, -0.3, ..., 0.8]  (1536 dims)
│   ├── content: "Income Statement..."
│   └── metadata: { type: "Income", customerId: "123" }
├── Document 2
│   └── ...
└── Document N
    └── ...
```

**Singleton Pattern**:

```typescript
// Same instance for same collection
const client1 = getChromaClient({ collectionName: "fraud" });
const client2 = getChromaClient({ collectionName: "fraud" });
// client1 === client2 (same instance)

// Different instances for different collections
const client3 = getChromaClient({ collectionName: "cases" });
// client1 !== client3 (different collections)
```

### 3. Similarity Search Layer

**File**: `src/ai/vector-db/similarity-search.ts`

```typescript
SimilaritySearchService
├── Search Operations
│   ├── search(query, options) → Ranked Results
│   ├── multiSearch(queries) → Results per Query
│   ├── findSimilarDocuments(content) → Similar Docs
│   └── hybridSearch(query, filters) → Filtered Results
├── Query Processing
│   ├── Query expansion (auto-generate synonyms)
│   ├── Deduplication of results
│   └── Threshold filtering
├── Ranking Strategies
│   ├── "similarity": By cosine similarity only
│   ├── "relevance": By relevance score only
│   └── "hybrid": Combined (70% similarity + 30% rank)
└── Statistics
    ├── Query count
    ├── Average relevance score
    └── Execution time tracking
```

**Ranking Formula (Hybrid)**:

```
Relevance Score = (Similarity × 100 × 0.7) + (1 - Rank/MaxRank × 100 × 0.3)

Example:
  - Document at rank 1 with similarity 0.95
  - Score = (95 × 0.7) + (1 - 1/10 × 100 × 0.3)
  - Score = 66.5 + 2.7 = 69.2/100
```

**Query Expansion**:

```
Original: "How to detect fraudulent income documents?"

Expanded:
1. "How to detect fraudulent income documents?"
2. "How to detect suspicious income documents?"
3. "How to detect anomalous income documents?"

Results: Deduplicated + merged by highest similarity
```

### 4. Context Augmentation Layer

**File**: `src/ai/rag/context-augmentation.ts`

```typescript
ContextAugmentationService
├── Context Building
│   ├── Retrieve relevant documents
│   ├── Rank by strategy
│   ├── Truncate to token limit
│   └── Format as context section
├── Token Management
│   ├── Estimate tokens per document
│   ├── Respect maxContextTokens limit
│   └── Graceful degradation
├── Formatting
│   ├── Add document separators
│   ├── Include similarity scores
│   ├── Append metadata if requested
│   └── Add usage instructions
└── Statistics
    ├── Augmentation count
    ├── Average context length
    ├── Documents added per query
    └── Average similarity used
```

**Augmented Prompt Template**:

```
[Original System Prompt]

## RELEVANT CONTEXT FROM VECTOR STORE:
(Retrieved 5 documents)

### Document 1 [type: "Income", customerId: "001"]
**Similarity: 95.2%**
Customer submitted forged income statement with inflated earnings...

### Document 2 [type: "ID", customerId: "002"]
**Similarity: 87.3%**
Expired identification document, similar pattern to fraud case #456...

## END CONTEXT

Use the above context to inform your analysis and response.
```

### 5. RAG Pipeline Orchestrator

**File**: `src/ai/rag/rag-pipeline.ts`

```typescript
RAGPipeline (Singleton per collection)
├── Initialization
│   ├── Initialize ChromaDB client
│   ├── Initialize search service
│   ├── Initialize augmentation service
│   └── Initialize embedding service
├── Document Pipeline
│   ├── ingestDocuments(docs) → Embed + Store
│   ├── deleteDocuments(ids) → Remove
│   └── clear() → Full reset
├── Query Pipeline
│   ├── retrieve(query, systemPrompt) → AugmentedContext
│   ├── queryToAugmentedPrompt(...) → Ready for LLM
│   └── execute(...) → Full workflow
├── Monitoring
│   ├── getStats() → Pipeline statistics
│   ├── getMetrics() → Detailed metrics from all components
│   └── healthCheck() → System status
└── Lifecycle
    ├── initialize() → Connect all components
    └── close() → Clean shutdown
```

**Execution Flow**:

```
User Query
    ↓
[1. Embedding] - Convert query to vector
    ↓
[2. Search] - Find similar documents
    ↓
[3. Ranking] - Sort by relevance
    ↓
[4. Augmentation] - Build context
    ↓
[5. Return] - Augmented prompt ready for LLM
    ↓
LLM (Phase 3 Agents)
    ↓
Enriched Response
```

---

## Singleton Pattern

All services use singleton pattern to ensure:

1. **Single LLM connection** - Avoid multiple embeddings models
2. **Shared cache** - Benefit from embedding cache across queries
3. **Consistent state** - Same statistics/metrics
4. **Resource efficiency** - One ChromaDB connection per collection

```typescript
// Usage: Always get same instance
const rag1 = getRAGPipeline({ collectionName: "fraud_cases" });
const rag2 = getRAGPipeline({ collectionName: "fraud_cases" });
// rag1 === rag2 ✓

// Different collections = different instances
const rag3 = getRAGPipeline({ collectionName: "patterns" });
// rag1 !== rag3 ✓
```

---

## Vector Dimensions & Embeddings

**Model**: OpenAI `text-embedding-3-small`

- **Dimensions**: 1536
- **Token limit**: ~8,000 tokens input
- **Cost**: ~$0.02 per 1M tokens
- **Speed**: ~200-500ms per document

**Example Vector Space**:

```
Income documents cluster together
  ├── High similarity (>0.85): Similar income levels
  ├── Medium similarity (0.5-0.85): Different document types
  └── Low similarity (<0.5): Completely different topics

Fraud documents cluster together
  ├── High similarity (>0.85): Same fraud pattern
  ├── Medium similarity (0.5-0.85): Related fraud types
  └── Low similarity (<0.5): Legitimate documents
```

---

## Performance Profile

### Latency by Operation

```
Operation                    Typical Time    Range
────────────────────────────────────────────────
Embed single text            300-500ms       200-800ms
Batch embed 10 texts         500-1000ms      400-1500ms
Search in index (k=5)        100-300ms       50-500ms depending on size
Rank results                 20-50ms         10-100ms
Augment context              50-100ms        30-150ms
Full RAG query               500-900ms       400-1500ms
```

### Memory Usage

```
Component              Memory per Document
────────────────────────────────────────
Vector (1536 dims)     ~6.1 KB (1536 × 4 bytes)
Metadata (avg)         ~0.5 KB
Cached embedding       ~6.6 KB
ChromaDB overhead      ~0.5 KB per doc
────────────────────────────────────────
Total per document     ~7-8 KB

Scaling example:
- 1,000 documents ≈ 8 MB
- 10,000 documents ≈ 80 MB
- 100,000 documents ≈ 800 MB
```

### Throughput

```
Scenario                    Throughput
──────────────────────────────────────
Document ingestion          ~50-100 docs/min (batched)
Search queries              ~30-50 queries/sec
Concurrent users            ~100-500 (depends on ChromaDB)
```

---

## Token Management Strategy

**Problem**: LLMs have token limits (e.g., GPT-4 = 128K tokens)

**Solution**: Context Augmentation with Token Awareness

```typescript
maxContextTokens = 2000  // Hard limit for context

Token estimation:
- System prompt: ~100 tokens
- User query: ~50 tokens
- Retrieved documents (5): ~1850 tokens (max)
- Total: ~2000 tokens
```

**Truncation Strategy**:

```
1. Count tokens needed
2. Start with top-ranked documents
3. Add documents while under limit
4. For last document, truncate to fit exactly
5. Add "..." marker if truncated
```

---

## Error Handling & Resilience

### Failure Scenarios

```
Scenario 1: ChromaDB Unavailable
├── At init: Create new collection on startup
├── At query: Fall back to embedding only
└── At ingest: Queue documents for later sync

Scenario 2: Embedding API Rate Limited
├── Exponential backoff (1s → 2s → 4s)
├── Use cached embeddings when possible
└── Fall back to keyword search

Scenario 3: No Similar Documents Found
├── Threshold: 0.5 similarity minimum
├── Action: Use only system prompt
└── Log: Warning about empty context

Scenario 4: Token Limit Exceeded
├── Truncate: Cut off at token limit
├── Priority: Keep highest-ranked documents
└── Indicator: "..." in last document
```

### Error Types

```typescript
class ChromaError extends Error {}
class EmbeddingError extends Error {}
class SearchError extends Error {}
```

---

## Integration Points with Phase 3

### Agent Enhancement Flow

```
Phase 3 Agent
    ↓
RAG Pipeline intercepts query
    ↓
Retrieves historical context
    ↓
Augments agent prompt
    ↓
Enhanced Agent with context
    ↓
Better fraud detection
```

### Example: FraudDetectionAgent + RAG

```typescript
// Before RAG:
// "Analyze this income: $75,000"

// After RAG:
// "Analyze this income: $75,000
//
// RELEVANT CONTEXT:
// - Customer had 3 previous applications with $45K-$60K range
// - Similar pattern found in case #456 (fraud confirmed)
// - Historical average for this zip code: $55K"

// Result: Better context = Better fraud detection
```

---

## Scaling Strategy

### Horizontal Scaling

```
Level 1: Single instance
├── 1 RAG pipeline
├── ~100K documents
└── ~500 concurrent queries

Level 2: Multiple collections
├── Separate collections per risk segment
├── Independent RAG pipelines
└── ~1M total documents

Level 3: Distributed
├── Multiple ChromaDB nodes
├── Load balancing
└── ~10M+ documents
```

### Optimization Opportunities

1. **Query Caching**: Cache frequent queries
2. **Batch Augmentation**: Process queries in batches
3. **Async Indexing**: Index documents in background
4. **Vector Compression**: Reduce dimensions for speed
5. **Hybrid Storage**: Separate hot/cold data

---

**Status**: ✅ Phase 4 Architecture Documented  
**Version**: 1.0  
**Last Updated**: May 21, 2026
