# HTTPS Setup Guide - Camera Access Fix

## 🔒 Why HTTPS is Required

Modern browsers require **HTTPS (secure connection)** for camera/microphone access, except on localhost. This is a security feature to protect users from malicious websites.

Your phone sees your laptop's IP address (e.g., `192.168.1.100`) as a **non-localhost** address, so HTTP won't work for camera access.

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

This creates:
- `key.pem` - Private key
- `cert.pem` - SSL certificate (valid for 365 days)

**Output example:**
```
✓ Certificate generated successfully!

Files created:
  • key.pem  - Private key
  • cert.pem - SSL certificate

Certificate valid for 365 days
Certificate IP: 192.168.1.100
```

### Step 2: Start the Secure Server

```bash
node signaling-server-secure.js
```

Or:

```bash
npm run start-secure
```

You should see:
```
========================================
Signaling Server running on port 8080
Protocol: HTTPS
WebSocket: wss://localhost:8080
Status: https://localhost:8080/status
TURN Server: turn:136.107.56.70:3478

⚠️  Using self-signed certificate
You'll need to accept the security warning in your browser
========================================
```

### Step 3: Accept Security Warnings

**CRITICAL:** You must accept the security warning on **BOTH** your laptop and phone!

#### On Laptop:
1. Open: `https://localhost:8080/receiver.html`
2. Browser shows: "Your connection is not private" or "Warning: Potential Security Risk"
3. Click "Advanced" → "Proceed to localhost" (or similar)
4. Page loads successfully

