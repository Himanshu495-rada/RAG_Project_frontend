# Voice Input Feature - Visual Guide

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  Chat Interface                                    [🔄] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [User Message]                                          │
│                                                          │
│         [Assistant Message with Sources]                 │
│                                                          │
│  [User Message]                                          │
│                                                          │
│         [Assistant Message]                              │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  [🎤] [📤]  │
│  │ Ask a question...                     │              │
│  └───────────────────────────────────────┘              │
│  Press Enter to send, or click mic for voice input      │
└─────────────────────────────────────────────────────────┘
```

## 🎤 Microphone Button States

### 1. Normal State (Ready to Record)

```
┌──────┐
│  🎤  │  Gray background
│      │  Microphone icon
└──────┘  Click to start recording
```

### 2. Recording State (Active)

```
┌──────┐
│  ⏹  │  Red gradient background
│ ◉◉◉ │  Stop icon + Pulsing glow
└──────┘  Click to stop recording
```

### 3. Disabled State

```
┌──────┐
│  🎤  │  Light gray background
│      │  Muted colors
└──────┘  Cannot interact
```

## 🔄 State Flow Diagram

```
                    ┌─────────────────────┐
                    │   Initial State     │
                    │  (Not Recording)    │
                    └──────────┬──────────┘
                               │
                               │ User clicks mic
                               ▼
                    ┌─────────────────────┐
                    │  Request Permission │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
          Permission Granted      Permission Denied
                    │                     │
                    ▼                     ▼
         ┌─────────────────────┐  ┌─────────────────┐
         │  Recording Started  │  │  Show Error     │
         │  (Button red)       │  │  Stay idle      │
         └──────────┬──────────┘  └─────────────────┘
                    │
                    │ User speaks
                    ▼
         ┌─────────────────────┐
         │  Speech Recognition │
         │  Processing...      │
         └──────────┬──────────┘
                    │
                    │ Real-time
                    ▼
         ┌─────────────────────┐
         │  Update Transcript  │
         │  in Input Field     │
         └──────────┬──────────┘
                    │
                    │ User clicks mic again
                    │ OR speech ends
                    ▼
         ┌─────────────────────┐
         │  Recording Stopped  │
         │  Text ready to send │
         └─────────────────────┘
```

## 📱 Component Architecture

```
┌────────────────────────────────────────────────┐
│         ChatInterface Component                │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │   useVoiceRecording() Hook               │ │
│  │                                          │ │
│  │   - isRecording                          │ │
│  │   - transcript                           │ │
│  │   - error                                │ │
│  │   - isSupported                          │ │
│  │   - startRecording()                     │ │
│  │   - stopRecording()                      │ │
│  │   - resetTranscript()                    │ │
│  └──────────────┬───────────────────────────┘ │
│                 │                             │
│                 ▼                             │
│  ┌──────────────────────────────────────────┐ │
│  │   State Management                       │ │
│  │   - Update input with transcript         │ │
│  │   - Show errors                          │ │
│  │   - Visual feedback                      │ │
│  └──────────────┬───────────────────────────┘ │
│                 │                             │
│                 ▼                             │
│  ┌──────────────────────────────────────────┐ │
│  │   Render                                 │ │
│  │   - Input field                          │ │
│  │   - Mic button (conditional)             │ │
│  │   - Send button                          │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

## 🔧 Hook Internal Flow

```
useVoiceRecording Hook
│
├── Initialize
│   ├── Check browser support
│   ├── Create SpeechRecognition instance
│   ├── Configure settings
│   └── Set up event listeners
│
├── Event Handlers
│   ├── onstart → Clear transcript, set recording
│   ├── onresult → Update transcript state
│   ├── onerror → Set error message
│   ├── onend → Stop recording
│   └── Cleanup on unmount
│
└── Return API
    ├── isRecording (state)
    ├── transcript (state)
    ├── error (state)
    ├── isSupported (state)
    ├── startRecording (function)
    ├── stopRecording (function)
    └── resetTranscript (function)
```

## 🎬 Animation Sequence

### Recording Animation (CSS)

```
@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(248, 81, 73, 0.7); }
       ↓
  50%  { box-shadow: 0 0 0 10px rgba(248, 81, 73, 0); }
       ↓
  100% { box-shadow: 0 0 0 0 rgba(248, 81, 73, 0.7); }
}

Loop: 1.5s infinite
```

