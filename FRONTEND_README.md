# RAG Chatbot Frontend

A modern React-based frontend for the RAG (Retrieval-Augmented Generation) chatbot application.

## Features

✨ **Document Upload**

- Upload PDF documents with drag-and-drop support
- Real-time upload progress tracking
- File size and type validation (PDF only, max 50MB)
- Document status monitoring

💬 **Chat Interface**

- Real-time chat with AI assistant
- Context-aware responses based on uploaded documents
- Message history with scrollable interface
- Source citations with page references
- Clear chat history option

🎨 **Modern UI/UX**

- Beautiful gradient design
- Responsive layout for all devices
- Smooth animations and transitions
- Loading states and error handling
- Empty states with helpful guidance

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for API calls
- **CSS3** - Modern styling with animations

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx         # Document upload component
│   │   ├── FileUpload.css
│   │   ├── ChatInterface.jsx      # Main chat component
│   │   ├── ChatInterface.css
│   │   ├── ChatMessage.jsx        # Individual message component
│   │   └── ChatMessage.css
│   ├── services/
│   │   └── api.js                 # API integration layer
│   ├── App.jsx                    # Main application component
│   ├── App.css                    # Application styles
│   ├── main.jsx                   # Application entry point
│   └── index.css                  # Global styles
├── public/                        # Static assets
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8000`

### Installation

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### 1. Upload a Document

1. Click on the file upload area or drag and drop a PDF file
2. Select a PDF document (max 50MB)
3. Click "Upload Document" button
4. Wait for the upload to complete
5. The document will appear at the top of the page

### 2. Ask Questions

1. Once a document is uploaded, the chat interface becomes active
2. Type your question in the input field at the bottom
3. Press Enter or click the send button
4. The AI will analyze the document and provide an answer
5. Source citations will be shown with page numbers

### 3. View Chat History

- All messages are displayed in chronological order
- Scroll through the conversation history
- User messages appear on the right (purple)
- AI responses appear on the left (gray) with sources

### 4. Remove Document

1. Click the trash icon next to the uploaded document
2. Confirm the deletion
3. The document and chat history will be cleared

### 5. Clear Chat History

1. Click the refresh icon in the chat header
2. Confirm to clear all messages
3. The conversation will be reset

## API Integration

The frontend connects to the Django backend API. All API endpoints are defined in `src/services/api.js`:

### Document APIs

- `POST /api/documents/upload/` - Upload PDF
- `GET /api/documents/` - List documents
- `GET /api/documents/{id}/` - Get document details
- `DELETE /api/documents/{id}/` - Delete document

### Chat APIs

- `POST /api/chat/conversations/` - Create conversation
- `POST /api/chat/query/` - Ask question
- `GET /api/chat/conversations/{id}/messages/` - Get messages

### Configuration

To change the backend URL, edit `src/services/api.js`:

```javascript
const API_BASE_URL = "http://localhost:8000/api";
```

## Features Breakdown

### FileUpload Component

- PDF file selection with validation
- Upload progress bar
- Current document display
- Delete document functionality
- Error handling and user feedback

### ChatInterface Component

- Message list with auto-scroll
- Input field with Enter key support
- Loading indicator during AI processing
- Empty state when no messages
- Clear chat functionality
- Conversation persistence

### ChatMessage Component

- User and assistant message styling
- Timestamp display
- Source citations with page numbers
- Relevance score display
- Responsive layout

## Styling

The application uses a modern gradient design with:

- Primary colors: Purple gradient (#667eea to #764ba2)
- Clean white cards with subtle shadows
- Smooth animations and transitions
- Responsive breakpoints for mobile devices

## Error Handling

The application handles various error scenarios:

- Invalid file types (non-PDF)
- File size exceeded (>50MB)
- Network errors
- Backend API errors
- No document uploaded

## Performance Optimizations

- Component-level code splitting
- Efficient re-renders with React hooks
- Smooth scrolling with CSS
- Optimized bundle size with Vite

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Backend Connection Issues

- Ensure the Django backend is running on port 8000
- Check CORS settings in backend
- Verify network connectivity

### Upload Fails

- Check file size (max 50MB)
- Ensure file is a valid PDF
- Check backend logs for errors

### Chat Not Working

- Ensure a document is uploaded first
- Check backend processing status
- Verify API endpoints are accessible

## Development

### Adding New Features

1. Create new component in `src/components/`
2. Add corresponding CSS file
3. Import and use in `App.jsx`
4. Update API service if needed

### Customizing Styles

- Global styles: `src/index.css`
- App layout: `src/App.css`
- Component styles: Individual CSS files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Support

For issues and questions:

- Check backend API documentation
- Review console logs for errors
- Ensure backend is properly configured