#### On Phone:
1. Open: `https://192.168.1.100:8080/sender.html` (use YOUR laptop's IP)
2. Browser shows security warning
3. Click "Advanced" → "Proceed" or "Accept Risk"
4. Page loads successfully

**Now the camera should work!** 📹

---

## 📱 Detailed Phone Setup

### Find Your Laptop's IP

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter

**Mac:**
```bash
ifconfig en0 | grep "inet "
```

**Linux:**
```bash
hostname -I
```

Example IP: `192.168.1.100`

### Connect from Phone

1. **Ensure same WiFi:** Phone and laptop on same network
2. **Open browser on phone:** Safari (iOS) or Chrome (Android)
3. **Navigate to:** `https://192.168.1.100:8080/sender.html`
   - Replace `192.168.1.100` with YOUR laptop's IP
   - Use **https://** (not http://)
4. **Accept security warning:**
   - iOS Safari: Tap "Show Details" → "visit this website"
   - Android Chrome: Tap "Advanced" → "Proceed"
5. **Grant camera permission when prompted**
6. **Click "Start Camera"** - should work now! ✅

---

## 🔍 Troubleshooting

### Issue: "Certificate generation failed"

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

### Issue: "Cannot connect to wss://..."

**Cause:** Server not started with HTTPS

**Solution:**
```bash
# Make sure you're using the secure server
node signaling-server-secure.js

# NOT the regular one:
# node signaling-server.js  ❌
```

### Issue: Security warning won't go away

**Solution:**
1. Clear browser cache
2. Try a different browser
3. Regenerate certificate: `./generate-cert.sh`
4. Restart server

### Issue: Camera still doesn't work after HTTPS

**Possible causes:**

1. **Didn't accept security warning on phone:**
   - Must click "Advanced" → "Proceed"
   - Try reloading the page

2. **Wrong URL:**
   - Must use `https://` not `http://`
   - Must use laptop's IP, not `localhost`

3. **Mixed content:**
   - If server shows HTTP, regenerate certificates
   - Check server logs for "Protocol: HTTPS"

4. **Browser doesn't support getUserMedia:**
   - Use Chrome, Firefox, or Safari
   - Update browser to latest version

5. **Camera permissions blocked:**
   - Phone settings → Browser → Permissions → Camera → Allow

### Issue: "This site can't provide a secure connection"

**Cause:** Certificate not loaded by server

**Check:**
```bash
# Verify certificate files exist
ls -l cert.pem key.pem

# Both files should be present
```

**Solution:**
If files missing, regenerate:
```bash
./generate-cert.sh
```

---

## 🔐 Security Notes

### Self-Signed Certificate

The certificate we generated is **self-signed** (not from a trusted Certificate Authority). This is why browsers show a warning.

**For testing/development:** Self-signed certificates are PERFECT ✅
**For production:** Get a real certificate from Let's Encrypt

### Is this secure?

Yes, the connection is encrypted, but:
- Browser warns because certificate isn't from a trusted authority
- OK for private networks and testing
- Don't use for public/production without a real certificate

### Certificate Expiration

The certificate is valid for **365 days**. After that:
```bash
# Just regenerate
./generate-cert.sh
```

---

## 🎯 Alternative Solutions

### Option 1: Use ngrok (Easiest for Testing)

[ngrok](https://ngrok.com/) creates a secure tunnel with real HTTPS:

```bash
# Install ngrok
npm install -g ngrok

# Start your HTTP server
node signaling-server.js

# In another terminal, create tunnel
ngrok http 8080
```

ngrok gives you a URL like: `https://abc123.ngrok.io`

Use this URL from your phone (no security warnings!)

**Pros:**
- ✅ Real HTTPS certificate
- ✅ No security warnings
- ✅ Works from anywhere

**Cons:**
- ❌ Requires internet connection
- ❌ Random URL changes each time (unless paid)
- ❌ Adds extra latency

### Option 2: mkcert (Better Self-Signed Certs)

[mkcert](https://github.com/FiloSottile/mkcert) creates locally-trusted certificates:

```bash
# Install mkcert
brew install mkcert  # macOS
# or see: https://github.com/FiloSottile/mkcert#installation

# Install local CA
mkcert -install

# Generate certificate
mkcert localhost 192.168.1.100

# Rename files
mv localhost+1.pem cert.pem
mv localhost+1-key.pem key.pem
```

**Pros:**
- ✅ No browser warnings
- ✅ Looks more professional
- ✅ Works offline

**Cons:**
- ❌ More setup required
- ❌ Must install CA on phone too

### Option 3: Use Localhost Tunnel Services

Services like:
- [localtunnel](https://localtunnel.github.io/www/)
- [serveo](https://serveo.net/)
- [localhost.run](https://localhost.run/)

Similar to ngrok but open source.

---

## ✅ Verification Checklist

Before testing camera on phone, verify:

- [ ] Certificate files exist (`cert.pem` and `key.pem`)
- [ ] Server started with `signaling-server-secure.js`
- [ ] Server logs show "Protocol: HTTPS"
- [ ] Laptop can access `https://localhost:8080/receiver.html`
- [ ] Security warning accepted on laptop
- [ ] Phone on same WiFi as laptop
- [ ] Phone can access `https://<LAPTOP_IP>:8080/sender.html`
- [ ] Security warning accepted on phone
- [ ] Camera permission granted on phone

---

## 🎓 Understanding the Error

Your original error:
```
undefined is not an object (evaluating 'navigator.mediadevices.getUserMedia')
```

This means:
- `navigator.mediaDevices` is `undefined`
- Browser blocks camera access on non-secure contexts
- Fix: Use HTTPS (or localhost)

After HTTPS setup:
- `navigator.mediaDevices` will be defined ✅
- `getUserMedia()` will work ✅
- Camera permission prompt will appear ✅

---

## 📚 Additional Resources

- [MDN: getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [WebRTC Security](https://webrtc-security.github.io/)
- [Let's Encrypt](https://letsencrypt.org/) - Free SSL certificates for production

---

## 🎉 Success!

Once HTTPS is set up:

1. **On Laptop:**
   - Open: `https://localhost:8080/receiver.html`
   - Accept security warning
   - Click "Connect to Server"

2. **On Phone:**
   - Open: `https://<YOUR_LAPTOP_IP>:8080/sender.html`
   - Accept security warning
   - Click "Start Camera" → Grant permission ✅
   - Click "Connect to Server"
   - Video streams! 🎥

**Camera access now works!** 📱➡️💻
