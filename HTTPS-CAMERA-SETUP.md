# HTTPS & Camera Access Setup Guide

## 🎯 Problem Overview

**Error You Might See:**
```
Camera error: undefined is not an object (evaluating 'navigator.mediaDevices.getUserMedia')
```

**Root Cause:**
Modern browsers require **HTTPS (secure connection)** for camera/microphone access on non-localhost addresses. This is a security feature to protect users from malicious websites.

**Your Situation:**
- **Laptop (`localhost`)** → Camera works with HTTP ✅
- **Phone (`192.168.1.100`)** → Camera blocked with HTTP ❌
- **Phone (`https://192.168.1.100`)** → Camera works with HTTPS ✅

---

## 🚀 Quick Fix (3 Steps)

### Step 1: Generate SSL Certificate

On your laptop, run:

```bash
./generate-cert.sh
```

Or:

```bash
npm run generate-cert
```

**What This Creates:**
- `key.pem` - Private key (keep secret)
- `cert.pem` - SSL certificate (valid for 365 days)

**Expected Output:**
```
✓ Certificate generated successfully!

Files created:
  • key.pem  - Private key
  • cert.pem - SSL certificate

Certificate valid for 365 days
Certificate IP: 192.168.1.100
```

---

### Step 2: Start the Secure Server

```bash
node signaling-server-secure.js
```

Or:

```bash
npm run start-secure
```

**Verify Output Shows:**
```
========================================
Signaling Server running on port 8080
Protocol: HTTPS  ← Must see this!
WebSocket: wss://localhost:8080
Status: https://localhost:8080/status
TURN Server: turn:136.107.56.70:3478

⚠️  Using self-signed certificate
You'll need to accept the security warning in your browser
========================================
```

---

### Step 3: Accept Security Warnings

**⚠️ CRITICAL:** You must accept the security warning on **BOTH** your laptop and phone!

#### On Laptop:
1. Open: `https://localhost:8080/receiver.html`
2. Browser shows: "Your connection is not private" or "Warning: Potential Security Risk"
3. Click **"Advanced"** → **"Proceed to localhost"** (or similar)
4. Page loads successfully ✅

#### On Phone:
1. Find your laptop's IP address (see below)
2. Open: `https://<LAPTOP_IP>:8080/sender.html` (e.g., `https://192.168.1.100:8080/sender.html`)
3. Browser shows security warning
4. Click **"Advanced"** → **"Proceed"** or **"Accept Risk"**
5. Page loads successfully ✅
6. Grant camera permission when prompted
7. Click **"Start Camera"**

**🎉 Camera should work now!**

---

## 📱 Finding Your Laptop's IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., WiFi)

**macOS:**
```bash
ifconfig en0 | grep "inet "
```
Or open System Preferences → Network → WiFi → Details

**Linux:**
```bash
hostname -I
```
Or:
```bash
ifconfig | grep "inet "
```

**Example Output:** `192.168.1.100` ← Use this in your phone's browser

---

## 🔍 Detailed Setup Workflow

### Complete Phone-to-Laptop Setup:

#### 1. **One-Time Setup (Laptop)**
```bash
cd /path/to/OffloadedWebGPU
npm install
./generate-cert.sh
```

#### 2. **Start Server (Every Time)**
```bash
node signaling-server-secure.js
```

#### 3. **Open Receiver (Laptop)**
- Browser: `https://localhost:8080/receiver.html`
- Accept security warning (click "Advanced" → "Proceed")
- Click **"Connect to Server"**
- Status shows: "Signaling Server: Connected"

