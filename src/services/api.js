import axios from "axios";

// Base URL for the backend API
const API_BASE_URL = "http://localhost:8000/api";

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Document Management APIs
export const documentAPI = {
  // Upload a PDF document
  uploadDocument: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    return await apiClient.post("/documents/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  },

  // Get all documents
  getAllDocuments: async (params = {}) => {
    return await apiClient.get("/documents/", { params });
  },

  // Get document details
  getDocumentDetails: async (documentId) => {
    return await apiClient.get(`/documents/${documentId}/`);
  },

  // Get document chunks
  getDocumentChunks: async (documentId) => {
    return await apiClient.get(`/documents/${documentId}/chunks/`);
  },

  // Delete document
  deleteDocument: async (documentId) => {
    return await apiClient.delete(`/documents/${documentId}/`);
  },
};

// Chat & RAG APIs
export const chatAPI = {
  // Create a new conversation
  createConversation: async (data = {}) => {
    return await apiClient.post("/chat/conversations/", data);
  },

  // Ask a question (RAG query)
  askQuestion: async (
    question,
    conversationId = null,
    documentFilter = [],
    topK = 5
  ) => {
    return await apiClient.post("/chat/query/", {
      question,
      conversation_id: conversationId,
      document_filter: documentFilter,
      top_k: topK,
    });
  },

  // Get conversation messages
  getConversationMessages: async (conversationId) => {
    return await apiClient.get(
      `/chat/conversations/${conversationId}/messages/`
    );
  },

  // Get conversation details
  getConversationDetails: async (conversationId) => {
    return await apiClient.get(`/chat/conversations/${conversationId}/`);
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    return await apiClient.delete(`/chat/conversations/${conversationId}/`);
  },
};

// Voice APIs
export const voiceAPI = {
  // Text-to-Speech
  textToSpeech: async (text, voice = "alloy", speed = 1.0) => {
    return await apiClient.post("/voice/text-to-speech/", {
      text,
      voice,
      speed,
    });
  },

  // Speech-to-Text
  speechToText: async (audioFile) => {
    const formData = new FormData();
    formData.append("audio_file", audioFile);

    return await apiClient.post("/voice/speech-to-text/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Voice chat (combined STT + RAG + TTS)
  voiceChat: async (audioFile, conversationId = null, voice = "alloy") => {
    const formData = new FormData();
    formData.append("audio_file", audioFile);
    if (conversationId) formData.append("conversation_id", conversationId);
    formData.append("voice", voice);

    return await apiClient.post("/voice/chat/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// FAISS Management APIs
export const faissAPI = {
  // Get FAISS index status
  getStatus: async () => {
    return await apiClient.get("/faiss/status/");
  },

  // Rebuild FAISS index
  rebuildIndex: async () => {
    return await apiClient.post("/faiss/rebuild/", { confirm: true });
  },
};

// Error handler helper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.detail || "An error occurred",
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message:
        "No response from server. Please check if the backend is running.",
      status: null,
      data: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || "An unexpected error occurred",
      status: null,
      data: null,
    };
  }
};

export default apiClient;
