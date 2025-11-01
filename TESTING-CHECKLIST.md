# Testing Checklist - Phase 2 Video Streaming

## 📋 Pre-Testing Setup

### Environment Check
- [ ] Node.js installed (v14+ recommended)
- [ ] npm installed
- [ ] Both devices have browsers that support WebRTC
  - ✅ Chrome/Chromium
  - ✅ Firefox
  - ✅ Safari (iOS/macOS)
  - ✅ Edge
- [ ] TURN server confirmed working: `turn:136.107.56.70:3478`

### Installation
```bash
cd /path/to/project
npm install
mkdir -p public
cp sender.html public/
cp receiver.html public/
```

---

## 🧪 Test 1: Local Same-Machine Test

**Purpose:** Verify all components work before network testing

### Steps:
1. [ ] Start signaling server
   ```bash
   node signaling-server.js
   ```
   
2. [ ] Verify server started successfully
   - Should show port 8080
   - Should show TURN server address
   
3. [ ] Open sender page in Browser Window 1
   ```
   http://localhost:8080/sender.html
   ```
   
4. [ ] In sender page:
   - [ ] Click "Start Camera"
   - [ ] Grant camera permissions
   - [ ] Verify camera preview appears
   - [ ] Status shows "Camera: Active"
   
5. [ ] Click "Connect to Server"
   - [ ] Status shows "Signaling Server: Connected"
   - [ ] Logs show "Registered as sender"
   
6. [ ] Open receiver page in Browser Window 2
   ```
   http://localhost:8080/receiver.html
   ```
   
7. [ ] In receiver page:
   - [ ] Click "Connect to Server"
   - [ ] Status shows "Signaling Server: Connected"
   - [ ] Status shows "Sender: Connected"
   - [ ] Logs show "Registered as receiver"
   
8. [ ] Wait 5-10 seconds for connection
   - [ ] Sender logs show "WebRTC connection established"
   - [ ] Receiver logs show "WebRTC connection established"
   - [ ] Video appears in receiver window
   - [ ] Video is playing smoothly
   
9. [ ] Check receiver metrics
   - [ ] Resolution shows (e.g., 1280x720)
   - [ ] Frame rate shows (e.g., 30 fps)
   - [ ] Bitrate shows (e.g., 1500 kbps)
   - [ ] Packets Lost shows number
   - [ ] Latency shows milliseconds

### Expected Results:
✅ Server starts without errors
✅ Both peers connect successfully
✅ Video streams from sender to receiver
✅ Metrics display correctly
✅ No errors in browser console

### If Test Fails:
- Check browser console (F12) for errors
- Check server terminal for error messages
- Verify camera permissions granted
- Try different browser
- Check if camera is being used by another app

---

## 🌐 Test 2: Same WiFi Network (Phone to Laptop)

**Purpose:** Test actual use case with phone and laptop

### Prerequisites:
- [ ] Phone and laptop on SAME WiFi network
- [ ] Know laptop's IP address
- [ ] Firewall allows port 8080

### Find Laptop IP:
**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

**Mac:**
```bash
ifconfig en0 | grep "inet "
```

**Linux:**
```bash
hostname -I
```

Example IP: `192.168.1.100` (use YOUR actual IP)

### Steps:

1. [ ] On Laptop: Start signaling server
   ```bash
   node signaling-server.js
   ```

2. [ ] On Laptop: Open receiver
   ```
   http://localhost:8080/receiver.html
   ```
   
3. [ ] On Laptop receiver:
   - [ ] Click "Connect to Server"
   - [ ] Status shows "Signaling Server: Connected"
   