#### 4. **Open Sender (Phone)**
- **Ensure same WiFi** as laptop
- Browser: `https://192.168.1.100:8080/sender.html` (use YOUR laptop's IP)
- Accept security warning (tap "Advanced" → "Proceed")
- Grant camera permission when prompted
- Click **"Start Camera"**
- Click **"Connect to Server"**

#### 5. **Verify Streaming**
- **On Phone:** Camera preview visible, status shows "Camera: Active"
- **On Laptop:** Live video stream appears, metrics display real-time stats
- **Success!** 🎥✅

---

## 🔧 Troubleshooting

### Issue: Certificate Generation Failed

**Cause:** OpenSSL not installed

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install openssl

# macOS
brew install openssl

# Windows
# Download from: https://slproweb.com/products/Win32OpenSSL.html
```

---

### Issue: Server Shows "Protocol: HTTP" Instead of "HTTPS"

**Causes:**
- Certificate files not found
- Certificate files in wrong directory
- Wrong server script running

**Solution:**
```bash
# 1. Check certificate files exist in project root
ls -l cert.pem key.pem

# 2. If missing, regenerate
./generate-cert.sh

# 3. Verify you're in correct directory
pwd
# Should show: .../OffloadedWebGPU

# 4. Make sure using secure server
node signaling-server-secure.js  # ✅ Correct
# NOT: node signaling-server.js  # ❌ Wrong (no HTTPS)
```

---

### Issue: "Cannot Connect to wss://..."

**Cause:** Server not running with HTTPS

**Solution:**
1. Stop any running server (Ctrl+C)
2. Ensure certificates exist: `ls cert.pem key.pem`
3. Start secure server: `node signaling-server-secure.js`
4. Verify output shows "Protocol: HTTPS"

---

### Issue: Security Warning Won't Go Away

**Solutions:**
1. **Clear browser cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Safari: Safari → Clear History
2. **Try different browser** (Chrome, Firefox, Safari)
3. **Regenerate certificate:**
   ```bash
   rm cert.pem key.pem
   ./generate-cert.sh
   ```
4. **Restart server** after regenerating

---

### Issue: Camera Still Doesn't Work After HTTPS

**Checklist:**
- [ ] Using `https://` (not `http://`) in URL
- [ ] Accepted security warning on phone (clicked "Advanced" → "Proceed")
- [ ] Granted camera permission when prompted
- [ ] Using supported browser (Chrome, Safari, Firefox)
- [ ] Phone camera not in use by another app
- [ ] Browser has camera permission in phone settings

**Test Camera Access:**
1. Open phone browser console (if possible)
2. Or check sender.html logs (scroll down to "Activity Log")
3. Look for specific error message:
   - "Permission denied" → Check phone settings → Browser → Permissions
   - "Camera in use" → Close other apps using camera
   - "Not supported" → Try different browser

---

### Issue: Phone Can't Connect to Server

**Causes:**
- Wrong IP address
- Devices on different WiFi networks
- Firewall blocking port 8080

**Solutions:**

**1. Verify Correct IP:**
```bash
# On laptop, run again:
ifconfig | grep inet   # Mac/Linux
ipconfig               # Windows
```

**2. Check Both Devices on Same Network:**
- Laptop WiFi: Settings → Network → Note network name
- Phone WiFi: Settings → WiFi → Must match laptop's network

**3. Test Connectivity:**
```bash
# On phone browser, try accessing:
https://192.168.1.100:8080/status
# Should show JSON if server reachable
```

**4. Allow Firewall (if blocked):**
```bash
# Linux
sudo ufw allow 8080/tcp

# macOS
# System Preferences → Security & Privacy → Firewall → Firewall Options
# Add exception for port 8080

# Windows
netsh advfirewall firewall add rule name="WebRTC" dir=in action=allow protocol=TCP localport=8080
```

---

### Issue: "This Site Can't Provide a Secure Connection"

**Cause:** Server can't load certificate files

**Solution:**
```bash
# 1. Verify certificate files exist
ls -l cert.pem key.pem

# 2. Check file permissions
chmod 644 cert.pem key.pem

# 3. If files missing, regenerate
./generate-cert.sh

# 4. Restart server
node signaling-server-secure.js
```

---

### Issue: Mixed Content Warnings

**Cause:** Some resources loading over HTTP while page is HTTPS

**Solution:**
- Verify server logs show "Protocol: HTTPS"
- Check browser console for specific mixed content errors
- Ensure all resources use relative URLs (already implemented in code)

---

## 🎓 Understanding Browser Security

### Secure Context Requirements

Modern browsers enforce strict security policies for sensitive APIs:

| Feature | HTTP (localhost) | HTTP (network) | HTTPS |
|---------|------------------|----------------|-------|
| Camera | ✅ Allowed | ❌ Blocked | ✅ Allowed |
| Microphone | ✅ Allowed | ❌ Blocked | ✅ Allowed |
| Geolocation | ✅ Allowed | ❌ Blocked | ✅ Allowed |
| Service Workers | ✅ Allowed | ❌ Blocked | ✅ Allowed |

**Why This Policy Exists:**
- Prevents malicious websites from spying via camera/microphone
- Protects user privacy
- Ensures user consent (permission prompt only on HTTPS)

### Self-Signed vs CA-Signed Certificates

**Self-Signed (What We Use):**
- ✅ Free and instant
- ✅ Works immediately
- ✅ Perfect for development/testing
- ✅ Full encryption (just as secure as CA-signed)
- ❌ Browser shows warning (must accept manually)
- ❌ Not trusted by default
- ✅ **Best for local network testing**

**CA-Signed (Production Use):**
- ✅ No browser warnings
- ✅ Trusted by default
- ✅ Professional appearance
- ❌ Costs money (or requires domain for Let's Encrypt)
- ❌ Requires domain name (not IP address)
- ❌ Setup time (~15-30 minutes)
- ✅ **Required for public deployment**

**For Visual Assistance App:**
Self-signed certificates are **perfect** because:
- Used on local network only
- Phone and laptop directly connected
- No public internet exposure
- One-time security warning acceptance
- Full encryption maintained

---

## 🔐 Security Notes

### Is Self-Signed Secure?

**Yes!** The connection is fully encrypted:
- TLS 1.2 or 1.3 encryption
- Same encryption strength as bank websites
- Browser warning is about **trust**, not **encryption**

### Certificate Expiration

The certificate is valid for **365 days** (1 year).

**When it expires:**
```bash
# Just regenerate (takes 10 seconds)
./generate-cert.sh

# No other changes needed
```

### What's Transmitted?

**Over HTTPS:**
- WebSocket signaling (SDP offers/answers, ICE candidates)
- Status requests

**Over WebRTC (automatically encrypted):**
- Video stream (SRTP - Secure Real-time Transport Protocol)
- Data channel messages (DTLS - Datagram Transport Layer Security)
- AI descriptions

**Privacy:** All processing happens locally - no cloud transmission!

---

## 🎯 Alternative Solutions

### Option 1: ngrok (Easiest for Remote Access)

[ngrok](https://ngrok.com/) creates a secure tunnel with real HTTPS and no warnings:

```bash
# Install ngrok
npm install -g ngrok

# Start your HTTP server (not secure server)
node signaling-server.js

# In another terminal, create tunnel
ngrok http 8080
```

**ngrok Output:**
```
Forwarding   https://abc123.ngrok.io -> http://localhost:8080
```

**Use this URL from anywhere:**
- Laptop: `https://abc123.ngrok.io/receiver.html`
- Phone: `https://abc123.ngrok.io/sender.html`

**Pros:**
- ✅ Real HTTPS certificate (no warnings)
- ✅ Works from anywhere (not just local network)
- ✅ No certificate setup needed
- ✅ Publicly accessible URL

**Cons:**
- ❌ Requires internet connection
- ❌ Random URL changes each restart (unless paid plan $8/month)
- ❌ Adds network latency (~50-200ms)
- ❌ Bandwidth limits on free tier

**Best For:** Quick demos, remote testing, sharing with others

---

### Option 2: mkcert (Best for Development)

[mkcert](https://github.com/FiloSottile/mkcert) creates locally-trusted certificates with no warnings:

```bash
# Install mkcert
brew install mkcert  # macOS
# Or see: https://github.com/FiloSottile/mkcert#installation

# Install local CA
mkcert -install

# Generate certificate for your IP
mkcert localhost 192.168.1.100

# Rename files
mv localhost+1.pem cert.pem
mv localhost+1-key.pem key.pem

# Start server
node signaling-server-secure.js
```

**Pros:**
- ✅ No browser warnings (locally trusted)
- ✅ Looks professional
- ✅ Works offline
- ✅ Multiple domains/IPs supported

**Cons:**
- ❌ Must install mkcert CA on phone too
- ❌ More initial setup
- ❌ Requires mkcert installation

**Best For:** Long-term development, professional demos

---

### Option 3: Let's Encrypt (Production Only)

For public deployment:

```bash
# Requires domain name (not IP)
# Use certbot: https://certbot.eff.org/

sudo certbot certonly --standalone -d yourdomain.com
```

**Pros:**
- ✅ Free CA-signed certificate
- ✅ No browser warnings
- ✅ Auto-renewal
- ✅ Publicly trusted

**Cons:**
- ❌ Requires public domain name
- ❌ Can't use IP addresses
- ❌ Requires port 80/443 accessible
- ❌ Not suitable for local network testing

**Best For:** Production deployment with domain name

---

### Option 4: localhost.run / serveo

Free alternatives to ngrok:

```bash
# localhost.run
ssh -R 80:localhost:8080 nokey@localhost.run

# serveo
ssh -R 80:localhost:8080 serveo.net
```

**Similar to ngrok but:**
- ✅ Free forever
- ✅ No signup needed
- ❌ Less reliable
- ❌ May have downtime

---

## 📊 Solution Comparison

| Solution | Setup Time | Browser Warning | Works Offline | Public Access | Best For |
|----------|-----------|----------------|---------------|---------------|----------|
| **Self-signed (Default)** | 1 min | Yes (accept once) | ✅ Yes | ❌ No | Local testing ⭐ |
| **ngrok** | 2 min | ❌ No | ❌ No | ✅ Yes | Remote demos |
| **mkcert** | 5 min | ❌ No | ✅ Yes | ❌ No | Professional dev |
| **Let's Encrypt** | 30 min | ❌ No | ✅ Yes | ✅ Yes | Production |

**Recommendation:**
1. Start with **self-signed** (what this guide provides) ⭐
2. Use **ngrok** for quick remote access
3. Upgrade to **mkcert** for better dev experience
4. Deploy with **Let's Encrypt** for production

---

## ✅ Verification Checklist

Before testing camera on phone, verify:

- [ ] Certificate files exist (`ls cert.pem key.pem`)
- [ ] Server started with `signaling-server-secure.js`
- [ ] Server logs show "Protocol: HTTPS"
- [ ] Laptop can access `https://localhost:8080/receiver.html`
- [ ] Security warning accepted on laptop
- [ ] Phone and laptop on same WiFi network
- [ ] Phone can access `https://<LAPTOP_IP>:8080/sender.html`
- [ ] Security warning accepted on phone
- [ ] Camera permission granted on phone
- [ ] **Success:** Camera works! 📹✅

---

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ Server logs: "Protocol: HTTPS"
2. ✅ Browser URL shows `https://` with padlock icon
3. ✅ Camera permission prompt appears
4. ✅ Camera preview shows on sender page
5. ✅ Video streams to receiver page
6. ✅ No "undefined is not an object" errors
7. ✅ Receiver displays real-time metrics
8. ✅ AI descriptions sent back to phone (if Phase 2 complete)

---

## 📚 Additional Resources

- **[MDN: getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)** - API documentation
- **[WebRTC Security](https://webrtc-security.github.io/)** - Security best practices
- **[Let's Encrypt](https://letsencrypt.org/)** - Free SSL certificates for production
- **[mkcert GitHub](https://github.com/FiloSottile/mkcert)** - Local CA tool
- **[ngrok Documentation](https://ngrok.com/docs)** - Secure tunnels

---

## 🆘 Still Having Issues?

If you're still stuck after following this guide:

1. **Check browser console** (F12 → Console tab)
   - Look for specific error messages
   - Note exact error text

2. **Check server logs** in terminal
   - Connection attempts
   - WebSocket upgrades
   - Error messages

3. **Verify basics:**
   ```bash
   # Certificate files exist?
   ls -l cert.pem key.pem

   # Server running?
   curl -k https://localhost:8080/status

   # Correct IP address?
   ifconfig | grep inet
   ```

4. **Try alternative solutions:**
   - Use ngrok (fastest to test)
   - Try different browser
   - Test on different phone

5. **Common fixes:**
   - Restart server
   - Clear browser cache
   - Regenerate certificates
   - Check firewall settings
   - Verify same WiFi network

---

## 📞 Support

- **Documentation:** [CLAUDE.md](CLAUDE.md) - Comprehensive project guide
- **GitHub Issues:** [Report bugs](https://github.com/bennybiglerwang/offloaded-webgpu-visualAid/issues)
- **Testing Guide:** [TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)

---

**Last Updated:** November 2025
**Status:** Phase 3 Complete (Visual Assistance Features)
**Camera Access:** Working with HTTPS ✅
