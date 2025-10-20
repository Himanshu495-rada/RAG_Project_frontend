import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { chatAPI, handleAPIError } from "../services/api";
import useVoiceRecording from "../hooks/useVoiceRecording";
import "./ChatInterface.css";

const ChatInterface = ({
  currentDocument,
  conversationId,
  setConversationId,
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Voice recording hook
  const {
    isRecording,
    transcript,
    error: voiceError,
    isSupported: isVoiceSupported,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useVoiceRecording();

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update input value when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Show voice error as general error
  useEffect(() => {
    if (voiceError) {
      setError(voiceError);
    }
  }, [voiceError]);

  // Load existing conversation messages if conversationId exists
  useEffect(() => {
    const loadMessages = async () => {
      if (conversationId) {
        try {
          const response = await chatAPI.getConversationMessages(
            conversationId
          );
          if (response.data && response.data.results) {
            setMessages(response.data.results);
          }
        } catch (err) {
          console.error("Error loading messages:", err);
        }
      }
    };
    loadMessages();
  }, [conversationId]);

  const handleSendMessage = async () => {
    const question = inputValue.trim();

    if (!question) {
      return;
    }

    if (!currentDocument) {
      setError("Please upload a document first to ask questions");
      return;
    }

    // Add user message to UI
    const userMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);
    setError(null);

    try {
      // Send question to backend
      const documentFilter = currentDocument ? [currentDocument.id] : [];
      const response = await chatAPI.askQuestion(
        question,
        conversationId,
        documentFilter,
        5
      );

      if (response.data) {
        // Update conversation ID if it was created
        if (response.data.conversation_id && !conversationId) {
          setConversationId(response.data.conversation_id);
        }

        // Add assistant message to UI
        const assistantMessage = {
          id: response.data.metadata?.message_id || `msg-${Date.now()}`,
          role: "assistant",
          content: response.data.answer,
          timestamp: new Date().toISOString(),
          sources: response.data.sources || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);

      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Error: ${errorInfo.message}`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      setConversationId(null);
      setError(null);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      resetTranscript();
      startRecording();
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h2>Chat with Document</h2>
        </div>
        {messages.length > 0 && (
          <button
            className="clear-chat-btn"
            onClick={handleClearChat}
            title="Clear chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </button>
        )}
      </div>

      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3>Start a conversation</h3>
            <p>
              {currentDocument
                ? "Ask questions about your document to get started"
                : "Upload a document first to begin chatting"}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isUser={message.role === "user"}
          />
        ))}

        {loading && (
          <div className="loading-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              currentDocument
                ? isRecording
                  ? "Listening..."
                  : "Ask a question about the document..."
                : "Upload a document first..."
            }
            disabled={loading || !currentDocument || isRecording}
            rows="1"
          />

          {/* Microphone Button */}
          {isVoiceSupported && (
            <button
              className={`mic-button ${isRecording ? "recording" : ""}`}
              onClick={handleMicClick}
              disabled={loading || !currentDocument}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? (
                // Stop icon when recording
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                // Microphone icon when not recording
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              )}
            </button>
          )}

          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim() || !currentDocument}
            title="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div className="input-hint">
          {isRecording
            ? "🎤 Recording... Click mic to stop"
            : isVoiceSupported
            ? "Press Enter to send, Shift + Enter for new line, or click mic for voice input"
            : "Press Enter to send, Shift + Enter for new line"}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
