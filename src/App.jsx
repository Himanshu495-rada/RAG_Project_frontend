import { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import ChatInterface from "./components/ChatInterface";
import "./App.css";

function App() {
  const [currentDocument, setCurrentDocument] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  // Check document processing status periodically
  useEffect(() => {
    if (currentDocument && currentDocument.processing_status === "pending") {
      // In a real app, you might want to poll the backend for status updates
      // For now, we'll just assume processing happens quickly
      console.log("Document uploaded, waiting for processing...");
    }
  }, [currentDocument]);

  const handleUploadSuccess = (document) => {
    setCurrentDocument(document);
    // Reset conversation when document changes
    if (document === null) {
      setConversationId(null);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <h1>RAG Chatbot</h1>
          </div>
          <p className="subtitle">
            Upload documents and ask questions using AI
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            currentDocument={currentDocument}
          />

          <ChatInterface
            currentDocument={currentDocument}
            conversationId={conversationId}
            setConversationId={setConversationId}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>Powered by Django RAG Backend • OpenAI GPT • FAISS Vector DB</p>
      </footer>
    </div>
  );
}

export default App;