4. [ ] On Phone: Open sender
   ```
   http://192.168.1.100:8080/sender.html
   ```
   (Replace with YOUR laptop's IP)
   
5. [ ] On Phone sender:
   - [ ] Click "Start Camera"
   - [ ] Grant camera permissions
   - [ ] Verify camera preview appears
   - [ ] Select camera (Front/Back)
   - [ ] Select resolution (try 1280x720)
   - [ ] Select frame rate (try 30 fps)
   
6. [ ] On Phone:
   - [ ] Click "Connect to Server"
   - [ ] Status shows "Signaling Server: Connected"
   - [ ] Logs show "Registered as sender"
   - [ ] Logs show "Receiver connected"
   
7. [ ] Wait 5-10 seconds
   - [ ] Phone logs show "WebRTC connection established"
   - [ ] Laptop shows video from phone
   - [ ] Video quality looks good
   - [ ] No stuttering or freezing
   
8. [ ] Test different settings on phone:
   - [ ] Change resolution to 640x480 → Check quality
   - [ ] Change resolution to 1920x1080 → Check quality
   - [ ] Change frame rate to 15 fps → Check smoothness
   - [ ] Change frame rate to 30 fps → Check smoothness
   - [ ] Switch front/back camera → Check switching works
   
9. [ ] Monitor metrics on laptop:
   - [ ] Resolution updates when changed
   - [ ] Frame rate updates when changed
   - [ ] Bitrate varies with settings
   - [ ] Packet loss stays low (< 1%)
   - [ ] Latency reasonable (< 500ms)
   
10. [ ] Test connection stability:
    - [ ] Let stream run for 5 minutes
    - [ ] Video continues smoothly
    - [ ] No disconnections
    - [ ] Metrics remain stable

### Expected Results:
✅ Phone connects to laptop's signaling server
✅ Video streams from phone camera to laptop display
✅ Settings changes take effect
✅ Connection remains stable
✅ Quality is acceptable for your use case
✅ Latency is under 500ms

### If Test Fails:

**Cannot connect from phone:**
- Verify both devices on SAME WiFi
- Check laptop's firewall allows port 8080
- Try using laptop's IP with http:// prefix
- Try disabling VPN on either device

**Connection drops frequently:**
- Check WiFi signal strength
- Move closer to router
- Reduce resolution/frame rate
- Check for network congestion

**Poor video quality:**
- Reduce resolution on phone
- Lower frame rate
- Check available bandwidth
- Ensure good WiFi signal

**High latency:**
- Reduce resolution
- Lower frame rate  
- Check network congestion
- Verify no VPN or proxy active

---

## 🌍 Test 3: Different Networks (TURN Relay)

**Purpose:** Test TURN server relay when direct connection impossible

### Prerequisites:
- [ ] Phone on cellular data OR different WiFi
- [ ] Laptop on WiFi/Ethernet
- [ ] TURN server accessible from both networks

### Steps:

1. [ ] On Laptop: Start server and open receiver
   
2. [ ] On Phone: Switch to cellular data (or different WiFi)
   
3. [ ] On Phone: Open sender using PUBLIC IP or domain
   ```
   http://<PUBLIC_IP>:8080/sender.html
   ```
   
4. [ ] Connect both sender and receiver
   
5. [ ] Monitor connection establishment:
   - [ ] Both devices show "Connecting"
   - [ ] Connection may take 10-20 seconds
   - [ ] Logs should show ICE candidate exchanges
   - [ ] Connection eventually shows "Connected"
   
6. [ ] Check if using TURN relay:
   - Open browser console (F12)
   - Look for "relay" in candidate types
   - This confirms TURN is being used
   
7. [ ] Verify video quality:
   - [ ] Video streams successfully
   - [ ] May have higher latency (100-500ms)
   - [ ] Bitrate may be lower
   - [ ] Some packet loss acceptable (< 5%)

### Expected Results:
✅ Connection establishes even on different networks
✅ TURN server relays media successfully
✅ Video streams with acceptable quality
✅ Latency higher but still usable

### If Test Fails:
- Verify TURN server is accessible from both networks
- Check TURN credentials are correct
- Ensure TURN server UDP port 3478 is open
- Check TURN server logs for errors

---

## 🔧 Test 4: Feature Testing

### Video Settings

1. [ ] **Resolution Changes:**
   - [ ] 640x480 → Video updates
   - [ ] 1280x720 → Video updates
   - [ ] 1920x1080 → Video updates
   - [ ] Receiver metrics show new resolution

2. [ ] **Frame Rate Changes:**
   - [ ] 15 fps → Smoother CPU usage
   - [ ] 24 fps → Cinematic look
   - [ ] 30 fps → Smooth motion
   - [ ] Receiver metrics show new FPS

3. [ ] **Camera Switching:**
   - [ ] Front camera selected → Works
   - [ ] Back camera selected → Works
   - [ ] Switch while streaming → Smooth transition

### Connection Management

4. [ ] **Disconnect and Reconnect:**
   - [ ] Stop streaming on sender
   - [ ] Receiver shows "Disconnected"
   - [ ] Restart streaming
   - [ ] Connection re-establishes

5. [ ] **Network Interruption:**
   - [ ] Disable WiFi briefly
   - [ ] Re-enable WiFi
   - [ ] Connection should recover OR require reconnect

6. [ ] **Multiple Sessions:**
   - [ ] Complete one streaming session
   - [ ] Start another session
   - [ ] Both sessions work independently

### Monitoring

7. [ ] **Metrics Accuracy:**
   - [ ] Resolution matches video settings
   - [ ] FPS is within expected range
   - [ ] Bitrate varies with quality
   - [ ] Packet loss < 5% on good network
   - [ ] Latency < 500ms on local network

8. [ ] **Status Indicators:**
   - [ ] All status badges update correctly
   - [ ] Colors reflect actual state (green/red/yellow)
   - [ ] Logs show all events

---

## 📊 Performance Benchmarks

### Target Metrics:

| Metric | Good | Acceptable | Poor |
|--------|------|------------|------|
| Latency | < 200ms | 200-500ms | > 500ms |
| Packet Loss | < 1% | 1-5% | > 5% |
| FPS (30fps setting) | 28-30 | 24-28 | < 24 |
| Bitrate (720p) | 1-2 Mbps | 500-1000 kbps | < 500 kbps |

### Record Your Results:

**Test 1 (Local):**
- Latency: _______ ms
- Packet Loss: _______ %
- FPS: _______
- Bitrate: _______ kbps

**Test 2 (Same WiFi):**
- Latency: _______ ms
- Packet Loss: _______ %
- FPS: _______
- Bitrate: _______ kbps

**Test 3 (TURN Relay):**
- Latency: _______ ms
- Packet Loss: _______ %
- FPS: _______
- Bitrate: _______ kbps

---

## ✅ Final Validation

All tests passed? You're ready to use your video streaming system!

### Deployment Checklist:
- [ ] All local tests passed
- [ ] Same network tests passed
- [ ] Different network tests passed (if needed)
- [ ] Video quality meets requirements
- [ ] Latency is acceptable
- [ ] Connection stability is good
- [ ] All features work as expected
- [ ] Documentation reviewed

### Known Limitations:
- Single sender, single receiver only
- No audio streaming (yet)
- No recording capability (yet)
- Browser-based only (no native apps)
- Requires good network connectivity

### Phase 2 Status: ✅ COMPLETE

**Congratulations!** Your WebRTC video streaming pipeline is fully functional!

---

## 🆘 Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Camera not working | Check permissions, try different browser |
| Cannot connect | Verify IP, check firewall, ensure same network |
| Poor quality | Lower resolution/FPS, check WiFi signal |
| High latency | Reduce settings, check network load |
| Connection drops | Check WiFi stability, reduce quality |
| No video appears | Wait 10s, check console, refresh both pages |
| TURN not working | Verify credentials, check UDP port 3478 |

For detailed troubleshooting, see `README.md` and `ARCHITECTURE.md`.

---

**Ready to stream? Let's go! 🚀📹**
