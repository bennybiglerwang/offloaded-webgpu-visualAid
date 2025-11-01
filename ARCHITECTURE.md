# WebRTC Video Streaming Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Video Streaming System                       │
│                                                                       │
│  ┌─────────────┐      ┌──────────────┐      ┌─────────────┐        │
│  │   Phone     │      │  Signaling   │      │   Laptop    │        │
│  │  (Sender)   │◄────►│   Server     │◄────►│ (Receiver)  │        │
│  │             │      │  (WebSocket) │      │             │        │
│  └─────────────┘      └──────────────┘      └─────────────┘        │
│         │                                           │                │
│         │                                           │                │
│         │         ┌──────────────┐                 │                │
│         └────────►│ TURN Server  │◄────────────────┘                │
│                   │ (UDP Relay)  │                                  │
│                   └──────────────┘                                  │
│                   136.107.56.70                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Connection Flow

### Phase 1: Signaling (WebSocket)

```
Phone                Signaling Server           Laptop
  │                         │                      │
  │─────Connect WS─────────►│                      │
  │                         │◄────Connect WS───────│
  │                         │                      │
  │──Register as Sender────►│                      │
  │                         │◄──Register as Recv───│
  │                         │                      │
  │                         │──Peer Connected─────►│
  │◄──Peer Connected────────│                      │
  │                         │                      │
  │───SDP Offer────────────►│                      │
  │                         │───Forward Offer─────►│
  │                         │                      │
  │                         │◄──SDP Answer─────────│
  │◄──Forward Answer────────│                      │
  │                         │                      │
  │───ICE Candidate────────►│                      │
  │                         │───Forward ICE───────►│
  │                         │                      │
  │◄──ICE Candidate─────────│◄──ICE Candidate──────│
  │                         │                      │
```

### Phase 2: WebRTC Connection (Direct or via TURN)

```
Option A: Direct P2P Connection (when possible)
┌────────┐                              ┌────────┐
│ Phone  │◄────Direct UDP/TCP──────────►│ Laptop │
└────────┘       Video Stream            └────────┘


Option B: TURN Relay (when NAT/Firewall blocks direct)
┌────────┐         ┌────────┐         ┌────────┐
│ Phone  │◄───────►│  TURN  │◄───────►│ Laptop │
└────────┘         │ Server │         └────────┘
              136.107.56.70
```

## Component Details

### 1. Signaling Server (Port 8080)
**Technology:** Node.js + WebSocket (ws library)
**Purpose:** Exchange setup messages between peers
**Responsibilities:**
- Maintain persistent WebSocket connections
- Register sender and receiver roles
- Forward SDP offers/answers
- Forward ICE candidates
- Track connection state
- Provide TURN configuration to clients

**Does NOT handle:**
- Video/audio data transmission
- Media processing
- Recording or storage

### 2. Phone (Sender)
**Interface:** sender.html (Mobile-optimized web page)
**Responsibilities:**
- Request camera access
- Capture video stream
- Create WebRTC peer connection
- Generate and send SDP offer
- Collect and send ICE candidates
- Transmit video stream

**Video Settings:**
- Resolution: 640x480, 1280x720, 1920x1080
- Frame Rate: 15, 24, 30 fps
- Camera: Front or Back

### 3. Laptop (Receiver)
**Interface:** receiver.html (Desktop web page)
**Responsibilities:**
- Listen for incoming connections
- Receive and display video stream
- Monitor connection metrics
- Display real-time statistics

**Metrics Displayed:**
- Resolution
- Frame rate
- Bitrate
- Packet loss
- Latency/jitter

### 4. TURN Server (Port 3478)
**Address:** 136.107.56.70:3478
**Protocol:** UDP (already tested and working)
**Purpose:** Relay media when direct P2P fails
**Credentials:**
- Username: user
- Password: pass

**Used when:**
- Symmetric NAT
- Restrictive firewalls
- Different networks
- Corporate networks

## Message Protocol

### WebSocket Messages

#### 1. Register
```json
{
  "type": "register",
  "role": "sender" | "receiver"
}
```

#### 2. Registered Response
```json
{
  "type": "registered",
  "role": "sender" | "receiver",
  "turnConfig": {
    "iceServers": [...]
  }
}
```

#### 3. Peer Connected
```json
{
  "type": "peer-connected",
  "peer": "sender" | "receiver"
}
```

#### 4. SDP Offer
```json
{
  "type": "offer",
  "sdp": "<SDP string>"
}
```

#### 5. SDP Answer
```json
{
  "type": "answer",
  "sdp": "<SDP string>"
}
```

#### 6. ICE Candidate
```json
{
  "type": "ice-candidate",
  "candidate": {
    "candidate": "<candidate string>",
    "sdpMid": "...",
    "sdpMLineIndex": 0
  }
}
```

#### 7. Error
```json
{
  "type": "error",
  "message": "Error description"
}
```

## Network Ports

| Service          | Port | Protocol | Purpose                |
|------------------|------|----------|------------------------|
| Signaling Server | 8080 | TCP/WS   | WebSocket signaling    |
| TURN Server      | 3478 | UDP      | Media relay            |
| TURN Server      | 3478 | TCP      | Fallback relay         |

## Security Considerations

### Current Implementation (Development)
- ✓ Basic message validation
- ✓ Role-based restrictions
- ✓ Connection state tracking
- ✓ Heartbeat mechanism

### Production Requirements
- ⚠ Add authentication tokens
- ⚠ Implement HTTPS/WSS
- ⚠ Rate limiting
- ⚠ Input sanitization
- ⚠ Secure TURN credentials
- ⚠ Session management
- ⚠ Access control

## Performance Characteristics

### Latency Components
1. **Camera capture:** ~33ms (at 30fps)
2. **Encoding:** ~10-50ms
3. **Network transmission:** ~10-200ms (depends on network)
4. **Decoding:** ~10-50ms
5. **Display:** ~16ms (at 60Hz display)

**Total estimated latency:** 80-350ms

### Bandwidth Requirements
| Quality | Resolution | FPS | Bitrate    |
|---------|-----------|-----|------------|
| Low     | 640x480   | 15  | ~300 kbps  |
| Medium  | 1280x720  | 24  | ~1 Mbps    |
| High    | 1280x720  | 30  | ~1.5 Mbps  |
| HD      | 1920x1080 | 30  | ~2-4 Mbps  |

## Scalability

### Current Limitations
- Single sender - single receiver
- No load balancing
- Single signaling server instance
- No persistent storage

### Future Enhancements
- Multiple receivers per sender
- Load balancing with multiple signaling servers
- Redis for session management
- Database for user management
- Recording and playback
- Adaptive bitrate streaming

## Troubleshooting Guide

### Issue: Connection fails immediately
**Possible causes:**
- Signaling server not running
- Wrong IP address/port
- Firewall blocking WebSocket

**Solution:**
- Check server logs
- Verify server status endpoint
- Test WebSocket connectivity

### Issue: WebRTC connection fails
**Possible causes:**
- TURN server unreachable
- Wrong TURN credentials
- NAT traversal issues

**Solution:**
- Test TURN server separately
- Check ICE candidate exchange in logs
- Verify firewall rules

### Issue: Video not displaying
**Possible causes:**
- Camera permissions denied
- Browser compatibility
- Codec mismatch

**Solution:**
- Check browser console
- Grant camera permissions
- Try different browser

### Issue: Poor video quality
**Possible causes:**
- Low bandwidth
- Packet loss
- CPU limitations

**Solution:**
- Lower resolution/framerate
- Check network stats
- Monitor system resources
