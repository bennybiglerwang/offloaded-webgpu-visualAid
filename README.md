# OffloadedWebGPU - Visual Assistance System

**AI-powered visual assistance for the visually impaired using WebRTC video streaming and WebGPU-accelerated AI inference.**

## Overview

Stream phone camera video to a GPU-enabled device for real-time AI scene descriptions, delivered back via text-to-speech. Privacy-first with local processing and offline capability.

**Key Innovation:** Offloads AI inference from mobile devices to nearby computers with GPUs, enabling high-quality visual assistance without cloud dependency.

---

## Quick Start

### Prerequisites
- Node.js 14+
- Chrome 113+ or Edge 113+ (WebGPU support)
- WiFi network (both devices on same network)

### Installation

```bash
# Clone and install
git clone https://github.com/bennybiglerwang/offloaded-webgpu-visualAid.git
cd OffloadedWebGPU
npm install

# Generate HTTPS certificate (required for camera access)
./generate-cert.sh

# Start server
node signaling-server-secure.js
```

### Usage

**Laptop (Receiver):**
1. Open `https://localhost:8080/receiver.html`
2. Click "Connect to Server"
3. Wait for AI model to load (~3-5 min first time)

**Phone (Sender):**
1. Find laptop IP: `ifconfig | grep inet` or `ipconfig`
2. Open `https://<LAPTOP_IP>:8080/sender.html`
3. Click "Start Camera" → Grant permission
4. Click "Connect to Server"
5. Point camera → Hear AI descriptions!

---

## Features

**Real-Time AI Processing**
- FastVLM-0.5B-ONNX model with WebGPU acceleration
- Scene descriptions every 3 seconds
- 2-3 second inference latency

**Accessibility**
- Text-to-speech with adjustable parameters
- High contrast mode
- Large text mode
- Screen wake lock
- Haptic feedback
- Persistent preferences

**Privacy & Offline**
- All AI processing local (no cloud)
- Works on local network only
- Model cached in browser

---

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Comprehensive guide (setup, architecture, troubleshooting)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical deep dive
- **[TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)** - QA procedures
- **[HTTPS-CAMERA-SETUP.md](HTTPS-CAMERA-SETUP.md)** - Camera troubleshooting

---

## Common Issues

### Camera Not Working
- Use HTTPS (not HTTP): `https://<LAPTOP_IP>:8080/sender.html`
- Accept browser security warning
- Grant camera permission

### WebGPU Not Available
- Update to Chrome 113+ or Edge 113+
- Enable at `chrome://flags/#enable-unsafe-webgpu`
- Falls back to WASM (slower but functional)

### Connection Failed
- Verify same WiFi network
- Check signaling server is running
- Allow port 8080 through firewall

**See [CLAUDE.md](CLAUDE.md#troubleshooting) for detailed troubleshooting.**

---

## Project Status

- ✅ Phase 1: Bidirectional Data Channels
- ✅ Phase 2: WebGPU + FastVLM Integration
- ✅ Phase 3: Accessibility Features
- 🚧 Phase 4: Offline/PWA (Planned)
- 🚧 Phase 5: Performance Optimization (Planned)

---

## Technology Stack

**Frontend:** Vanilla JavaScript, WebRTC, WebGPU, Transformers.js
**Backend:** Node.js, Express, WebSocket
**AI Model:** FastVLM-0.5B-ONNX (120-160MB quantized)
**Network:** TURN/STUN servers for NAT traversal

---

## Contributing

Contributions welcome for:
- Offline/PWA implementation
- Performance optimization
- Cross-platform testing
- Accessibility improvements

---

## Support

- **Issues:** [GitHub Issues](https://github.com/bennybiglerwang/offloaded-webgpu-visualAid/issues)
- **Repository:** [offloaded-webgpu-visualAid](https://github.com/bennybiglerwang/offloaded-webgpu-visualAid)

---

**Last Updated:** December 2025 | **Version:** Phase 3 Complete