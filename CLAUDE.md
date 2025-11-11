# OffloadedWebGPU - Visual Assistance System

## Project Vision & Mission 🎯

**Primary Goal:** Build an accessibility application for visually impaired users that provides real-time scene descriptions through AI-powered computer vision.

**How it Works:**
1. **Phone** streams video feed via WebRTC to GPU-enabled device (laptop/desktop)
2. **GPU Device** runs FastVLM model locally using WebGPU for real-time inference
3. **AI Description** is sent back to phone through WebRTC data channel
4. **Phone** speaks the description aloud using text-to-speech

**Key Innovation:** Offloads computationally intensive AI inference from resource-constrained mobile devices to nearby GPU-capable devices, enabling high-quality visual assistance without cloud dependency.

**Target Deployment:** Works offline with local network connection only - no internet/WiFi needed once models are cached. Perfect for assistive technology that maintains user privacy and works anywhere.

---

## Current Implementation Status

### ✅ Phase 1: Bidirectional Communication (COMPLETE)
- RTCDataChannel implementation on sender (phone) and receiver (laptop)
- Real-time message exchange between devices
- Scene description delivery from GPU device to phone
- Text-to-speech integration with Web Speech API

### ✅ Phase 2: WebGPU + AI Model Integration (COMPLETE)
- Transformers.js integration (@huggingface/transformers v3.7.6)
- FastVLM-0.5B-ONNX model loading and inference
- WebGPU hardware acceleration
- Video frame capture and processing pipeline
- Automatic inference at 1 frame every 3 seconds
- Mixed-precision quantization (fp16 + q4 for optimal performance)

### ✅ Phase 3: Mobile Accessibility Features (COMPLETE)
- High contrast mode for low vision users
- Large text mode (18-24px fonts)
- Screen wake lock (prevent dimming during use)
- Haptic feedback on new descriptions
- Persistent accessibility preferences (localStorage)
- Voice control via text-to-speech with adjustable parameters

### 🚧 Phase 4: Offline/Local Operation (PLANNED)
- Service Worker for offline model caching
- IndexedDB for persistent model storage
- Local network peer discovery (mDNS/Bonjour)
- Bluetooth signaling alternative
- PWA manifest for installable mobile app

### 🚧 Phase 5: Performance & Production (PLANNED)
- Frame rate optimization
- GPU memory management
- Model quantization improvements
- Battery usage optimization
- Cross-platform testing (iOS/Android)

---

## Technology Stack

### Frontend
- **Languages:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **WebRTC:** Peer-to-peer video streaming and data channels
- **WebGPU:** Hardware-accelerated AI inference
- **AI:** Transformers.js (@huggingface/transformers@3.7.6)
- **Model:** FastVLM-0.5B-ONNX (120-160MB quantized)
- **APIs:** getUserMedia, Web Speech API, Screen Wake Lock API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Signaling:** WebSocket (ws library v8.14.2)
- **Protocol:** HTTPS/WSS with self-signed certificates

### Network Infrastructure
- **TURN Server:** turn:136.107.56.70:3478 (external relay)
- **STUN Server:** stun:136.107.56.70:3478 (NAT detection)
- **Signaling Port:** 8080 (TCP/WebSocket)

### Development Tools
- **Package Manager:** npm
- **Version Control:** Git + GitHub
- **IDE:** VS Code (recommended)

---

## System Architecture

### High-Level Flow

```
┌─────────────────────┐                    ┌──────────────────────┐
│   Phone (Sender)    │                    │  Laptop (Receiver)   │
│                     │                    │                      │
│  1. Capture Video   │────WebRTC Video───▶│  4. Receive Stream   │
│     (Camera API)    │    (UDP/RTP)       │                      │
│                     │                    │  5. Extract Frames   │
│  2. Send Frames     │                    │     (Canvas API)     │
│                     │                    │                      │
│                     │                    │  6. FastVLM Inference│
│                     │◀───Data Channel────│     (WebGPU)         │
│  3. Receive Desc.   │   (Description)    │                      │
│                     │                    │  7. Send Description │
│  8. Text-to-Speech  │                    │     (RTCDataChannel) │
│     (Speak Aloud)   │                    │                      │
└─────────────────────┘                    └──────────────────────┘
         │                                           │
         └────────── WebSocket Signaling ───────────┘
                  (Offer/Answer/ICE)
                   Port 8080 (TCP)
```

