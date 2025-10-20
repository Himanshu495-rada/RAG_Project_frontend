# Voice Input Feature Documentation

## Overview

Voice input functionality has been added to the chat interface, allowing users to ask questions using their microphone instead of typing. The feature uses the **Web Speech API** (built into modern browsers) for speech-to-text conversion.

## Features

✅ **Voice Recognition**: Converts speech to text in real-time  
✅ **Microphone Permission**: Automatically requests and checks microphone permissions  
✅ **Visual Feedback**: Recording state with pulsing animation  
✅ **Error Handling**: User-friendly error messages for common issues  
✅ **Browser Support Detection**: Automatically detects if browser supports speech recognition  
✅ **Seamless Integration**: Works alongside traditional text input

## Files Added/Modified

### New Files:

1. **`src/hooks/useVoiceRecording.js`**
   - Custom React hook for voice recording
   - Manages Web Speech API lifecycle
   - Handles microphone permissions
   - Provides real-time transcript updates
   - Error handling for various scenarios

### Modified Files:

1. **`src/components/ChatInterface.jsx`**

   - Added microphone button next to send button
   - Integrated voice recording hook
   - Shows "Listening..." placeholder when recording
   - Updates input field with recognized speech
   - Dynamic hints based on recording state

2. **`src/components/ChatInterface.css`**
   - Styles for microphone button
   - Recording state animation (pulsing red)
   - Hover effects and disabled states
   - Responsive design considerations

## How It Works

### 1. User Flow

```
User clicks Mic button
    ↓
Browser requests microphone permission
    ↓
User grants permission
    ↓
Recording starts (button turns red with pulse animation)
    ↓
User speaks
    ↓
Speech is converted to text in real-time
    ↓
Text appears in input field
    ↓
User clicks Mic button again (or speaks ends)
    ↓
Recording stops, text ready to send
```

### 2. Technical Implementation

**Speech Recognition Setup:**

```javascript
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false; // Stop after one phrase
recognition.interimResults = true; // Show results while speaking
recognition.lang = "en-US"; // English language
```

**Permission Handling:**

```javascript
await navigator.mediaDevices.getUserMedia({ audio: true });
```

**Transcript Processing:**

```javascript
recognition.onresult = (event) => {
  // Process both interim and final results
  // Update UI with transcript
};
```

## Browser Support

| Browser | Supported | Notes                                       |
| ------- | --------- | ------------------------------------------- |
| Chrome  | ✅ Yes    | Full support with `webkitSpeechRecognition` |
| Edge    | ✅ Yes    | Full support with `webkitSpeechRecognition` |
| Safari  | ✅ Yes    | iOS 14.5+ and macOS 11+                     |
| Firefox | ❌ No     | Web Speech API not yet supported            |
| Opera   | ✅ Yes    | Based on Chromium                           |

**Note**: The microphone button only appears if the browser supports speech recognition.

## Usage Instructions for Users

### Basic Usage:

1. **Upload a PDF document** (if not already uploaded)
2. **Click the microphone button** (🎤) next to the send button
3. **Allow microphone access** when browser prompts
4. **Speak your question** clearly
5. **Click the microphone button again** to stop recording
6. **Review the text** in the input field
7. **Click send** to submit your question

### Tips for Best Results:

- 🎤 **Speak clearly** and at a normal pace
- 🔇 **Minimize background noise** for better accuracy
- 🗣️ **Wait a moment** after clicking mic before speaking
- ✏️ **Edit the text** if needed before sending
- 🔄 **Try again** if recognition fails

## Error Handling

The feature handles various error scenarios:

| Error           | Cause                          | User Message                                                     |
| --------------- | ------------------------------ | ---------------------------------------------------------------- |
| `no-speech`     | No voice detected              | "No speech detected. Please try again."                          |
| `audio-capture` | No microphone found            | "Microphone not found. Please check your device."                |
| `not-allowed`   | Permission denied              | "Microphone access denied. Please allow microphone permissions." |
| `network`       | Network issue                  | "Network error. Please check your connection."                   |
| `aborted`       | Recording stopped unexpectedly | "Recording was aborted."                                         |

