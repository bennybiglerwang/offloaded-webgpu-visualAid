#!/bin/bash

echo "=========================================="
echo "WebRTC Video Streaming - Setup Test"
echo "=========================================="
echo ""

# Check if Node.js is installed
echo "1. Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✓ Node.js is installed: $NODE_VERSION"
else
    echo "   ✗ Node.js is NOT installed"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
echo ""
echo "2. Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "   ✓ npm is installed: $NPM_VERSION"
else
    echo "   ✗ npm is NOT installed"
    exit 1
fi

# Check if package.json exists
echo ""
echo "3. Checking package.json..."
if [ -f "package.json" ]; then
    echo "   ✓ package.json found"
else
    echo "   ✗ package.json NOT found"
    exit 1
fi

# Check if signaling-server.js exists
echo ""
echo "4. Checking signaling-server.js..."
if [ -f "signaling-server.js" ]; then
    echo "   ✓ signaling-server.js found"
else
    echo "   ✗ signaling-server.js NOT found"
    exit 1
fi

# Check if HTML files exist
echo ""
echo "5. Checking HTML files..."
if [ -f "sender.html" ]; then
    echo "   ✓ sender.html found"
else
    echo "   ✗ sender.html NOT found"
fi

if [ -f "receiver.html" ]; then
    echo "   ✓ receiver.html found"
else
    echo "   ✗ receiver.html NOT found"
fi

# Check if public directory exists, create if not
echo ""
echo "6. Checking public directory..."
if [ -d "public" ]; then
    echo "   ✓ public/ directory exists"
else
    echo "   ⚠ public/ directory does not exist. Creating..."
    mkdir -p public
    echo "   ✓ public/ directory created"
fi

# Copy HTML files to public directory
echo ""
echo "7. Copying HTML files to public directory..."
if [ -f "sender.html" ]; then
    cp sender.html public/
    echo "   ✓ sender.html copied to public/"
fi

if [ -f "receiver.html" ]; then
    cp receiver.html public/
    echo "   ✓ receiver.html copied to public/"
fi

# Check if node_modules exists
echo ""
echo "8. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✓ node_modules/ directory exists"
    echo "   Dependencies are installed"
else
    echo "   ⚠ node_modules/ directory does not exist"
    echo "   Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo "   ✓ Dependencies installed successfully"
    else
        echo "   ✗ Failed to install dependencies"
        exit 1
    fi
fi

# Get IP addresses
echo ""
echo "9. Network Information..."
echo "   Your IP addresses:"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "      " $2}'
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    hostname -I | tr ' ' '\n' | while read ip; do echo "      $ip"; done
else
    echo "      Unable to detect IP automatically"
    echo "      Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) to find your IP"
fi

# Test TURN server connectivity (optional)
echo ""
echo "10. Testing TURN server connectivity..."
echo "    TURN Server: turn:136.107.56.70:3478"
if command -v nc &> /dev/null; then
    if nc -zv -w 3 136.107.56.70 3478 2>&1 | grep -q succeeded; then
        echo "    ✓ TURN server is reachable"
    else
        echo "    ⚠ Cannot reach TURN server (may be normal if UDP only)"
    fi
else
    echo "    ⚠ 'nc' command not available, skipping connectivity test"
fi

# Final summary
echo ""
echo "=========================================="
echo "Setup Test Complete!"
echo "=========================================="
echo ""
echo "To start the signaling server:"
echo "   node signaling-server.js"
echo ""
echo "Then open in your browser:"
echo "   Sender (Phone):   http://<YOUR_IP>:8080/sender.html"
echo "   Receiver (Laptop): http://localhost:8080/receiver.html"
echo ""
echo "Replace <YOUR_IP> with your laptop's IP address shown above."
echo ""
echo "=========================================="