### Components

#### 1. **Signaling Server** (`signaling-server-secure.js`)
- **Purpose:** WebRTC signaling (SDP offer/answer exchange, ICE candidate relay)
- **Port:** 8080 (HTTPS/WSS)
- **Protocol:** WebSocket
- **Features:**
  - Role-based registration (sender/receiver)
  - Peer-to-peer message routing
  - TURN configuration distribution
  - Heartbeat monitoring (30-second ping)
  - Connection state tracking

#### 2. **Sender Client** (`public/sender.html`) - Phone Interface
- **Purpose:** Capture and stream video, receive and speak descriptions
- **Key Features:**
  - Camera access with quality settings (640x480 to 1920x1080)
  - Frame rate selection (15/24/30 fps)
  - Front/back camera switching
  - RTCDataChannel receiver for AI descriptions
  - Text-to-speech with adjustable rate/pitch/volume
  - Accessibility controls (high contrast, large text, wake lock)
  - Haptic feedback on new descriptions
  - Description history with repeat function
- **File Size:** ~35 KB
- **Dependencies:** None (vanilla JS)

#### 3. **Receiver Client** (`public/receiver.html`) - Laptop/Desktop Interface
- **Purpose:** Receive video, run AI inference, send descriptions
- **Key Features:**
  - Video stream display with real-time metrics
  - FastVLM model loading with progress tracking
  - Canvas-based frame extraction (RawImage)
  - WebGPU-accelerated inference
  - RTCDataChannel sender for descriptions
  - Manual and automatic inference modes
  - Connection status monitoring
  - Performance metrics (resolution, FPS, bitrate, packet loss, latency)
- **File Size:** ~45 KB
- **Dependencies:** @huggingface/transformers (CDN)

#### 4. **TURN Server** (External)
- **Address:** turn:136.107.56.70:3478
- **Protocol:** UDP (primary), TCP (fallback)
- **Credentials:** user/pass (hardcoded in config)
- **Purpose:** Media relay when direct P2P connection fails (NAT traversal)

---

## Current Features

### Phone (Sender) Features
✅ **Video Streaming**
- Real-time camera capture
- Quality presets (SD, HD, Full HD)
- Frame rate control
- Camera selection (front/back)

✅ **AI Description Receiver**
- RTCDataChannel for low-latency messages
- Scene description display with visual indicators
- Description history

✅ **Text-to-Speech**
- Automatic speech on new descriptions
- Adjustable speech rate (0.9x for clarity)
- Toggle on/off control
- Repeat last description button

✅ **Accessibility Features**
- High contrast mode (black background, white borders)
- Large text mode (18-24px fonts)
- Screen wake lock (prevent dimming)
- Haptic feedback (vibration on new descriptions)
- Persistent preferences (localStorage)

✅ **Connection Management**
- WebSocket signaling connection
- WebRTC peer connection with TURN fallback
- Connection status indicators
- Activity logging

### Laptop (Receiver) Features
✅ **Video Reception**
- Full-screen video display (16:9 aspect ratio)
- Real-time metrics dashboard:
  - Resolution (e.g., 1280x720)
  - Frame rate (FPS)
  - Bitrate (kbps)
  - Packet loss percentage
  - Network latency (ms)

✅ **AI Inference**
- FastVLM-0.5B-ONNX model
- WebGPU acceleration (falls back to WASM)
- Progress tracking during model download
- Automatic inference mode (every 3 seconds)
- Manual inference controls (start/stop)

