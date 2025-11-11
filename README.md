# OffloadedWebGPU - Visual Assistance System

**An AI-powered visual assistance application for the visually impaired, providing real-time scene descriptions through WebRTC video streaming and GPU-accelerated FastVLM inference.**

## 🎯 Project Mission

Stream phone camera video to GPU-enabled devices for real-time AI scene description, delivered back to the phone via text-to-speech. Designed for visually impaired users with privacy-first local processing and offline capability.

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 14+ and npm
- Modern browser with WebGPU (Chrome 113+ or Edge 113+)
- WiFi network (phone and laptop on same network)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/bennybiglerwang/offloaded-webgpu-visualAid.git
cd OffloadedWebGPU

# 2. Install dependencies
npm install

# 3. Generate HTTPS certificate (required for mobile camera access)
./generate-cert.sh

# 4. Start secure server
node signaling-server-secure.js
```

### Usage

**On Laptop (Receiver):**
1. Open: `https://localhost:8080/receiver.html`
2. Accept security warning (one-time)
3. Click "Connect to Server"
4. Wait for AI model to load (~3-5 min first time)

**On Phone (Sender):**
1. Find laptop IP: `ifconfig | grep inet` (Mac/Linux) or `ipconfig` (Windows)
2. Open: `https://<LAPTOP_IP>:8080/sender.html`
3. Accept security warning (one-time)
4. Configure accessibility settings if needed
5. Click "Start Camera" → Grant permission
6. Click "Connect to Server"
7. Point camera at objects/scenes → Hear AI descriptions! 🎉

---

## 📚 Complete Documentation

**For comprehensive information, see:**

- **[CLAUDE.md](CLAUDE.md)** - Complete project guide (setup, architecture, AI details, troubleshooting)
- **[HTTPS-CAMERA-SETUP.md](HTTPS-CAMERA-SETUP.md)** - Camera access and HTTPS troubleshooting
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture deep dive
- **[TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)** - Comprehensive testing procedures

---

## ✨ Key Features

**🎥 Real-Time Video Streaming**
- Phone to laptop video transmission via WebRTC
- Adaptive quality (SD, HD, Full HD)
- Low latency (~80-350ms)

**🤖 AI Scene Description**
- FastVLM-0.5B-ONNX model (120-160MB)
- WebGPU hardware acceleration
- Detailed scene understanding (objects, colors, spatial relationships)
- 1 description every 3 seconds

**♿ Accessibility Features**
- Text-to-speech output with adjustable parameters
- High contrast mode for low vision
- Large text mode (18-24px fonts)
- Screen wake lock (prevent dimming)
- Haptic feedback on new descriptions
- Persistent accessibility preferences

**🔒 Privacy & Offline**
- All AI processing runs locally on GPU device
- No cloud transmission of video or descriptions
- Works on local network only (no internet needed after model download)
- Model cached in browser (instant subsequent loads)

---

## 🏗️ Project Structure

```
OffloadedWebGPU/
├── public/
│   ├── sender.html              # Phone interface (camera + TTS)
│   └── receiver.html            # Laptop interface (AI inference)
├── signaling-server-secure.js   # HTTPS signaling server (primary)
├── signaling-server.js          # HTTP signaling server (local testing only)
├── generate-cert.sh             # SSL certificate generator
├── package.json                 # npm dependencies
├── CLAUDE.md                    # Comprehensive documentation ⭐
├── README.md                    # This file (quick start)
├── HTTPS-CAMERA-SETUP.md        # HTTPS troubleshooting
├── ARCHITECTURE.md              # Technical architecture
└── TESTING-CHECKLIST.md         # Testing procedures
```

---

## 🔧 Common Issues & Quick Fixes

### Camera Not Working on Phone
**Problem:** "Camera access is not available" error

**Solution:**
1. Ensure using HTTPS: `https://<LAPTOP_IP>:8080/sender.html` (not `http://`)
2. Accept browser security warning
3. Grant camera permission when prompted

**Details:** See [HTTPS-CAMERA-SETUP.md](HTTPS-CAMERA-SETUP.md)

---

### WebGPU Not Available
**Problem:** "WebGPU not supported" error

**Solution:**
1. Use Chrome 113+ or Edge 113+
2. Enable `chrome://flags/#enable-webgpu` if needed
3. Update graphics drivers
4. Falls back to WASM automatically (slower but functional)

---

### Model Download Slow/Stuck
**Problem:** Model loading takes too long or fails

**Solution:**
1. Wait up to 5 minutes on first load (downloading 120-160MB)
2. Check internet connection
3. Check browser console for specific errors
4. Clear IndexedDB and retry: DevTools → Application → Storage → Clear site data

---

### Connection Failed
**Problem:** Can't establish WebRTC connection

**Solution:**
1. Verify both devices on same WiFi network
2. Check signaling server is running
3. Allow port 8080 through firewall
4. Check logs in browser console and server terminal

**Details:** See [CLAUDE.md - Troubleshooting](CLAUDE.md#troubleshooting)

---

## 📊 Current Status

- **Phase 1:** ✅ Bidirectional Data Channels (Complete)
- **Phase 2:** ✅ WebGPU + FastVLM Integration (Complete)
- **Phase 3:** ✅ Accessibility Features (Complete)
- **Phase 4:** 🚧 Offline/PWA (Planned)
- **Phase 5:** 🚧 Performance Optimization (Planned)

---

## 🔐 Security Notes

**Development (Current):**
- Self-signed HTTPS certificates
- Hardcoded TURN credentials
- No authentication

**Production Recommendations:**
- Use Let's Encrypt or commercial SSL certificates
- Implement authentication tokens
- Rotate TURN credentials regularly
- Add rate limiting to signaling server
- Enable session management

See [CLAUDE.md - Security](CLAUDE.md#security--privacy) for details.

---

## 🤝 Contributing

Contributions welcome in:
- Offline/PWA implementation (Phase 4)
- Performance optimization (Phase 5)
- Cross-platform testing (iOS/Android)
- Accessibility improvements
- Documentation improvements

---

## 📝 License

[Include license information]

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/bennybiglerwang/offloaded-webgpu-visualAid/issues)
- **Repository:** [offloaded-webgpu-visualAid](https://github.com/bennybiglerwang/offloaded-webgpu-visualAid)
- **Documentation:** [CLAUDE.md](CLAUDE.md) - Start here for comprehensive info

---

**Built with:** WebRTC, WebGPU, Transformers.js, FastVLM, Node.js, Express

**Last Updated:** November 2025 | **Version:** Phase 3 Complete
