import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Custom hook for voice recording using Web Speech API
 * Handles browser speech recognition with fallback support
 */
const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Check if browser supports Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      // Configure recognition
      recognitionRef.current.continuous = false; // Stop after one result
      recognitionRef.current.interimResults = true; // Get interim results
      recognitionRef.current.lang = "en-US"; // Set language

      // Handle results
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      // Handle errors
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        let errorMessage = "Voice recognition error";
        switch (event.error) {
          case "no-speech":
            errorMessage = "No speech detected. Please try again.";
            break;
          case "audio-capture":
            errorMessage = "Microphone not found. Please check your device.";
            break;
          case "not-allowed":
            errorMessage =
              "Microphone access denied. Please allow microphone permissions.";
            break;
          case "network":
            errorMessage =
              "Speech service unavailable. This feature requires an internet connection. You can still type your message below.";
            break;
          case "service-not-allowed":
            errorMessage =
              "Speech service is blocked. Please check your browser settings or firewall.";
            break;
          case "aborted":
            errorMessage = "Recording was stopped.";
            break;
          case "language-not-supported":
            errorMessage = "Language not supported.";
            break;
          default:
            errorMessage = `Voice input error: ${event.error}. You can type your message instead.`;
        }

        setError(errorMessage);
        setIsRecording(false);
      };

      // Handle end of recognition
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      // Handle start
      recognitionRef.current.onstart = () => {
        setError(null);
        setTranscript("");
      };
    } else {
      setIsSupported(false);
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari."
      );
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start recognition
      if (recognitionRef.current) {
        setTranscript("");
        setError(null);
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (err) {
      console.error("Microphone permission error:", err);
      setError(
        "Microphone access denied. Please allow microphone permissions in your browser settings."
      );
      setIsRecording(false);
    }
  }, [isSupported]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return {
    isRecording,
    transcript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    resetTranscript,
  };
};

export default useVoiceRecording;