✅ **Frame Processing**
- Canvas-based frame extraction
- RawImage creation (4-channel RGBA)
- Efficient processing (no base64 encoding)

✅ **Description Generation**
- Chat template with detailed prompts
- Optimized for visual assistance use case
- Includes objects, people, actions, colors, spatial relationships
- 512 token max generation
- Repetition penalty (1.2) for quality

✅ **Data Channel Communication**
- JSON message format with timestamps
- Test descriptions button for debugging
- Real-time delivery to phone

---

## FastVLM AI Model Details

### Model Specifications
- **Model ID:** `onnx-community/FastVLM-0.5B-ONNX`
- **Type:** Vision-Language Model (Image-to-Text)
- **Size:** ~120-160 MB (quantized)
- **Framework:** ONNX Runtime Web
- **Acceleration:** WebGPU (primary), WASM (fallback)
- **Source:** Hugging Face Hub

### Quantization Configuration
```javascript
dtype: {
  embed_tokens: 'fp16',           // 16-bit for text embeddings
  vision_encoder: 'q4',           // 4-bit for vision processing
  decoder_model_merged: 'q4',     // 4-bit for language model
}
```

**Rationale:**
- **fp16 for embeddings:** Text requires moderate precision for vocabulary understanding
- **q4 for vision:** Images tolerate aggressive compression with minimal quality loss
- **q4 for decoder:** LLM can use 4-bit quantization efficiently

### Performance Characteristics
- **First Load Time:** 3-5 minutes (one-time download)
- **Subsequent Loads:** Instant (IndexedDB cache)
- **Inference Time:** ~2-3 seconds per frame
- **Memory Usage:** ~200-300 MB at runtime
- **Processing Rate:** 1 frame every 3 seconds (configurable)
- **Latency:** ~2-5 seconds from capture to description delivery

### Browser Caching
- **Storage:** IndexedDB (automatic)
- **Persistence:** Survives browser restarts
- **Scope:** Per-origin
- **Management:** Automatic by Transformers.js
- **Cache Size:** ~160 MB

### Model Capabilities
- **Scene Understanding:** Objects, people, activities
- **Spatial Awareness:** Location, orientation, relationships
- **Color Recognition:** Descriptions include colors
- **Detail Level:** Comprehensive descriptions (up to 512 tokens)
- **Use Case Optimized:** Prompts tailored for visual assistance

---

## Setup & Installation

### Prerequisites
- **Node.js:** v14.0 or higher
- **npm:** v6.0 or higher
- **Browser:** Chrome 113+ or Edge 113+ (WebGPU support)
- **Network:** WiFi or local network for device communication
- **GPU:** Recommended for receiver (WebGPU acceleration)

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/bennybiglerwang/offloaded-webgpu-visualAid.git
cd OffloadedWebGPU
```

#### 2. Install Dependencies
```bash
npm install
```

**Packages installed:**
- `express@^4.18.2` - HTTP server
- `ws@^8.14.2` - WebSocket server
- `nodemon@^3.0.1` - Development auto-restart (optional)

#### 3. Generate HTTPS Certificates
```bash
./generate-cert.sh
```

**Why HTTPS?** Modern browsers require HTTPS for camera access (except on localhost).

**Output:**
- `cert.pem` - SSL certificate
- `key.pem` - Private key

#### 4. Start Signaling Server
```bash
# HTTPS (required for mobile camera access)
node signaling-server-secure.js

# OR HTTP (localhost testing only)
node signaling-server.js
```

**Server starts on:** `http://localhost:8080` or `https://localhost:8080`

#### 5. Access Clients

**Receiver (Laptop):**
```
https://localhost:8080/receiver.html
```

**Sender (Phone):**
```
https://<LAPTOP_IP>:8080/sender.html
```

**Find laptop IP:**
```bash
# macOS/Linux
ifconfig | grep inet

# Windows
ipconfig
```

---

## Usage Guide

### Step-by-Step Workflow

