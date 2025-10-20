/\*\*

- Component Hierarchy and Data Flow
-
- This diagram shows how components are organized and how data flows through the app
  \*/

/\*
┌─────────────────────────────────────────────────────────────────┐
│ App.jsx │
│ │
│ State: │
│ - currentDocument (object | null) │
│ - conversationId (string | null) │
│ │
│ Functions: │
│ - handleUploadSuccess(document) │
│ - setConversationId(id) │
│ │
├─────────────────────────────────────────────────────────────────┤
│ │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ FileUpload Component │ │
│ │ │ │
│ │ Props: │ │
│ │ - onUploadSuccess: function │ │
│ │ - currentDocument: object │ │
│ │ │ │
│ │ Local State: │ │
│ │ - selectedFile: File │ │
│ │ - uploading: boolean │ │
│ │ - uploadProgress: number (0-100) │ │
│ │ - error: string │ │
│ │ │ │
│ │ Features: │ │
│ │ • File selection input │ │
│ │ • Upload button │ │
│ │ • Progress bar │ │
│ │ • Current document display │ │
│ │ • Delete button │ │
│ │ • Error messages │ │
│ │ │ │
│ │ API Calls: │ │
│ │ → documentAPI.uploadDocument(file, progress) │ │
│ │ → documentAPI.deleteDocument(id) │ │
│ └───────────────────────────────────────────────────────┘ │
│ ↓ │
│ onUploadSuccess(document) │
│ ↓ │
│ Updates currentDocument │
│ ↓ │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ ChatInterface Component │ │
│ │ │ │
│ │ Props: │ │
│ │ - currentDocument: object │ │
│ │ - conversationId: string │ │
│ │ - setConversationId: function │ │
│ │ │ │
│ │ Local State: │ │
│ │ - messages: array │ │
│ │ - inputValue: string │ │
│ │ - loading: boolean │ │
│ │ - error: string │ │
│ │ │ │
│ │ Features: │ │
│ │ • Message list container │ │
│ │ • Text input │ │
│ │ • Send button │ │
│ │ • Clear chat button │ │
│ │ • Loading indicator │ │
│ │ • Empty state │ │
│ │ • Auto-scroll │ │
│ │ │ │
│ │ API Calls: │ │
│ │ → chatAPI.askQuestion(question, convId, docs, topK) │ │
│ │ → chatAPI.getConversationMessages(convId) │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Messages Array (maps to multiple): │ │ │
│ │ │ │ │ │
│ │ │ ┌───────────────────────────────────┐ │ │ │
│ │ │ │ ChatMessage Component │ │ │ │
│ │ │ │ │ │ │ │
│ │ │ │ Props: │ │ │ │
│ │ │ │ - message: object │ │ │ │
│ │ │ │ - isUser: boolean │ │ │ │
│ │ │ │ │ │ │ │
│ │ │ │ Displays: │ │ │ │
│ │ │ │ • Avatar │ │ │ │
│ │ │ │ • Sender name │ │ │ │
│ │ │ │ • Timestamp │ │ │ │
│ │ │ │ • Message content │ │ │ │
│ │ │ │ • Sources (if AI message) │ │ │ │
│ │ │ │ - Page numbers │ │ │ │
│ │ │ │ - Text snippets │ │ │ │
│ │ │ │ - Relevance scores │ │ │ │
│ │ │ └───────────────────────────────────┘ │ │ │
│ │ │ │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

API Service Layer (src/services/api.js)
═══════════════════════════════════════

┌─────────────────────────────────────────────┐
│ documentAPI │
├─────────────────────────────────────────────┤
│ • uploadDocument(file, progress) │
│ • getAllDocuments(params) │
│ • getDocumentDetails(id) │
│ • getDocumentChunks(id) │
│ • deleteDocument(id) │
└─────────────────────────────────────────────┘
↓
Backend API
http://localhost:8000/api
↓
┌─────────────────────────────────────────────┐
│ chatAPI │
├─────────────────────────────────────────────┤
│ • createConversation(data) │
│ • askQuestion(q, convId, docs, topK) │
│ • getConversationMessages(convId) │
│ • getConversationDetails(convId) │
│ • deleteConversation(convId) │
└─────────────────────────────────────────────┘
↓
Backend API
http://localhost:8000/api
↓
┌─────────────────────────────────────────────┐
│ voiceAPI │
├─────────────────────────────────────────────┤
│ • textToSpeech(text, voice, speed) │
│ • speechToText(audioFile) │
│ • voiceChat(audio, convId, voice) │
└─────────────────────────────────────────────┘

