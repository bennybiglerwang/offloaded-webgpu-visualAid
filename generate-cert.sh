#!/bin/bash

echo "=========================================="
echo "Generating Self-Signed SSL Certificate"
echo "=========================================="
echo ""

# Check if openssl is installed
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL is not installed"
    echo ""
    echo "Please install OpenSSL:"
    echo "  Ubuntu/Debian: sudo apt-get install openssl"
    echo "  macOS: brew install openssl"
    echo "  Windows: Download from https://slproweb.com/products/Win32OpenSSL.html"
    exit 1
fi

echo "✓ OpenSSL found"
echo ""

# Get the local IP address
echo "Detecting your IP address..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}')
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    echo "⚠️  Unable to detect IP automatically"
    echo ""
    read -p "Enter your laptop's IP address: " LOCAL_IP
fi

echo "Your IP address: $LOCAL_IP"
echo ""

# Create a configuration file for the certificate
cat > ssl_config.cnf << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
C=US
ST=State
L=City
O=Organization
OU=Department
CN=$LOCAL_IP

[v3_req]
subjectAltName = @alt_names

[alt_names]
IP.1 = $LOCAL_IP
IP.2 = 127.0.0.1
DNS.1 = localhost
EOF

echo "Generating SSL certificate and private key..."
echo ""

# Generate self-signed certificate
openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout key.pem \
    -out cert.pem \
    -days 365 \
    -config ssl_config.cnf 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Certificate generated successfully!"
    echo ""
    echo "Files created:"
    echo "  • key.pem  - Private key"
    echo "  • cert.pem - SSL certificate"
    echo ""
    echo "Certificate valid for 365 days"
    echo "Certificate IP: $LOCAL_IP"
    echo ""
    
    # Clean up config file
    rm ssl_config.cnf
    
    echo "=========================================="
    echo "Next Steps:"
    echo "=========================================="
    echo ""
    echo "1. Start the secure server:"
    echo "   node signaling-server-secure.js"
    echo ""
    echo "2. On your laptop, open:"
    echo "   https://localhost:8080/receiver.html"
    echo "   (Accept the security warning)"
    echo ""
    echo "3. On your phone, open:"
    echo "   https://$LOCAL_IP:8080/sender.html"
    echo "   (Accept the security warning)"
    echo ""
    echo "⚠️  IMPORTANT: You MUST accept the security warning"
    echo "   on BOTH devices before the camera will work!"
    echo ""
    echo "=========================================="
else
    echo "❌ Failed to generate certificate"
    rm -f ssl_config.cnf
    exit 1
fi