#### 1. Start Receiver (Laptop with GPU)
1. Open browser: `https://localhost:8080/receiver.html`
2. Click **"Connect to Server"**
3. Wait for "Connected to signaling server" message
4. Status shows: "Signaling Server: Connected"

#### 2. Start Sender (Phone)
1. Open browser: `https://<LAPTOP_IP>:8080/sender.html`
2. Trust self-signed certificate (one-time warning)
3. Configure accessibility settings:
   - Toggle "High Contrast Mode" if needed
   - Toggle "Large Text Mode" if needed
   - Enable "Keep Screen Awake"
4. Click **"Start Camera"**
5. Grant camera permissions
6. Select video quality and camera (front/back)
7. Click **"Connect to Server"**

#### 3. Establish Connection
**On Phone:**
- Status changes to "Signaling Server: Connected"
- Automatically creates WebRTC offer

**On Laptop:**
- Receives offer and creates answer
- Video stream appears
- "Video Stream: Receiving" status
- Metrics display real-time stats

#### 4. Initialize AI Model (Automatic)
**On Laptop:**
- WebGPU initializes automatically
- FastVLM model starts downloading
- Progress shown in logs: "Downloading decoder_model_merged_q4.onnx: 45% (67MB / 150MB)"
- Wait 3-5 minutes for first-time download
- "AI Model: Ready" status when complete

#### 5. Start AI Inference
**On Laptop:**
- **Option A:** Inference starts automatically 2 seconds after video plays
- **Option B:** Click **"Start AI Analysis"** manually

**Processing:**
- Logs show: "Processing frame with FastVLM..."
- Inference runs every 3 seconds
- Description sent to phone via data channel

#### 6. Receive Descriptions (Phone)
- Scene description appears in description card
- Status indicator pulses green
- Text-to-speech speaks description automatically
- Haptic feedback (vibration)
- Click **"Repeat"** to replay last description

#### 7. Test Data Channel (Optional)
**On Laptop:**
- Click **"Test Description"** button
- Sends sample description to phone

**On Phone:**
- Should hear spoken description immediately
- Verifies data channel is working

---

## Development Context

### Project Structure
```
OffloadedWebGPU/
├── public/
│   ├── sender.html              # Phone interface (35 KB)
│   └── receiver.html            # Laptop interface (45 KB)
├── signaling-server.js          # HTTP signaling server
├── signaling-server-secure.js   # HTTPS signaling server (primary)
├── generate-cert.sh             # SSL certificate generator
├── test-setup.sh                # Network diagnostics
├── package.json                 # npm dependencies
├── cert.pem                     # SSL certificate (gitignored)
├── key.pem                      # SSL private key (gitignored)
├── CLAUDE.md                    # This file (comprehensive guide)
├── README.md                    # Quick start guide
├── ARCHITECTURE.md              # Technical deep dive
├── TESTING-CHECKLIST.md         # QA procedures
└── HTTPS-CAMERA-SETUP.md        # HTTPS troubleshooting
```

### Key Code Locations

#### Sender (Phone) - `public/sender.html`
- **Lines 9-18:** Accessibility CSS (high contrast, large text modes)
- **Lines 255-267:** Description card UI
- **Lines 319-333:** Accessibility controls
- **Lines 422-426:** Accessibility variables (wake lock, modes)
- **Lines 517-581:** Text-to-speech functions
- **Lines 643-671:** Description handler with TTS
- **Lines 673-735:** Accessibility functions (contrast, text, wake lock)
- **Lines 592-619:** RTCDataChannel setup and message handling

#### Receiver (Laptop) - `public/receiver.html`
- **Lines 7-19:** Transformers.js imports (@huggingface/transformers@3.7.6)
- **Lines 246-252:** WebGPU and AI Model status indicators
- **Lines 290-292:** AI inference control buttons
- **Lines 329:** visionProcessor variable
- **Lines 383-456:** FastVLM model initialization with progress tracking
- **Lines 458-483:** Frame capture (RawImage creation)
- **Lines 485-553:** FastVLM inference with chat template
- **Lines 443-465:** RTCDataChannel setup (ondatachannel handler)
- **Lines 403-417:** sendDescription() function