## Visual States

### 1. Normal State (Not Recording)

- Gray background
- Gray microphone icon
- Hover: Light gray with purple border

### 2. Recording State

- Red gradient background
- White stop square icon
- Pulsing animation
- Input placeholder: "Listening..."

### 3. Disabled State

- Light gray background
- Muted colors
- No hover effect
- Cursor: not-allowed

## Code Examples

### Using the Voice Hook:

```jsx
import useVoiceRecording from "../hooks/useVoiceRecording";

function MyComponent() {
  const {
    isRecording, // Boolean: currently recording
    transcript, // String: recognized text
    error, // String: error message if any
    isSupported, // Boolean: browser supports feature
    startRecording, // Function: start voice input
    stopRecording, // Function: stop voice input
    resetTranscript, // Function: clear transcript
  } = useVoiceRecording();

  // Use in your component
}
```

### Handling Transcript:

```jsx
useEffect(() => {
  if (transcript) {
    setInputValue(transcript); // Update input with recognized text
  }
}, [transcript]);
```

## Customization

### Change Language:

Edit `src/hooks/useVoiceRecording.js`:

```javascript
recognition.lang = "es-ES"; // Spanish
recognition.lang = "fr-FR"; // French
recognition.lang = "de-DE"; // German
```

### Change Recording Mode:

```javascript
// Continuous recording (doesn't auto-stop)
recognition.continuous = true;

// Only final results (no interim updates)
recognition.interimResults = false;
```

### Customize Styles:

Edit `src/components/ChatInterface.css`:

```css
.mic-button.recording {
  background: your-color;
  /* Custom animation */
}
```

## Troubleshooting

### Microphone button not appearing?

- Check if using supported browser (Chrome, Edge, Safari)
- Try HTTPS (some browsers require secure context)

### Permission denied?

- Check browser settings → Privacy → Microphone
- Ensure no other app is using the microphone
- Try refreshing the page

### Poor recognition accuracy?

- Check microphone quality
- Reduce background noise
- Speak more clearly and slowly
- Check microphone input levels in system settings

### Network error?

- Speech recognition may use online services
- Check internet connection
- Try again after a moment

## Security & Privacy

- ✅ **Permission-based**: Requires explicit user permission
- ✅ **No storage**: Audio is not stored or recorded
- ✅ **On-demand**: Only active when user clicks mic button
- ✅ **Transparent**: Clear visual feedback when recording
- ⚠️ **Online processing**: Speech recognition may use cloud services (browser-dependent)

## Future Enhancements

Possible improvements:

- [ ] Language selection dropdown
- [ ] Confidence score display
- [ ] Audio waveform visualization
- [ ] Support for continuous dictation
- [ ] Offline speech recognition (if browser supports)
- [ ] Voice commands (e.g., "send", "clear")
- [ ] Multi-language detection

## Dependencies

**None!** 🎉

This feature uses only native browser APIs:

- Web Speech API (`SpeechRecognition`)
- Media Devices API (`getUserMedia`)

No external libraries or API keys needed.

## Testing

### Manual Testing Checklist:

- [ ] Mic button appears in supported browsers
- [ ] Mic button hidden in unsupported browsers
- [ ] Permission prompt appears on first click
- [ ] Recording starts after permission granted
- [ ] Red pulsing animation shows when recording
- [ ] Transcript appears in input field
- [ ] Recording stops on second click
- [ ] Error messages display correctly
- [ ] Works with document upload flow
- [ ] Button disables when no document uploaded
- [ ] Button disables during AI response loading

## Support

For issues or questions:

1. Check browser console for errors
2. Verify microphone permissions in browser settings
3. Test microphone in other applications
4. Try a different browser if unsupported

---

**Status**: ✅ Feature complete and ready to use!

**Last Updated**: October 20, 2025
