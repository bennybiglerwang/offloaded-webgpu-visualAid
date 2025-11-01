# WebRTC Video Streaming - Phase 2 Implementation

## 📁 Project Structure

```
webrtc-streaming/
├── signaling-server.js    # WebSocket signaling server
├── package.json           # Node.js dependencies
├── sender.html           # Phone interface (video sender)
├── receiver.html         # Laptop interface (video receiver)
└── public/              # Static files directory
    ├── sender.html      # (copy sender.html here)
    └── receiver.html    # (copy receiver.html here)
```

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `ws` - WebSocket server library
- `express` - Web server for serving static files

### Step 2: Create Public Directory

```bash
mkdir -p public
cp sender.html public/
cp receiver.html public/
```

### Step 3: Start the Signaling Server

```bash
node signaling-server.js
```

Or with auto-restart during development:
```bash
npm run dev
```

The server will start on port 8080 and display:
```
========================================
Signaling Server running on port 8080
WebSocket: ws://localhost:8080
Status: http://localhost:8080/status
TURN Server: turn:136.107.56.70:3478
========================================
```

## 📱 Usage Instructions

### On Your Phone (Sender):

1. Connect to the same network as your laptop
2. Open browser and navigate to: `http://<laptop-ip>:8080/sender.html`
3. Click "Start Camera" and grant camera permissions
4. Select your preferred settings (resolution, FPS, camera)
5. Click "Connect to Server"
6. Wait for receiver to connect
7. Video will automatically start streaming when receiver is ready

### On Your Laptop (Receiver):

1. Open browser and navigate to: `http://localhost:8080/receiver.html`
2. Click "Connect to Server"
3. Wait for sender to connect
4. Video stream will appear automatically
5. Monitor connection metrics in real-time

## 🔍 Testing Locally (Same Machine)

For testing on the same machine:

1. Start the signaling server:
   ```bash
   node signaling-server.js
   ```

2. Open TWO browser windows:
   - Window 1: `http://localhost:8080/sender.html`
   - Window 2: `http://localhost:8080/receiver.html`

3. In Sender window:
   - Click "Start Camera"
   - Click "Connect to Server"

4. In Receiver window:
   - Click "Connect to Server"
   - Video should appear!

## 🌐 Network Setup

### Find Your Laptop's IP Address:

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address"

**Mac/Linux:**
```bash
ifconfig | grep inet
# or
ip addr show
```

### Firewall Configuration:

Make sure port 8080 is open:

**Windows:**
```powershell
netsh advfirewall firewall add rule name="WebRTC Signaling" dir=in action=allow protocol=TCP localport=8080
```

**Linux (UFW):**
```bash
sudo ufw allow 8080/tcp
```

**Mac:**
System Preferences → Security & Privacy → Firewall → Firewall Options → Add port 8080

## 🔧 Configuration

### Change Signaling Server Port:

Edit `signaling-server.js`:
```javascript
const PORT = process.env.PORT || 8080; // Change 8080 to your port
```

### TURN Server Configuration:

Already configured to use your TURN server at `turn:136.107.56.70:3478`

The configuration is in `signaling-server.js`:
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

## 📊 Monitoring

### Check Server Status:

```bash
curl http://localhost:8080/status
```

Response:
```json
{
  "sender": "connected",
  "receiver": "connected",
  "turnServer": "turn:136.107.56.70:3478"
}
```

### View Logs:

The server logs all signaling activity:
- Connection/disconnection events
- Offer/answer exchanges
- ICE candidate exchanges
- Errors

Both sender and receiver pages also show real-time logs.

## 🎬 Connection Flow

```
1. Start Signaling Server (laptop)
2. Sender opens sender.html → Starts camera → Connects to server
3. Receiver opens receiver.html → Connects to server
4. Signaling server matches sender and receiver
5. Sender creates WebRTC offer → Sent via signaling server
6. Receiver creates WebRTC answer → Sent via signaling server
7. ICE candidates exchanged via signaling server
8. Direct P2P connection established (or via TURN if needed)
9. Video streams from phone to laptop!
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to signaling server"
- Check if server is running: `curl http://localhost:8080/status`
- Check firewall settings
- Verify correct IP address

### Issue: "Camera permission denied"
- Check browser permissions
- HTTPS may be required for camera access (use ngrok for testing)
- Try a different browser

### Issue: "WebRTC connection failed"
- Check TURN server is running
- Verify TURN credentials are correct
- Check network connectivity between devices
- Look at browser console for detailed errors

### Issue: "Video not displaying"
- Check if both peers are connected in logs
- Verify WebRTC connection state is "connected"
- Check browser console for errors
- Try refreshing both pages

## 🔒 Security Notes

**For Production Use:**
- Add authentication to signaling server
- Use HTTPS (WSS for WebSocket)
- Implement rate limiting
- Add session tokens
- Validate all incoming messages
- Use secure TURN credentials

## 🆘 Support

If you encounter issues:
1. Check browser console logs (F12)
2. Check signaling server terminal output
3. Verify TURN server is accessible
4. Test with both devices on same network first