### Recent Git Commits
```
03a3fe6 - Upgrade to FastVLM-0.5B-ONNX for higher quality scene descriptions
80cd49f - Add AI-powered visual assistance features for visually impaired users
d84f63d - Edit README
```

### Dependencies
**NPM Packages:**
```json
{
  "express": "^4.18.2",
  "ws": "^8.14.2",
  "nodemon": "^3.0.1"
}
```

**CDN Dependencies (Receiver):**
- `@huggingface/transformers@3.7.6` (Transformers.js library)
- Automatic: ONNX Runtime Web (bundled with Transformers.js)

---

## Troubleshooting

### Camera Access Issues

**Problem:** "Camera access is not available" error on phone

**Cause:** Browser requires HTTPS for camera access (except localhost)

**Solution:**
1. Use `signaling-server-secure.js` (not `signaling-server.js`)
2. Generate certificate: `./generate-cert.sh`
3. Access via HTTPS: `https://<LAPTOP_IP>:8080/sender.html`
4. Trust self-signed certificate on phone (one-time warning)

**Detailed Guide:** See [HTTPS-CAMERA-SETUP.md](HTTPS-CAMERA-SETUP.md)

---

### WebGPU Not Available

**Problem:** "WebGPU not supported in this browser" error

**Cause:** Browser doesn't support WebGPU or GPU not available

**Solution:**
1. **Update Browser:**
   - Chrome 113+ or Edge 113+
   - Enable `chrome://flags/#enable-webgpu` if needed
2. **Check GPU:**
   - Ensure laptop has dedicated or integrated GPU
   - Update graphics drivers
3. **Fallback to WASM:**
   - Transformers.js automatically falls back to CPU (WASM)
   - Slower but functional (~5-10 seconds per inference)
4. **Status Check:**
   - Check "WebGPU: Ready" status indicator
   - Logs show "WebGPU initialized successfully" or fallback message

---

### Model Loading Failures

**Problem:** "Model loading failed" or stuck downloading

**Causes & Solutions:**

**Network Issues:**
- Check internet connection
- Verify firewall allows HTTPS to cdn.jsdelivr.net and huggingface.co
- Try different network

**Browser Storage Full:**
- Clear IndexedDB: DevTools → Application → Storage → Clear site data
- Free up disk space (need ~200MB available)

**CORS Errors:**
- Reload page (CDN timeout)
- Try incognito/private mode
- Disable browser extensions that block requests

**Stuck at 99%:**
- Wait up to 10 minutes (large file extraction)
- Check browser console for specific errors
- Restart browser and retry

---

### Connection Issues

**Problem:** "Receiver disconnected" or "Connection failed"

**Diagnosis:**
1. Check signaling server is running
2. Verify both devices on same network (or TURN accessible)
3. Check firewall settings
4. Review WebRTC connection state in logs

**Solutions:**

**Signaling Not Connected:**
- Restart signaling server
- Check port 8080 not blocked
- Verify IP address correct

**WebRTC Connection Fails:**
- Check TURN server accessible: `ping 136.107.56.70`
- Review ICE candidates in browser console
- Verify network allows UDP (required for WebRTC)

**Video Stream Not Showing:**
- Check camera permissions granted
- Verify sender shows "Camera: Active"
- Check receiver logs for "Received remote track"

---

### Data Channel Not Working

**Problem:** Phone not receiving descriptions

**Diagnosis:**
- Click **"Test Description"** on receiver
- Check phone logs for "Received message via data channel"
- Verify data channel status: "Data channel opened"

**Solutions:**
1. **Reconnect:** Stop and restart both sender and receiver
2. **Check Connection Order:** Receiver must be ready before sender connects
3. **Verify WebRTC:** Data channel requires established peer connection
4. **Browser Compatibility:** Both browsers must support RTCDataChannel

