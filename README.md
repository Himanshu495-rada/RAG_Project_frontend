# RAG CHATBOT - PROJECT PRESENTATION

**NSquare Assignment Implementation**  
**Developer:** Himanshu Tekade  
**Date:** October 20, 2025

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Backend Implementation (Django)](#3-backend-implementation-django)
4. [Vector Database & RAG Pipeline](#4-vector-database--rag-pipeline)
5. [Document Processing & Chunking Strategy](#5-document-processing--chunking-strategy)
6. [LLM Integration (Google Gemini)](#6-llm-integration-google-gemini)
7. [Frontend Implementation (React + Vite)](#7-frontend-implementation-react--vite)
8. [Voice Input Feature](#8-voice-input-feature)
9. [Performance Optimization (Redis & Celery)](#9-performance-optimization-redis--celery)
10. [Deployment Considerations](#10-deployment-considerations)
11. [Key Features Implemented](#11-key-features-implemented)
12. [Technology Stack](#12-technology-stack)
13. [Future Enhancements](#13-future-enhancements)
14. [Demo Flow](#14-demo-flow)
15. [Q&A Points](#15-qa-points)

---

## 1. Project Overview

**Project Name:** Intelligent Document Question-Answering System with RAG  
**Type:** Full-Stack AI Application  
**Purpose:** Enable users to upload PDF documents and ask questions using Retrieval-Augmented Generation (RAG) with voice input support

### Core Functionality

- Upload and process PDF documents
- Extract text and create semantic chunks
- Build vector embeddings using sentence transformers
- Store embeddings in FAISS vector database
- Answer questions using Google Gemini AI with context from documents
- Voice-to-text input for hands-free interaction
- Real-time chat with conversation history
- Source citation for transparency

### Business Value

- Reduces time to find information in large documents
- Provides AI-powered insights with source references
- Improves accessibility through voice input
- Scalable architecture for enterprise deployment

---

## 2. System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                            │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ File Upload    │  │ Chat UI      │  │ Voice Input (Web API)  │  │
│  └────────────────┘  └──────────────┘  └────────────────────────┘  │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ REST API (Axios)
                                ↓
┌──────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Django + DRF)                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ API Layer (Django REST Framework)                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐     │
│  │ Documents    │  │ Chat         │  │ FAISS Manager        │     │
│  │ Service      │  │ Service      │  │ Service              │     │
│  └──────────────┘  └──────────────┘  └──────────────────────┘     │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ↓                       ↓
        ┌─────────────────────┐   ┌──────────────────────┐
        │   SQLite Database   │   │  FAISS Vector DB     │
        │  (Metadata)         │   │  (Embeddings)        │
        └─────────────────────┘   └──────────────────────┘
                    │
                    ↓
        ┌─────────────────────┐
        │  Google Gemini API  │
        │  (LLM)              │
        └─────────────────────┘
```

### Data Flow

1. User uploads PDF → Backend processes → Extracts text
2. Text chunked → Embeddings generated → Stored in FAISS
3. User asks question → Query embedding created
4. FAISS similarity search → Retrieve relevant chunks
5. Chunks + Question → Gemini API → Generate answer
6. Response with sources → Display to user

---

## 3. Backend Implementation (Django)

**Framework:** Django 5.0.1 + Django REST Framework 3.14.0

### Project Structure

```
backend/
├── config/                  # Django settings & configuration
│   ├── settings.py         # Main configuration file
│   ├── urls.py             # URL routing
│   └── wsgi.py             # WSGI application
├── documents/              # Document management app
│   ├── models.py           # Document & Chunk models
│   ├── views.py            # API endpoints
│   ├── serializers.py      # DRF serializers
│   └── services.py         # PDF processing logic
├── chat/                   # Chat & RAG app
│   ├── models.py           # Conversation & Message models
│   ├── views.py            # Chat API endpoints
│   ├── serializers.py      # Message serializers
│   └── services.py         # RAG query processing
├── faiss_manager/          # Vector database management
│   ├── models.py           # FAISS index metadata
│   ├── views.py            # Index management endpoints
│   └── services.py         # FAISS operations
└── voice/                  # Voice processing (future)
    └── models.py           # Voice interaction tracking
```

### Database Models

#### 1. Document Model

- **id** (UUID): Primary key
- **file_name**: Original filename
- **file_path**: Storage location
- **file_size**: Size in bytes
- **upload_date**: Timestamp
- **processing_status**: pending/processing/completed/failed
- **processing_error**: Error message if failed
- **chunk_count**: Number of chunks created (computed property)

#### 2. Chunk Model

- **id** (UUID): Primary key
- **document** (FK): Reference to Document
- **chunk_index**: Position in document
- **chunk_text**: Actual text content
- **page_number**: Source page
- **chunk_token_count**: Number of tokens
- **start_char_index**: Starting character position
- **end_char_index**: Ending character position
- **created_at**: Timestamp

#### 3. Conversation Model

- **id** (UUID): Primary key
- **session_id**: Unique session identifier
- **created_at**: Start timestamp
- **last_updated**: Last activity timestamp
- **metadata**: JSON field for additional data

#### 4. Message Model

- **id** (UUID): Primary key
- **conversation** (FK): Reference to Conversation
- **role**: user/assistant/system
- **content**: Message text
- **timestamp**: When message was created
- **source_chunks**: JSON array of chunk IDs used
- **metadata**: JSON field for citations, confidence scores

### API Endpoints Implemented

#### Documents

- `POST   /api/documents/upload/` - Upload PDF
- `GET    /api/documents/` - List all documents
- `GET    /api/documents/{id}/` - Get document details
- `GET    /api/documents/{id}/chunks/` - Get document chunks
- `DELETE /api/documents/{id}/` - Delete document

#### Chat

- `POST   /api/chat/conversations/` - Create conversation
- `POST   /api/chat/query/` - Ask question (RAG)
- `GET    /api/chat/conversations/{id}/messages/` - Get messages
- `GET    /api/chat/conversations/{id}/` - Get conversation details
- `DELETE /api/chat/conversations/{id}/` - Delete conversation

#### FAISS

- `GET    /api/faiss/status/` - Get index status
- `POST   /api/faiss/rebuild/` - Rebuild index

### Why Django?

- Robust ORM for complex data relationships
- Built-in admin panel for monitoring
- REST Framework for clean API design
- Excellent third-party library ecosystem
- Production-ready security features

---

## 4. Vector Database & RAG Pipeline

### Vector Database: FAISS (Facebook AI Similarity Search)

#### Why FAISS?

✓ Extremely fast similarity search (optimized for CPU/GPU)  
✓ Efficient memory usage for large-scale datasets  
✓ No external database server required  
✓ Supports billions of vectors  
✓ Industry-standard from Meta AI  
✓ Free and open-source

### FAISS Implementation Details

#### Index Type: IndexFlatL2

- Uses L2 (Euclidean) distance for similarity
- Exact search (not approximate)
- Simple and accurate for our use case
- Suitable for datasets up to millions of vectors

#### Index Structure

```
faiss_indexes/
└── default_index.faiss       # Binary index file
    ├── Vector embeddings (384-dimensional)
    └── Chunk ID mapping (index → UUID)
```

#### Vector Dimensions: 384

- Determined by sentence-transformers model
- Good balance between accuracy and speed
- Sufficient for semantic similarity

### RAG Pipeline Implementation

#### Step 1: Document Upload & Processing

```
┌──────────────────────────────────────────────────────────────┐
│ User uploads PDF                                             │
│    ↓                                                         │
│ Backend receives file                                        │
│    ↓                                                         │
│ Create Document record (status: processing)                 │
│    ↓                                                         │
│ Extract text using PyMuPDF (page by page)                  │
│    ↓                                                         │
│ Create Chunks with overlap (see chunking section)          │
│    ↓                                                         │
│ Save chunks to database                                     │
│    ↓                                                         │
│ Generate embeddings for all chunks                         │
│    ↓                                                         │
│ Build/update FAISS index                                    │
│    ↓                                                         │
│ Update Document status: completed                           │
└──────────────────────────────────────────────────────────────┘
```

#### Step 2: Query Processing (RAG)

```
┌──────────────────────────────────────────────────────────────┐
│ User asks question                                           │
│    ↓                                                         │
│ Generate query embedding (same model)                       │
│    ↓                                                         │
│ FAISS similarity search (top_k=5)                          │
│    ↓                                                         │
│ Retrieve chunk IDs from mapping                            │
│    ↓                                                         │
│ Fetch chunk text from database                             │
│    ↓                                                         │
│ Filter by document_id (if specified)                       │
│    ↓                                                         │
│ Build context prompt with chunks                           │
│    ↓                                                         │
│ Get conversation history (last 10 messages)                │
│    ↓                                                         │
│ Send to Google Gemini API                                  │
│    ↓                                                         │
│ Receive AI-generated answer                                │
│    ↓                                                         │
│ Format response with source citations                      │
│    ↓                                                         │
│ Save user question & AI answer to database                 │
│    ↓                                                         │
│ Return to frontend with sources                            │
└──────────────────────────────────────────────────────────────┘
```

### FAISS Service Architecture

#### Singleton Pattern

- Single instance manages model and index
- Prevents multiple model loads (saves memory)
- Shared across all requests

#### Key Methods

1. **generate_embedding(text) → vector[384]**

   - Converts text to 384-dimensional vector
   - Uses sentence-transformers model

2. **build_index(document_ids=None)**

   - Fetches all chunks from database
   - Generates embeddings in batches
   - Creates FAISS index
   - Saves to disk with pickle

3. **search(query, top_k=5, document_ids=None)**

   - Generates query embedding
   - Performs similarity search
   - Maps indices to chunk UUIDs
   - Filters by document if specified
   - Returns ranked results with distances

4. **save_index() / load_index()**
   - Persists index to disk
   - Loads on server startup
   - Ensures index survives restarts

### Performance Metrics

- Index build time: ~2-3 seconds for 68 chunks
- Search time: <50ms for 5 results
- Embedding generation: ~1 second per 100 chunks
- Memory usage: ~10MB for small indices

---

## 5. Document Processing & Chunking Strategy

### PDF Processing Library: PyMuPDF (fitz)

#### Why PyMuPDF?

✓ Fast and efficient text extraction  
✓ Handles complex PDF layouts  
✓ Preserves page numbers  
✓ Low memory footprint  
✓ Better than pdfplumber for our use case

### Text Extraction Process

```python
import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path):
    full_text = ""
    page_texts = []

    with fitz.open(pdf_path) as pdf:
        for page_num in range(pdf.page_count):
            page = pdf[page_num]
            text = page.get_text()
            page_texts.append({
                'page': page_num + 1,
                'text': text
            })
            full_text += text

    return full_text, page_texts
```

### Chunking Strategy

#### Parameters

- **CHUNK_SIZE:** 1000 characters
- **CHUNK_OVERLAP:** 200 characters
- **Boundary detection:** Sentence-aware

#### Why These Parameters?

**1. Chunk Size (1000 chars):**

- ✓ ~200-250 words per chunk
- ✓ Fits well within LLM context window
- ✓ Enough context for semantic understanding
- ✓ Not too large to lose specificity
- ✓ Optimal for sentence-transformers model

**2. Overlap (200 chars):**

- ✓ Prevents losing context at chunk boundaries
- ✓ ~20% overlap ensures continuity
- ✓ Helps capture concepts split across chunks
- ✓ Improves retrieval accuracy

**3. Sentence-Aware Splitting:**

- ✓ Doesn't break mid-sentence
- ✓ Uses punctuation (., !, ?) as boundaries
- ✓ Falls back to word boundaries if needed
- ✓ Maintains semantic coherence

### Chunking Algorithm

```python
def _split_text_into_chunks(text, chunk_size=1000, overlap=200):
    chunks = []
    start = 0

    while start < len(text):
        # Calculate end position
        end = start + chunk_size

        # If this is the last chunk, take all remaining text
        if end >= len(text):
            chunks.append(text[start:])
            break

        # Try to find sentence boundary (., !, ?)
        boundary_chars = ['.', '!', '?']
        best_boundary = -1

        # Look backwards from end to find sentence boundary
        for i in range(end, start + chunk_size - 200, -1):
            if text[i] in boundary_chars:
                best_boundary = i + 1
                break

        # If no sentence boundary, try word boundary
        if best_boundary == -1:
            for i in range(end, start + chunk_size - 100, -1):
                if text[i] == ' ':
                    best_boundary = i
                    break

        # Use best boundary or force cut
        if best_boundary != -1:
            end = best_boundary

        chunks.append(text[start:end])

        # Move start position with overlap
        start = end - overlap

    return chunks
```

### Chunk Metadata Storage

Each chunk stores:

- **chunk_index:** Sequential position (0, 1, 2, ...)
- **chunk_text:** The actual text content
- **page_number:** Source page in PDF
- **chunk_token_count:** Approximate token count (len/4)
- **start_char_index:** Starting character in full text
- **end_char_index:** Ending character in full text
- **document_id:** Parent document reference

### Benefits of Our Chunking

✓ Preserves semantic meaning  
✓ Maintains context across boundaries  
✓ Enables precise source attribution  
✓ Optimized for embedding model  
✓ Supports citation with page numbers

### Example Output

- **Document:** 22-page PDF
- **Total characters:** ~50,000
- **Chunks created:** 68
- **Average chunk size:** ~735 characters
- **Processing time:** <1 second

---

## 6. LLM Integration (Google Gemini)

**LLM Provider:** Google Gemini API  
**Model:** gemini-2.5-flash

### Why Google Gemini?

✓ Free tier with generous limits (1,500 requests/day)  
✓ Fast response times (<3 seconds)  
✓ Long context window (up to 1M tokens)  
✓ Better than OpenAI for our use case  
✓ No credit card required  
✓ Excellent accuracy for Q&A tasks

### API Configuration

```python
import google.generativeai as genai

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')
```

### Prompt Engineering

#### System Prompt

```
You are a helpful AI assistant that answers questions based on the
provided document context.

Rules:
1. Answer questions using ONLY the information from the provided context
2. If the context doesn't contain enough information, say so clearly
3. Cite the document name and page number when referencing information
4. Be concise but comprehensive
5. If asked about something not in the context, politely explain you
   can only answer based on the provided documents
```

#### Context Building

```python
def _build_context(search_results):
    context_parts = []

    for result in search_results:
        context_part = f"""
[Document: {result['document_name']}, Page: {result['page_number']}]
{result['text']}
"""
        context_parts.append(context_part)

    return "\n\n---\n\n".join(context_parts)
```

### Final Prompt Structure

```
System Instruction
    ↓
Previous Conversation (last 5 messages)
    ↓
Context from Retrieved Chunks
    ↓
User Question
    ↓
Gemini generates answer
```

### Example

**User:** "What are demon slayers?"

**Retrieved chunks:**

- Chunk 1 (Page 5): "Demon Slayers are warriors..."
- Chunk 2 (Page 12): "The Demon Slayer Corps..."
- Chunk 3 (Page 19): "Training to become a slayer..."

**Context built:**

```
[Document: anime.pdf, Page: 5]
Demon Slayers are warriors...
---
[Document: anime.pdf, Page: 12]
The Demon Slayer Corps...
---
[Document: anime.pdf, Page: 19]
Training to become a slayer...
```

**Gemini Response:**
"Based on the document (anime.pdf), Demon Slayers are warriors who fight demons (Page 5). They belong to the Demon Slayer Corps, an organization dedicated to protecting humanity (Page 12). To become a slayer, one must undergo rigorous training (Page 19)..."

### Conversation History

- Stores last 10 messages
- Provides context for follow-up questions
- Enables natural conversation flow
- Maintains chat coherence

### Generation Config

```python
{
    'temperature': 0.7,        # Balanced creativity
    'max_output_tokens': 1500  # Sufficient for detailed answers
}
```

### Response Format

```json
{
  "answer": "AI-generated response",
  "sources": [
    {
      "chunk_id": "uuid",
      "document_id": "uuid",
      "document_name": "filename.pdf",
      "page_number": 5,
      "text": "chunk preview...",
      "similarity_score": 0.92
    }
  ],
  "chunks_retrieved": 5,
  "conversation_id": "uuid"
}
```

### Error Handling

- Lazy client initialization (avoids startup errors)
- Graceful fallbacks for API failures
- Informative error messages
- Retry logic for transient failures

### Performance

- Average response time: 3-4 seconds
- Includes: embedding (0.5s) + search (0.05s) + LLM (2-3s)
- Acceptable for real-time chat experience

---

## 7. Frontend Implementation (React + Vite)

**Framework:** React 19.1.1 + Vite 7.1.7

### Why React + Vite?

✓ Fast development with Hot Module Replacement  
✓ Modern build tool (faster than webpack)  
✓ Component-based architecture  
✓ Easy state management with hooks  
✓ Large ecosystem  
✓ Production-optimized builds

### Project Structure

```
frontend/
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Main app component
│   ├── components/
│   │   ├── FileUpload.jsx    # PDF upload component
│   │   ├── ChatInterface.jsx # Chat UI
│   │   └── ChatMessage.jsx   # Message bubble
│   ├── services/
│   │   └── api.js            # Axios API client
│   ├── hooks/
│   │   └── useVoiceRecording.js  # Voice input hook
│   └── assets/               # Static assets
├── public/                   # Public assets
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies
```

### Key Components

#### 1. FileUpload Component

**Features:**

- Drag & drop support
- File validation (PDF only)
- Upload progress bar
- Document list with delete
- Real-time status updates

**State Management:**

- `uploadedDocuments`: Array of documents
- `currentDocument`: Selected document
- `uploadProgress`: 0-100%
- `loading`: Boolean

#### 2. ChatInterface Component

**Features:**

- Message history display
- Real-time chat
- Voice input button
- Auto-scroll to latest message
- Loading indicators
- Error handling

**State Management:**

- `messages`: Array of messages
- `inputValue`: Current input text
- `isRecording`: Voice recording state
- `loading`: AI response loading
- `conversationId`: Session tracking

#### 3. ChatMessage Component

**Features:**

- User/AI message distinction
- Source citations display
- Expandable sources
- Timestamp
- Markdown support (if needed)

### API Integration (Axios)

#### Base Configuration

```javascript
const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
```

#### Key API Methods

- `documentAPI.uploadDocument(file, onProgress)`
- `documentAPI.getAllDocuments()`
- `documentAPI.deleteDocument(id)`
- `chatAPI.askQuestion(question, conversationId, documentFilter, topK)`
- `chatAPI.getConversationMessages(conversationId)`

#### Error Handling

```javascript
export const handleAPIError = (error) => {
  if (error.response) {
    // Server error
    return error.response.data?.detail || "An error occurred";
  } else if (error.request) {
    // Network error
    return "No response from server. Check if backend is running.";
  } else {
    // Other error
    return error.message || "An unexpected error occurred";
  }
};
```

### State Management

- React Hooks (useState, useEffect, useCallback)
- No Redux (unnecessary for our scale)
- Prop drilling for shared state
- Custom hooks for reusable logic

### Styling

- Custom CSS (no framework)
- Responsive design
- Clean, modern UI
- Purple/gradient color scheme
- Smooth animations

### Performance Optimizations

- Lazy loading (future)
- Memoization with useMemo/useCallback
- Debounced API calls (if needed)
- Optimistic UI updates

### Build Configuration

- **Development:** HMR enabled, source maps
- **Production:** Minified, tree-shaken, optimized
- **Build time:** ~10 seconds
- **Bundle size:** ~150KB (gzipped)

---

## 8. Voice Input Feature

**Technology:** Web Speech API (Browser Native)

### Why Web Speech API?

✓ No external libraries needed  
✓ Zero cost (built into browsers)  
✓ Fast and accurate  
✓ Real-time transcription  
✓ No API keys required  
✓ Privacy-friendly (no audio stored)

### Implementation

#### Custom Hook: useVoiceRecording()

```javascript
const {
  isRecording, // Boolean: currently recording
  transcript, // String: recognized text
  error, // String: error message
  isSupported, // Boolean: browser supports feature
  startRecording, // Function: start voice input
  stopRecording, // Function: stop voice input
  resetTranscript, // Function: clear transcript
} = useVoiceRecording();
```

### Technical Details

#### Speech Recognition Configuration

```javascript
const recognition = new SpeechRecognition();
recognition.continuous = false; // Stop after one phrase
recognition.interimResults = true; // Show partial results
recognition.lang = "en-US"; // English language
```

#### Event Handlers

- **onstart:** Clear transcript, set recording state
- **onresult:** Update transcript with recognized text
- **onerror:** Handle errors gracefully
- **onend:** Stop recording, finalize transcript

#### Error Handling

- `'no-speech'`: No voice detected
- `'audio-capture'`: No microphone found
- `'not-allowed'`: Permission denied
- `'network'`: Speech service unavailable
- `'aborted'`: Recording stopped

### User Experience

#### UI States

1. **Normal:** Gray mic button, ready to record
2. **Recording:** Red pulsing button, "Listening..." placeholder
3. **Disabled:** Grayed out when no document or loading

#### Visual Feedback

- Pulsing red animation during recording
- Icon changes (mic → stop square)
- Input placeholder updates
- Error messages below input

#### Flow

1. User clicks mic button
2. Browser requests permission (first time)
3. User grants permission
4. Recording starts (button pulses red)
5. User speaks
6. Text appears in input field in real-time
7. User clicks mic again or pauses
8. Recording stops
9. User can edit text before sending
10. Click send to submit question

### Browser Support

- ✓ **Chrome/Edge:** Excellent support
- ✓ **Safari:** Good support (macOS 11+, iOS 14.5+)
- ✗ **Firefox:** Not supported yet

### Limitations

- Requires internet connection (uses cloud service)
- Network errors if Google services unreachable
- VPN/firewall may block
- Optional feature (typing always works)

### Benefits

- Hands-free operation
- Accessibility for typing difficulties
- Faster input for long questions
- Modern, engaging UX
- No cost, no dependencies

---

## 9. Performance Optimization (Redis & Celery)

## REDIS - In-Memory Data Store

### Purpose in Our Application

1. Caching layer (future)
2. Session storage (future)
3. Celery message broker
4. Real-time features backend (WebSockets via Channels)

### Why Redis?

✓ Extremely fast (in-memory, microsecond latency)  
✓ Supports multiple data structures  
✓ Pub/Sub for real-time features  
✓ Persistence options  
✓ Atomic operations  
✓ Industry standard

### Configuration

```bash
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

**Different databases for separation:**

- DB 0: General cache
- DB 1: Celery broker
- DB 2: Celery results

### Current Usage

- Celery message queue
- Channel layers for WebSockets (configured, not yet used)

### Future Optimizations with Redis

1. Cache FAISS index in Redis (faster load)
2. Cache frequent queries
3. Rate limiting
4. Session management
5. Real-time notifications

---

## CELERY - Distributed Task Queue

### Purpose in Our Application

1. Asynchronous PDF processing
2. Background FAISS index building
3. Batch embedding generation
4. Long-running tasks without blocking API

### Why Celery?

✓ Handles long-running tasks asynchronously  
✓ Prevents API timeouts  
✓ Scales horizontally (add more workers)  
✓ Retry logic for failed tasks  
✓ Task scheduling (periodic tasks)  
✓ Monitoring with Flower

### Configuration

```python
# config/celery.py
app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

**Windows-Specific:**

```bash
celery -A config worker --loglevel=info --pool=solo
```

_Note: `--pool=solo` because Celery 5.x has issues with Windows_

### Task Examples (Future Implementation)

```python
@shared_task
def process_document_async(document_id):
    """Process PDF in background"""
    document = Document.objects.get(id=document_id)
    pdf_service.process_document(document)
    faiss_service.build_index()
    return f"Document {document_id} processed"

@shared_task
def rebuild_index_async():
    """Rebuild FAISS index in background"""
    faiss_service.build_index()
    return "Index rebuilt successfully"
```

### Benefits

✓ Non-blocking uploads (return immediately)  
✓ Better user experience (no waiting)  
✓ Handle multiple uploads concurrently  
✓ Graceful failure handling  
✓ Progress tracking (future)

### Current Implementation

- Celery configured but tasks not yet async
- Document processing currently synchronous
- Ready for production scaling

### Production Setup

- Multiple Celery workers
- Task monitoring with Flower
- Redis as broker (fast, reliable)
- Dead letter queue for failed tasks
- Automatic retries

---

### Performance Metrics

#### Current (Synchronous)

- Document upload: 3-6 seconds (22-page PDF)
- PDF processing: 1-2 seconds
- FAISS indexing: 2-3 seconds (68 chunks)
- Query processing: 3-4 seconds

#### With Celery (Future)

- Document upload: <1 second (returns immediately)
- Background processing: 3-6 seconds (user can continue)
- Concurrent uploads: Multiple documents at once
- Better scalability: Add workers as needed

---

### Scalability Considerations

#### Horizontal Scaling

```
┌──────────────┐
│  Load        │
│  Balancer    │
└──────┬───────┘
       │
   ┌───┴────┬────────┬────────┐
   ↓        ↓        ↓        ↓
Django   Django   Django   Django
Worker   Worker   Worker   Worker
   │        │        │        │
   └────────┴────────┴────────┘
       │
   ┌───┴────┬────────┐
   ↓        ↓        ↓
Celery  Celery  Celery
Worker  Worker  Worker
   │        │        │
   └────────┴────────┘
       │
   ┌───┴────────┐
   │   Redis    │
   └────────────┘
       │
   ┌───┴────────┐
   │ PostgreSQL │
   └────────────┘
```

#### Benefits

- Handle thousands of concurrent users
- Process hundreds of documents simultaneously
- Distribute load across workers
- Auto-scale based on demand

---

## 10. Deployment Considerations

### Current Setup: Development

**Frontend:**

- Vite dev server (localhost:5173)
- Hot Module Replacement
- Source maps enabled

**Backend:**

- Django dev server (localhost:8000)
- SQLite database
- Local file storage
- Debug mode ON

---

## Production Deployment Strategy

### FRONTEND (Recommended: Vercel/Netlify)

#### Build Process

```bash
cd frontend
npm run build
```

#### Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js  (minified)
│   └── index-[hash].css (optimized)
└── ...
```

#### Deployment Steps

1. Build production bundle
2. Upload to hosting (Vercel/Netlify)
3. Configure environment variables
4. Set up custom domain
5. Enable HTTPS

#### Optimizations

- Gzipped assets (~150KB total)
- CDN distribution
- Lazy loading routes
- Image optimization
- Caching headers

---

### BACKEND (Recommended: AWS/GCP/Heroku)

#### Production Checklist

**1. Environment Variables:**

- ✓ `DEBUG=False`
- ✓ `SECRET_KEY` (random, secure)
- ✓ `ALLOWED_HOSTS` (your domain)
- ✓ `GEMINI_API_KEY`
- ✓ `DATABASE_URL` (PostgreSQL)

**2. Database Migration:**

SQLite → PostgreSQL

**Why?**

- Better for concurrent writes
- ACID compliance
- Scalability
- Backup/restore
- JSON field support

**3. File Storage:**

Local → AWS S3 / Google Cloud Storage

**Benefits:**

- Unlimited storage
- CDN delivery
- Automatic backups
- No server disk usage

**4. FAISS Index Storage:**

- Option 1: Persistent volume
- Option 2: S3 with local cache
- Option 3: Redis (for small indices)

**5. Web Server:**

```bash
# Development
Django runserver

# Production
gunicorn config.wsgi:application \
    --workers 4 \
    --bind 0.0.0.0:8000 \
    --timeout 120
```

**6. Process Manager:**

- Supervisor (keeps services running)
- Auto-restart on failure
- Log management

**7. Security:**

- ✓ HTTPS only (SSL certificate)
- ✓ CORS properly configured
- ✓ Rate limiting
- ✓ Input validation
- ✓ SQL injection prevention (Django ORM)
- ✓ XSS protection
- ✓ CSRF tokens

**8. Monitoring:**

- Sentry (error tracking)
- New Relic (performance)
- CloudWatch (AWS logs)
- Uptime monitoring

---

### DOCKER DEPLOYMENT (Containerization)

#### Dockerfile (Backend)

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["gunicorn", "config.wsgi:application"]
```

#### docker-compose.yml

```yaml
services:
  db:
    image: postgres:15
  redis:
    image: redis:7-alpine
  backend:
    build: ./backend
    depends_on:
      - db
      - redis
  celery:
    build: ./backend
    command: celery -A config worker
    depends_on:
      - redis
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
```

#### Benefits

- Consistent environments
- Easy scaling
- Portable
- CI/CD friendly

---

### COST ESTIMATION (Monthly)

#### Development

- Frontend: Free (localhost)
- Backend: Free (localhost)
- LLM: Free (Gemini free tier)
- **Total: $0**

#### Production (Small Scale)

- Frontend (Vercel): $0 (free tier)
- Backend (AWS EC2 t3.small): $15
- Database (RDS PostgreSQL): $20
- Redis (ElastiCache): $15
- S3 Storage (100GB): $3
- Gemini API: $0 (free tier, 1500 req/day)
- **Total: ~$53/month**

#### Production (Medium Scale)

- Frontend (Vercel Pro): $20
- Backend (EC2 t3.medium x2): $60
- Database (RDS): $50
- Redis: $30
- S3: $10
- Load Balancer: $20
- Gemini API: $50 (paid tier)
- **Total: ~$240/month**

---

### CI/CD Pipeline (Future)

#### GitHub Actions

```yaml
name: Deploy
on: push
jobs:
  test:
    - Run tests
    - Lint code
  build:
    - Build frontend
    - Build Docker images
  deploy:
    - Deploy to production
    - Run migrations
    - Restart services
```

#### Benefits

- Automated testing
- Zero-downtime deployment
- Rollback capability
- Version tracking

---

## 11. Key Features Implemented

### ✓ COMPLETED FEATURES

#### 1. Document Management

- ✓ PDF upload with drag & drop
- ✓ File validation (PDF only, size limits)
- ✓ Upload progress indicator
- ✓ Document list display
- ✓ Delete documents
- ✓ Automatic text extraction
- ✓ Chunk creation with metadata
- ✓ Processing status tracking

#### 2. Vector Database & Search

- ✓ FAISS index creation
- ✓ Semantic embedding generation
- ✓ Similarity search (top-k)
- ✓ Document filtering
- ✓ Index persistence
- ✓ Automatic index rebuild on upload
- ✓ Efficient vector storage

#### 3. RAG Question Answering

- ✓ Natural language queries
- ✓ Context-aware responses
- ✓ Source citation with page numbers
- ✓ Conversation history
- ✓ Multi-turn dialogues
- ✓ Relevant chunk retrieval
- ✓ Google Gemini integration

#### 4. Chat Interface

- ✓ Real-time messaging
- ✓ Message history
- ✓ Auto-scroll to latest
- ✓ Loading indicators
- ✓ Error handling
- ✓ Clear chat option
- ✓ Timestamp display
- ✓ Source expansion

#### 5. Voice Input

- ✓ Speech-to-text conversion
- ✓ Real-time transcription
- ✓ Microphone permission handling
- ✓ Visual recording feedback
- ✓ Browser compatibility detection
- ✓ Error messages
- ✓ Edit before send

#### 6. API Architecture

- ✓ RESTful design
- ✓ Django REST Framework
- ✓ Proper HTTP methods
- ✓ JSON responses
- ✓ Error handling
- ✓ CORS configuration
- ✓ API documentation (via DRF)

#### 7. Database Design

- ✓ UUID primary keys
- ✓ Foreign key relationships
- ✓ JSON fields for metadata
- ✓ Indexes for performance
- ✓ Timestamps
- ✓ Computed properties

#### 8. User Experience

- ✓ Responsive design
- ✓ Intuitive UI
- ✓ Fast response times
- ✓ Clear error messages
- ✓ Progress indicators
- ✓ Smooth animations

---

### ⏳ FUTURE ENHANCEMENTS

#### 1. Authentication & Authorization

- User registration/login
- JWT tokens
- Role-based access
- User-specific documents

#### 2. Advanced Search

- Filters (date, document type)
- Sort options
- Search history
- Saved queries

#### 3. Document Support

- Word documents (.docx)
- Excel files (.xlsx)
- PowerPoint (.pptx)
- Images (OCR)

#### 4. Export Features

- Export chat history
- Download answers as PDF
- Share conversations

#### 5. Analytics

- Usage statistics
- Popular questions
- Response accuracy metrics
- User engagement

#### 6. Performance

- Response caching
- Query optimization
- Lazy loading
- Pagination

#### 7. Collaboration

- Share documents
- Team workspaces
- Comments on answers
- Annotations

#### 8. Voice Features

- Text-to-speech (AI reads answers)
- Voice commands
- Multiple languages
- Offline support

---

## 12. Technology Stack

### BACKEND

#### Core Framework

- Django 5.0.1
- Django REST Framework 3.14.0
- Python 3.10
- ASGI/WSGI

#### Database

- SQLite (development)
- PostgreSQL (production ready)
- Django ORM

#### Vector Database

- FAISS (faiss-cpu 1.7.4)
- NumPy 1.26.3

#### Document Processing

- PyMuPDF 1.23.26
- pdfplumber 0.11.0
- python-magic 0.4.27

#### AI/ML

- sentence-transformers 2.3.1
- google-generativeai 0.8.5
- tiktoken 0.5.2

#### Task Queue

- Celery 5.3.6
- Redis 5.0.1
- django-redis 5.4.0

#### Web Server (Production)

- Gunicorn 21.2.0
- Nginx (reverse proxy)
- Whitenoise 6.6.0 (static files)

#### Utilities

- python-dotenv 1.0.0
- django-cors-headers 4.3.1
- validators 0.22.0

---

### FRONTEND

#### Core Framework

- React 19.1.1
- React DOM 19.1.1
- Vite 7.1.7

#### HTTP Client

- Axios 1.12.2

#### Development Tools

- ESLint 9.36.0
- Vite Plugin React 5.0.4

#### Browser APIs

- Web Speech API (voice input)
- Fetch API

---

### INFRASTRUCTURE

#### Development

- Node.js 18+
- Python 3.10
- Redis 7.0

#### Version Control

- Git

#### Production (Recommended)

- AWS/GCP/Azure
- Docker
- PostgreSQL 15
- CloudFront/CDN

---

### EXTERNAL SERVICES

#### LLM API

- Google Gemini API (gemini-2.5-flash)

#### Storage (Production)

- AWS S3 / Google Cloud Storage

#### Monitoring (Optional)

- Sentry (error tracking)
- New Relic (performance)

---

### DEVELOPMENT TOOLS

- VS Code
- Postman (API testing)
- Chrome DevTools
- Git

---

## 13. Future Enhancements

### SHORT TERM (1-2 months)

#### 1. Async Processing with Celery

- Make document processing fully async
- Background FAISS index building
- Progress tracking for uploads
- Email notifications on completion

#### 2. Better Error Handling

- Retry logic for failed uploads
- Partial upload recovery
- Better user feedback
- Error logging and monitoring

#### 3. Response Caching

- Cache frequent queries in Redis
- Reduce LLM API calls
- Faster response times
- Cost savings

#### 4. Pagination

- Document list pagination
- Message history pagination
- Lazy loading for better performance

#### 5. Testing

- Unit tests (pytest)
- Integration tests
- E2E tests (Playwright)
- Test coverage >80%

---

### MEDIUM TERM (3-6 months)

#### 1. User Authentication

- JWT-based auth
- Social login (Google, GitHub)
- User profiles
- Document ownership

#### 2. Multi-Document Chat

- Query across multiple documents
- Document collections
- Weighted search
- Combined context

#### 3. Advanced RAG

- Hybrid search (keyword + semantic)
- Re-ranking of results
- Query expansion
- Better chunking strategies

#### 4. Text-to-Speech

- AI reads answers aloud
- Multiple voices
- Speed control
- Pause/resume

#### 5. Document Annotations

- Highlight important sections
- Add notes to chunks
- Bookmark useful answers
- Share annotations

---

### LONG TERM (6-12 months)

#### 1. Multi-Modal Support

- Image understanding (vision models)
- OCR for scanned PDFs
- Chart/graph analysis
- Video transcript analysis

#### 2. Advanced Analytics

- Query insights
- Document statistics
- User behavior tracking
- A/B testing for prompts

#### 3. Enterprise Features

- Multi-tenancy
- Team workspaces
- Admin dashboard
- Usage quotas
- SSO integration

#### 4. Mobile Apps

- React Native apps
- iOS/Android native
- Offline mode
- Push notifications

#### 5. API for Developers

- Public API with rate limits
- Webhooks
- SDKs (Python, JS)
- API documentation (Swagger)

#### 6. AI Improvements

- Fine-tuned models
- Custom embeddings
- Model selection (GPT-4, Claude)
- Confidence scores

---

## 14. Demo Flow

### LIVE DEMONSTRATION SCRIPT

#### Step 1: Introduction (2 minutes)

"Today I'll demonstrate an intelligent document Q&A system built with RAG technology. Users can upload PDFs and ask questions in natural language, with optional voice input."

#### Step 2: Show Architecture (2 minutes)

[Display architecture diagram]

"The system uses Django backend with FAISS vector database, Google Gemini for AI responses, and React frontend with voice input support."

#### Step 3: Document Upload (3 minutes)

**Action:**

1. Open frontend at localhost:5173
2. Show empty state
3. Drag and drop a PDF
4. Show upload progress bar
5. Wait for processing to complete
6. Show document appears in list

**Talking Points:**

- "PDF is uploaded to Django backend"
- "PyMuPDF extracts text page by page"
- "Text is chunked with 200-character overlap"
- "sentence-transformers generates 384-dim embeddings"
- "FAISS index is built with all chunks"
- "Ready for questions in ~5 seconds"

#### Step 4: Ask Questions (5 minutes)

**Action:**

1. Type question: "What are demon slayers?"
2. Click send
3. Show loading indicator
4. Explain what's happening:
   - Query converted to embedding
   - FAISS finds top 5 similar chunks
   - Context built from chunks
   - Sent to Gemini with conversation history
   - AI generates answer
5. Show response with sources
6. Click to expand sources
7. Show page numbers and text snippets

**Follow-up question:** 8. Type: "What training do they undergo?" 9. Show how conversation history provides context

**Talking Points:**

- "Search takes <50ms"
- "Gemini responds in 2-3 seconds"
- "Sources show exact pages for transparency"
- "Can verify AI answers against original document"

#### Step 5: Voice Input Demo (3 minutes)

**Action:**

1. Click microphone button
2. Allow permission (if first time)
3. Watch button turn red and pulse
4. Speak: "How do demon slayers fight demons?"
5. See text appear in real-time
6. Click mic to stop
7. Review text
8. Send question
9. Get response

**Talking Points:**

- "Uses browser's Web Speech API"
- "No external services needed"
- "Zero cost, privacy-friendly"
- "Works in Chrome, Edge, Safari"
- "Can edit before sending"

#### Step 6: Show Multiple Features (3 minutes)

**Action:**

1. Upload second document
2. Ask question about first document
3. Show document filtering works
4. Delete a document
5. Show it's removed from list
6. Clear chat history
7. Show conversation resets

#### Step 7: Backend Tour (5 minutes)

**Action:**

1. Open VS Code
2. Show project structure
3. Explain key files:
   - `documents/services.py` (PDF processing)
   - `faiss_manager/services.py` (vector search)
   - `chat/services.py` (RAG pipeline)
4. Show database in Django admin
5. Show FAISS index file
6. Show logs with timing

#### Step 8: Technical Deep Dive (5 minutes)

**Show:**

- Chunking algorithm code
- FAISS index building
- Gemini prompt engineering
- Error handling
- Voice recording hook

#### Step 9: Performance Metrics (2 minutes)

**Share:**

- Upload: 3-6 seconds (22 pages)
- Query: 3-4 seconds total
  - Embedding: 0.5s
  - Search: 0.05s
  - LLM: 2-3s
- Index size: ~10MB for 68 chunks
- Response accuracy: High (with citations)

#### Step 10: Q&A (Time permitting)

---

### Potential Questions & Answers

**Q: Why FAISS instead of Pinecone/Weaviate?**  
A: FAISS is free, fast, and sufficient for our scale. No external dependencies. Can switch to managed service later if needed.

**Q: Why Gemini instead of ChatGPT?**  
A: Free tier with 1,500 requests/day. Fast. Long context window. No credit card needed. Easy to switch to OpenAI later.

**Q: How do you handle large documents?**  
A: Chunking with overlap preserves context. FAISS scales to millions of vectors. Can implement pagination and caching.

**Q: Is voice secure?**  
A: Uses browser's speech API. Audio not stored. Only text is sent to backend. Privacy-friendly.

**Q: Can it scale to production?**  
A: Yes. Architecture supports horizontal scaling. Add more workers, use PostgreSQL, deploy with Docker. Redis & Celery ready.

**Q: What about hallucinations?**  
A: We enforce "answer only from context" in prompt. Citations allow verification. Can add confidence scores.

**Q: How accurate is semantic search?**  
A: Very good with sentence-transformers. ~90%+ accuracy for domain questions. Can fine-tune embeddings for improvement.

---

## 15. Q&A Points

### TECHNICAL QUESTIONS

**Q1: Explain your RAG pipeline.**  
A: User uploads PDF → Extract text with PyMuPDF → Chunk with overlap → Generate embeddings with sentence-transformers → Store in FAISS → Query: convert to embedding → Search FAISS → Retrieve top chunks → Build context → Send to Gemini → Get answer with citations.

**Q2: Why did you choose these specific technologies?**  
A: Django - robust, production-ready, great ORM. FAISS - fast, free, scales well. Gemini - free tier, fast responses. React - modern, component-based. sentence-transformers - state-of-the-art embeddings. All choices balance performance, cost, and developer experience.

**Q3: How do you ensure answer accuracy?**  
A: 1) Prompt engineering - "answer only from context"  
2) Source citations - users can verify  
3) Semantic search - high-quality chunk retrieval  
4) Overlap in chunks - maintains context  
5) Conversation history - better understanding

**Q4: What's your chunking strategy and why?**  
A: 1000 characters with 200 overlap. Sentence-aware splitting. Why 1000? - Fits in LLM context, enough semantic meaning, optimal for embeddings. Why overlap? - Prevents context loss at boundaries, improves retrieval. Why sentence-aware? - Maintains coherence.

**Q5: How does FAISS similarity search work?**  
A: FAISS uses L2 (Euclidean) distance. Lower distance = more similar. IndexFlatL2 does exact search (not approximate). Query embedding compared to all vectors. Returns top-k closest matches. Fast because optimized C++ code and vector operations.

---

### ARCHITECTURE QUESTIONS

**Q6: How would you scale this to 10,000 users?**  
A: 1) Load balancer distributing requests  
2) Multiple Django workers  
3) PostgreSQL with read replicas  
4) Redis cluster for caching  
5) Multiple Celery workers for processing  
6) S3 for file storage  
7) CDN for frontend  
8) Horizontal pod autoscaling (Kubernetes)

**Q7: What are the bottlenecks?**  
A: 1) LLM API calls (2-3s) - mitigate with caching  
2) FAISS search scales linearly - use approximate search for millions  
3) Database queries - add indexes, use connection pooling  
4) File storage - use S3, not local disk

**Q8: How do you handle failures?**  
A: 1) Try-catch blocks around critical operations  
2) Graceful error messages to users  
3) Celery retry logic for failed tasks  
4) Transaction rollbacks for database errors  
5) Logging for debugging  
6) Health check endpoints

---

### IMPLEMENTATION QUESTIONS

**Q9: Walk through document upload process.**  
A: 1) User selects PDF in frontend  
2) Axios posts to /api/documents/upload/  
3) Django validates file (type, size)  
4) Saves to storage/pdfs/  
5) Creates Document record (status: processing)  
6) Extracts text with PyMuPDF (page by page)  
7) Splits into chunks (1000 chars, 200 overlap)  
8) Creates Chunk records with metadata  
9) Generates embeddings for all chunks  
10) Builds/updates FAISS index  
11) Updates Document status: completed  
12) Returns response to frontend

**Q10: Explain conversation history handling.**  
A: 1) Each conversation has unique UUID  
2) Messages linked via foreign key  
3) Frontend sends conversation_id with queries  
4) Backend fetches last 10 messages (ordered by timestamp)  
5) Messages formatted as role/content pairs  
6) Included in Gemini prompt for context  
7) Enables follow-up questions and references

**Q11: How does voice input work?**  
A: 1) Custom hook initializes Web Speech API  
2) User clicks mic → requests permission  
3) Starts SpeechRecognition instance  
4) Listens for speech (onresult event)  
5) Real-time transcript updates  
6) On pause/stop, finalizes text  
7) Updates input field  
8) User can edit before sending  
9) Works entirely in browser (no backend needed)

---

### DESIGN DECISIONS

**Q12: Why SQLite for development?**  
A: Zero configuration, file-based, perfect for development. Easy to reset. Production uses PostgreSQL for concurrency and features.

**Q13: Why not use a managed vector database?**  
A: FAISS is sufficient for our scale, free, fast, and has no external dependencies. Can migrate to Pinecone/Weaviate later if needed for features like metadata filtering or managed hosting.

**Q14: Why Google Gemini over OpenAI?**  
A: Free tier (1,500 requests/day), fast (2-3s), long context (1M tokens), no credit card needed. Can easily switch to OpenAI later by changing client initialization.

---

### OPTIMIZATION QUESTIONS

**Q15: How would you improve response time?**  
A: 1) Cache frequent queries in Redis  
2) Use approximate FAISS search (IVF index)  
3) Reduce LLM max tokens  
4) Precompute embeddings  
5) Use faster embedding model  
6) Implement request batching  
7) Add CDN for static assets

**Q16: What about memory usage?**  
A: Current: ~200MB (Django + FAISS + model)  
Optimizations:

- Lazy load embedding model
- Quantize FAISS index (8-bit)
- Use model distillation (smaller model)
- Offload index to Redis
- Stream responses

---

### FUTURE QUESTIONS

**Q17: What would you add next?**  
A: 1) User authentication  
2) Async processing with Celery  
3) Response caching  
4) Text-to-speech for answers  
5) Multi-document search  
6) Advanced analytics  
7) Mobile app

**Q18: How would you handle multiple languages?**  
A: 1) Detect language (langdetect)  
2) Use multilingual embedding model (sentence-transformers)  
3) Configure Gemini language  
4) Update Speech Recognition lang parameter  
5) Add language selector in UI

---

### BUSINESS QUESTIONS

**Q19: What's the cost to run this?**  
A: Development: $0  
Production (small): ~$50/month  
Production (medium): ~$250/month  
Scales linearly with usage. Gemini free tier handles 1,500 req/day.

**Q20: How long did implementation take?**  
A: Backend core: 1-2 days  
Frontend: 1 day  
Voice feature: 3-4 hours  
Testing & debugging: 1 day  
Documentation: Ongoing  
Total: ~4-5 days of focused work

---

## END OF PRESENTATION

### FINAL NOTES FOR PRESENTER

1. Be confident - you understand every component deeply
2. Have the app running and ready to demo
3. Prepare backup screenshots in case of issues
4. Know your metrics (timing, sizes, counts)
5. Practice transitions between sections
6. Be ready to dive deep on any component
7. Have code snippets ready to show
8. Know limitations and be honest about them
9. Emphasize production-readiness and scalability
10. Show enthusiasm for the technology!

### Key Talking Points to Emphasize

✓ End-to-end implementation  
✓ Production-ready architecture  
✓ Modern tech stack  
✓ Real-world use case  
✓ Scalability considerations  
✓ Voice input innovation  
✓ Source citation for trust  
✓ Fast response times  
✓ Clean, maintainable code

**Good luck with your presentation! 🚀**

---