Data Flow Example: Uploading and Asking a Question
═══════════════════════════════════════════════════

1. User selects PDF file
   └─> FileUpload: selectedFile state updated

2. User clicks "Upload Document"
   └─> FileUpload.handleUpload()
   └─> documentAPI.uploadDocument(file, progressCallback)
   └─> POST /api/documents/upload/
   └─> Response: { document: {...} }
   └─> FileUpload calls onUploadSuccess(document)
   └─> App: currentDocument state updated
   └─> ChatInterface enabled
   └─> FileUpload shows document info

3. User types question and presses Enter
   └─> ChatInterface.handleSendMessage()
   └─> Adds user message to messages state
   └─> chatAPI.askQuestion(question, conversationId, [docId], 5)
   └─> POST /api/chat/query/
   └─> Response: { answer, sources, conversation_id, metadata }
   └─> ChatInterface updates conversationId (if new)
   └─> ChatInterface adds assistant message to messages state
   └─> ChatMessage renders with message and sources
   └─> User sees response with page citations

4. More questions continue the conversation
   └─> Same conversationId used for context
   └─> Each question-answer pair added to messages
   └─> Sources shown for each AI response

Message Object Structure
════════════════════════

User Message:
{
id: "temp-123456789",
role: "user",
content: "What is this document about?",
timestamp: "2025-10-20T11:05:00Z",
sources: [],
audio_file_path: null,
metadata: {}
}

Assistant Message:
{
id: "msg-uuid-5678",
role: "assistant",
content: "This document discusses...",
timestamp: "2025-10-20T11:05:05Z",
sources: [
{
chunk_id: "chunk-uuid-1",
document_id: "doc-uuid-1",
page_number: 3,
text: "Machine learning is...",
relevance_score: 0.95
}
],
audio_file_path: null,
metadata: {
model: "gpt-3.5-turbo",
message_id: "msg-uuid-5678"
}
}

State Management Overview
═════════════════════════

App Level:
├─ currentDocument: object | null
│ └─ Updated when: Upload success, Delete success
│ └─ Used by: FileUpload (display), ChatInterface (queries)
│
└─ conversationId: string | null
└─ Updated when: First message sent, Delete document
└─ Used by: ChatInterface (maintain context)

FileUpload Level:
├─ selectedFile: File | null
├─ uploading: boolean
├─ uploadProgress: number (0-100)
└─ error: string | null

ChatInterface Level:
├─ messages: Message[]
├─ inputValue: string
├─ loading: boolean
└─ error: string | null

Component Lifecycle
═══════════════════

App:
useEffect → Monitor document processing status

ChatInterface:
useEffect → Scroll to bottom when messages change
useEffect → Load existing messages when conversationId changes

Event Handlers
═════════════

FileUpload:
• handleFileSelect(event)
• handleUpload()
• handleRemoveDocument()

ChatInterface:
• handleSendMessage()
• handleKeyPress(e)
• handleClearChat()

CSS Architecture
════════════════

index.css
└─ Global resets, typography, scrollbars

App.css
└─ Layout, header, footer, containers

FileUpload.css
└─ Upload UI, progress bar, document display

ChatInterface.css
└─ Chat layout, input, messages container

ChatMessage.css
└─ Individual message styling, sources

Responsive Breakpoints
═════════════════════

Desktop: > 768px (Full layout)
Mobile: ≤ 768px (Stacked, adjusted spacing)

Key Features Summary
═══════════════════

✅ File Upload
• Validation (PDF, 50MB max)
• Progress tracking
• Error handling
• Delete functionality

✅ Chat Interface
• Real-time messaging
• Context preservation
• Auto-scroll
• Loading states
• Empty states

✅ Source Citations
• Page numbers
• Text snippets
• Relevance scores

✅ User Experience
• Smooth animations
• Responsive design
• Error messages
• Confirmations
• Visual feedback
\*/