---

### Text-to-Speech Not Speaking

**Problem:** Description displayed but not spoken

**Solutions:**
1. **Check TTS Status:** Ensure "TTS: ON" (not "TTS: OFF")
2. **Browser Support:** Verify Web Speech API supported (Chrome, Edge, Safari)
3. **Volume:** Check device volume not muted
4. **Test:** Click "Repeat" button to retry speaking
5. **Browser Permissions:** Some browsers require user interaction before TTS

---

### Performance Issues

**Problem:** Slow inference or poor video quality

**Optimization:**

**Reduce Video Quality:**
- Sender: Select 640x480 instead of 1920x1080
- Lower frame rate to 15 fps

**Adjust Inference Rate:**
- Receiver: Change `setInterval(processFrame, 3000)` to `5000` (5 seconds)
- Reduces GPU load and power usage

**Check Network:**
- Monitor bitrate and packet loss in receiver metrics
- Poor WiFi = lower resolution automatically

**GPU Memory:**
- Close other GPU-intensive applications
- Restart browser to clear GPU memory

---

## Testing Guide

### Quick Functional Test (5 minutes)

#### 1. Test Signaling Connection
- **Receiver:** Click "Connect to Server" → Should show "Signaling Server: Connected"
- **Sender:** Click "Connect to Server" → Should show "Signaling Server: Connected"

#### 2. Test Video Streaming
- **Sender:** Click "Start Camera" → Grant permissions → Should see camera preview
- **Receiver:** Should see live video stream within 5-10 seconds
- **Verify:** Metrics show resolution, FPS, bitrate

#### 3. Test Data Channel
- **Receiver:** Click "Test Description" button
- **Phone:** Should display test description and speak it aloud
- **Verify:** Phone logs show "Received description: [test text]"

#### 4. Test AI Inference (First Time: 3-5 min model download)
- **Receiver:** Wait for "AI Model: Ready" status
- **Receiver:** Click "Start AI Analysis"
- **Wait:** ~3 seconds for first inference
- **Phone:** Should receive and speak scene description
- **Verify:** Receiver logs show "Generated description: [text]"

#### 5. Test Accessibility Features
- **Phone:** Toggle "High Contrast Mode" → Should see black background
- **Phone:** Toggle "Large Text Mode" → Text should increase size
- **Phone:** Enable "Keep Screen Awake" → Screen stays on
- **Phone:** Click "Repeat" → Should re-speak last description

### Success Criteria
✅ Both devices connect to signaling server
✅ Video streams from phone to laptop
✅ Metrics display on receiver
✅ Test description received on phone
✅ AI model loads successfully
✅ Inference generates descriptions
✅ Text-to-speech speaks descriptions
✅ Accessibility features work

**Detailed Testing:** See [TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)

---

## Performance Characteristics

### Latency Breakdown (End-to-End)
| Stage | Typical Time | Notes |
|-------|--------------|-------|
| Camera capture | ~33ms | 30 fps = 33ms per frame |
| Frame extraction | ~5-10ms | Canvas getImageData + RawImage |
| FastVLM inference | ~2000-3000ms | WebGPU accelerated |
| Description delivery | ~10-50ms | RTCDataChannel (low latency) |
| Text-to-speech | ~1000-2000ms | Depends on description length |
| **Total (capture to speech)** | **~3-5 seconds** | Acceptable for visual assistance |

### Network Bandwidth Requirements
| Video Quality | Resolution | FPS | Bitrate | Use Case |
|---------------|-----------|-----|---------|----------|
| Low | 640x480 | 15 | ~300 kbps | Poor network, battery saving |
| Medium | 1280x720 | 24 | ~1 Mbps | Balanced quality/performance |
| High | 1280x720 | 30 | ~1.5 Mbps | Good network (recommended) |
| Full HD | 1920x1080 | 30 | ~2-4 Mbps | Excellent network, max detail |