**Visual Effect:**

```
Normal:  ●
         ▼
Step 1:  ◉ (small glow)
         ▼
Step 2:  ◎ (medium glow)
         ▼
Step 3:  ⊙ (large glow)
         ▼
Step 4:  ◎ (medium glow)
         ▼
Step 5:  ◉ (small glow)
         ▼
Repeat...
```

## 🔐 Permission Flow

```
User clicks mic button
    ↓
Check if permission already granted
    │
    ├─ YES → Start recording immediately
    │
    └─ NO → Show browser permission prompt
               ┌─────────────────────────────┐
               │  "localhost wants to use    │
               │  your microphone"           │
               │                             │
               │  [Block]  [Allow]           │
               └─────────────────────────────┘
                        │
          ┌─────────────┴──────────────┐
          │                            │
       [Allow]                      [Block]
          │                            │
          ▼                            ▼
    Start recording              Show error message
    Set isRecording=true         "Microphone access denied"
```

## 📊 Data Flow

```
User speaks → Microphone
                  ↓
        Browser Speech Recognition API
                  ↓
        Real-time processing
                  ↓
        onresult event fires
                  ↓
        Extract transcript text
                  ↓
        Update React state (transcript)
                  ↓
        useEffect watches transcript
                  ↓
        Update input field value
                  ↓
        User can edit or send
                  ↓
        Submit to backend API
```

## 🎯 User Journey Map

```
1. Upload PDF
   ↓
2. See chat interface
   ↓
3. Notice microphone button
   ↓
4. Click microphone
   ↓
5. Grant permission (first time)
   ↓
6. Button turns red (recording)
   ↓
7. Speak question
   ↓
8. See text appear in input
   ↓
9. Click mic to stop
   ↓
10. Review/edit text
   ↓
11. Click send
   ↓
12. Receive AI answer
```

## 🖼️ CSS Structure

```css
.chat-input-wrapper
  ├──
  .chat-input
  (textarea)
  ├──
  .mic-button
  │
  ├──
  Normal
  state
  (gray)
  │
  ├──
  Hover
  state
  (light gray + purple border)
  │
  ├──
  Recording
  state
  (red + animation)
  │
  └──
  Disabled
  state
  (muted)
  └──
  .send-button;
```

## 📐 Responsive Behavior

```
Desktop (>768px)
┌─────────────────────────────────────┐
│ [Input field──────────────] [🎤] [📤] │
└─────────────────────────────────────┘

Mobile (<768px)
┌──────────────────────────┐
│ [Input field─────] [🎤] │
│                    [📤] │
└──────────────────────────┘
```

## 🚦 Error States Visual

```
No Speech Detected:
┌────────────────────────────────────┐
│ ⚠️ No speech detected.             │
│    Please try again.               │
└────────────────────────────────────┘

Permission Denied:
┌────────────────────────────────────┐
│ 🚫 Microphone access denied.       │
│    Please allow microphone         │
│    permissions.                    │
└────────────────────────────────────┘

Network Error:
┌────────────────────────────────────┐
│ 🌐 Network error.                  │
│    Please check your connection.   │
└────────────────────────────────────┘
```

## 🔄 Integration with Chat Flow

```
Voice Input
    ↓
Set input field value
    ↓
User clicks send
    ↓
handleSendMessage()
    ↓
Add user message to UI
    ↓
Send to backend API
    ↓
Receive response
    ↓
Add assistant message to UI
    ↓
Ready for next input
```

## 🎨 Color Palette

```
Normal State:
- Background: #f8f9fa (light gray)
- Border: #e9ecef (medium gray)
- Icon: #495057 (dark gray)
- Hover: #667eea (purple)

Recording State:
- Background: Gradient #f85149 → #c9302c (red)
- Icon: #ffffff (white)
- Glow: rgba(248, 81, 73, 0.7) (red with opacity)

Disabled State:
- Background: #f8f9fa (light gray)
- Border: #dee2e6 (light gray)
- Icon: #adb5bd (muted gray)
- Opacity: 0.5
```

---

This visual guide helps understand the complete implementation of the voice input feature! 🎨🎤