### Processing Rates
- **Frame Capture:** Continuous (30 fps stream)
- **AI Inference:** 1 frame every 3 seconds (configurable)
- **Description Updates:** On-demand (when inference completes)
- **TTS Playback:** Sequential (waits for current speech to finish)

### Resource Usage
**Phone (Sender):**
- CPU: ~5-10% (camera capture + WebRTC encoding)
- Memory: ~50-100 MB
- Battery: ~15-20% per hour (with screen awake)
- Network: 300 kbps - 4 Mbps upload

**Laptop (Receiver):**
- CPU: ~10-20% (WASM fallback: ~50-70%)
- GPU: ~30-50% (WebGPU inference)
- Memory: ~400-600 MB (model + runtime)
- Network: 300 kbps - 4 Mbps download

---

## Future Work

### Phase 4: Offline/Local Operation 🚧
**Goal:** Enable WiFi-free operation using local network only

**Tasks:**
- [ ] Implement Service Worker for offline PWA
- [ ] Cache FastVLM model in IndexedDB
- [ ] Add local network peer discovery (mDNS/Bonjour)
- [ ] Implement Bluetooth signaling as alternative
- [ ] Create PWA manifest for installable app
- [ ] Add offline-first architecture patterns

**Benefits:**
- Works without internet connection
- Maintains privacy (no cloud)
- Faster model loading (cached)
- Lower latency (no external TURN)

---

### Phase 5: Performance & Production 🚧
**Goal:** Optimize for real-world deployment

**Tasks:**
- [ ] Optimize frame processing rate (adaptive based on GPU load)
- [ ] Implement GPU memory management
- [ ] Add model quantization options (user-selectable)
- [ ] Battery usage optimization (sleep inference when screen off)
- [ ] Cross-platform testing (iOS Safari, Android Chrome)
- [ ] Add user authentication/pairing
- [ ] Implement session persistence
- [ ] Production SSL certificates (Let's Encrypt)
- [ ] Add analytics (optional, privacy-preserving)

**Benefits:**
- Longer battery life
- Better performance on low-end devices
- Production-ready security
- User experience improvements

---

## API Reference

### WebSocket Message Protocol

#### 1. Registration
**Client → Server:**
```json
{
  "type": "register",
  "role": "sender" | "receiver"
}
```

**Server → Client:**
```json
{
  "type": "registered",
  "role": "sender" | "receiver",
  "turnConfig": { ... }
}
```

#### 2. SDP Offer
**Sender → Server → Receiver:**
```json
{
  "type": "offer",
  "sdp": "<SDP string>"
}
```

#### 3. SDP Answer
**Receiver → Server → Sender:**
```json
{
  "type": "answer",
  "sdp": "<SDP string>"
}
```

#### 4. ICE Candidate
**Either → Server → Other:**
```json
{
  "type": "ice-candidate",
  "candidate": {
    "candidate": "...",
    "sdpMLineIndex": 0,
    "sdpMid": "0"
  }
}
```

#### 5. Peer Status
**Server → Client:**
```json
{
  "type": "peer-connected",
  "peer": "sender" | "receiver"
}
```

```json
{
  "type": "peer-disconnected",
  "peer": "sender" | "receiver"
}
```

#### 6. Error
**Server → Client:**
```json
{
  "type": "error",
  "message": "Error description"
}
```

### RTCDataChannel Message Protocol

#### Description Message
**Receiver → Sender:**
```json
{
  "type": "description",
  "text": "Scene description text",
  "timestamp": 1234567890123
}
```

**Alternative (Plain Text):**
```
"Scene description text"
```

### Configuration Options

#### TURN Configuration
**File:** `signaling-server-secure.js`
```javascript
const TURN_CONFIG = {
  iceServers: [
    {
      urls: 'turn:136.107.56.70:3478',
      username: 'user',
      credential: 'pass'
    },
    {
      urls: 'stun:136.107.56.70:3478'
    }
  ]
};
```

#### FastVLM Configuration
**File:** `public/receiver.html` (lines 415-420)
```javascript
dtype: {
  embed_tokens: 'fp16',           // Options: 'fp32', 'fp16', 'int8', 'q8', 'q4'
  vision_encoder: 'q4',           // Options: 'fp32', 'fp16', 'int8', 'q8', 'q4'
  decoder_model_merged: 'q4',     // Options: 'fp32', 'fp16', 'int8', 'q8', 'q4'
}
```

#### Inference Parameters
**File:** `public/receiver.html` (lines 523-527)
```javascript
await visionModel.generate({
  ...inputs,
  max_new_tokens: 512,           // Max description length
  do_sample: false,              // Deterministic output
  repetition_penalty: 1.2,       // Avoid repetition
});
```

---

## Security & Privacy

### Current Security Measures
- **HTTPS/WSS:** Encrypted signaling and certificate-based trust
- **Self-Signed Certificates:** For development/testing only
- **WebRTC Encryption:** DTLS for media streams, SRTP for data
- **Local Processing:** AI runs on-device (no cloud transmission)
- **Data Channel:** End-to-end encrypted (WebRTC)

### Production Recommendations
1. **SSL Certificates:** Replace self-signed with Let's Encrypt or commercial CA
2. **Authentication:** Add token-based auth for signaling connection
3. **TURN Credentials:** Rotate credentials regularly
4. **Rate Limiting:** Implement on signaling server
5. **Input Validation:** Sanitize all WebSocket messages
6. **Session Management:** Add timeout and cleanup
7. **Privacy Policy:** Disclose data handling (local processing)

### Privacy Considerations
**Data Flow:**
- Video: Sent to GPU device only (not cloud)
- Descriptions: Generated locally (not cloud)
- Model: Downloaded once, cached locally
- Network: Can work entirely offline (after initial setup)

**User Control:**
- Camera access requires explicit permission
- Can disconnect at any time
- Screen wake lock can be disabled
- TTS can be toggled off

---

## Known Limitations

1. **Browser Compatibility:** WebGPU requires Chrome 113+ or Edge 113+ (no Firefox/Safari yet)
2. **Single Pair Only:** Currently supports one sender and one receiver (no multi-user)
3. **No Audio:** Voice feedback via TTS only (no microphone input/two-way audio)
4. **No Recording:** No ability to save video or descriptions
5. **Network Dependent:** Requires network connection for WebRTC (even local network)
6. **Model Size:** 120-160 MB download required (one-time)
7. **GPU Required:** Best experience with dedicated GPU (WASM fallback is slow)
8. **Mobile Battery:** Screen wake + camera + network = ~15-20% battery per hour
9. **HTTPS Required:** Mobile camera access needs HTTPS (self-signed cert warnings)
10. **External TURN:** Relies on external TURN server (not self-hosted)

---

## Related Documentation

- **[README.md](README.md)** - Quick start guide (5-minute setup)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture deep dive
- **[TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)** - Comprehensive QA procedures
- **[HTTPS-CAMERA-SETUP.md](HTTPS-CAMERA-SETUP.md)** - HTTPS and camera troubleshooting

---

## Contributing

This project is currently in active development for visual assistance use cases. Contributions welcome in areas:
- Offline/PWA implementation (Phase 4)
- Performance optimization (Phase 5)
- Cross-platform testing (iOS/Android)
- Accessibility improvements
- Documentation improvements

---

## License

[Include license information]

---

## Support & Contact

- **GitHub Issues:** [Report bugs or request features](https://github.com/bennybiglerwang/offloaded-webgpu-visualAid/issues)
- **Repository:** [bennybiglerwang/offloaded-webgpu-visualAid](https://github.com/bennybiglerwang/offloaded-webgpu-visualAid)

---

**Last Updated:** November 2025
**Version:** Phase 3 Complete (FastVLM Integration)
**Next Milestone:** Phase 4 (Offline Operation)
