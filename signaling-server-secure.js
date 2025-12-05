const WebSocket = require('ws');
const https = require('https');
const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Store connected peers
const peers = {
    sender: null,
    receiver: null
};

// TURN server configuration to send to clients
const TURN_CONFIG = {
    iceServers: [
        // Primary TURN server
        {
            urls: 'turn:136.107.56.70:3478',
            username: 'user',
            credential: 'pass'
        },
        {
            urls: 'stun:136.107.56.70:3478'
        },
        // Fallback public STUN servers (in case primary is unreachable)
        {
            urls: 'stun:stun.l.google.com:19302'
        },
        {
            urls: 'stun:stun1.l.google.com:19302'
        },
        {
            urls: 'stun:stun2.l.google.com:19302'
        }
    ]
};

console.log('WebRTC Signaling Server Starting...');
console.log('TURN Server: turn:136.107.56.70:3478');

// Try to load SSL certificates if they exist, otherwise fall back to HTTP
let server;
let wss;
let protocol = 'http';
let wsProtocol = 'ws';

const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    console.log('SSL certificates found. Starting HTTPS server...');
    try {
        const privateKey = fs.readFileSync(keyPath, 'utf8');
        const certificate = fs.readFileSync(certPath, 'utf8');
        const credentials = { key: privateKey, cert: certificate };
        
        server = https.createServer(credentials, app);
        protocol = 'https';
        wsProtocol = 'wss';
        console.log('✓ HTTPS server initialized');
    } catch (error) {
        console.error('Error loading SSL certificates, falling back to HTTP:', error.message);
        server = http.createServer(app);
    }
} else {
    console.log('No SSL certificates found. Starting HTTP server...');
    console.log('Note: Camera access will only work on localhost with HTTP.');
    console.log('For phone access, generate certificates with: npm run generate-cert');
    server = http.createServer(app);
}

wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    ws.isAlive = true;
    ws.role = null;
    
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`Received message type: ${data.type} from ${ws.role || 'unregistered peer'}`);
            
            switch(data.type) {
                case 'register':
                    handleRegister(ws, data);
                    break;
                    
                case 'offer':
                    handleOffer(ws, data);
                    break;
                    
                case 'answer':
                    handleAnswer(ws, data);
                    break;
                    
                case 'ice-candidate':
                    handleIceCandidate(ws, data);
                    break;
                    
                case 'get-turn-config':
                    handleGetTurnConfig(ws);
                    break;
                    
                default:
                    console.log(`Unknown message type: ${data.type}`);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
            ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Invalid message format' 
            }));
        }
    });
    
    ws.on('close', () => {
        console.log(`WebSocket closed for ${ws.role || 'unregistered peer'}`);
        handleDisconnect(ws);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
    
    ws.send(JSON.stringify({ 
        type: 'welcome', 
        message: 'Connected to signaling server',
        turnConfig: TURN_CONFIG
    }));
});

function handleRegister(ws, data) {
    const { role } = data;
    
    if (role !== 'sender' && role !== 'receiver') {
        ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid role. Must be "sender" or "receiver"' 
        }));
        return;
    }
    
    if (peers[role] && peers[role].readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
            type: 'error', 
            message: `${role} role is already taken` 
        }));
        console.log(`Registration rejected: ${role} already exists`);
        return;
    }
    
    peers[role] = ws;
    ws.role = role;
    
    console.log(`Peer registered as ${role}`);
    
    ws.send(JSON.stringify({ 
        type: 'registered', 
        role: role,
        turnConfig: TURN_CONFIG
    }));
    
    const otherRole = role === 'sender' ? 'receiver' : 'sender';
    if (peers[otherRole] && peers[otherRole].readyState === WebSocket.OPEN) {
        peers[otherRole].send(JSON.stringify({ 
            type: 'peer-connected', 
            peer: role 
        }));
        
        ws.send(JSON.stringify({ 
            type: 'peer-connected', 
            peer: otherRole 
        }));
        
        console.log('Both peers are now connected!');
    } else {
        console.log(`Waiting for ${otherRole} to connect...`);
    }
}

function handleOffer(ws, data) {
    if (ws.role !== 'sender') {
        ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Only sender can send offer' 
        }));
        return;
    }
    
    if (!peers.receiver || peers.receiver.readyState !== WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'No receiver connected' 
        }));
        return;
    }
    
    console.log('Forwarding offer from sender to receiver');
    peers.receiver.send(JSON.stringify({
        type: 'offer',
        sdp: data.sdp
    }));
}

function handleAnswer(ws, data) {
    if (ws.role !== 'receiver') {
        ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Only receiver can send answer' 
        }));
        return;
    }
    
    if (!peers.sender || peers.sender.readyState !== WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'No sender connected' 
        }));
        return;
    }
    
    console.log('Forwarding answer from receiver to sender');
    peers.sender.send(JSON.stringify({
        type: 'answer',
        sdp: data.sdp
    }));
}

function handleIceCandidate(ws, data) {
    const targetRole = ws.role === 'sender' ? 'receiver' : 'sender';
    
    if (!peers[targetRole] || peers[targetRole].readyState !== WebSocket.OPEN) {
        console.log(`Cannot forward ICE candidate: ${targetRole} not connected`);
        return;
    }
    
    console.log(`Forwarding ICE candidate from ${ws.role} to ${targetRole}`);
    peers[targetRole].send(JSON.stringify({
        type: 'ice-candidate',
        candidate: data.candidate
    }));
}

function handleGetTurnConfig(ws) {
    ws.send(JSON.stringify({
        type: 'turn-config',
        config: TURN_CONFIG
    }));
}

function handleDisconnect(ws) {
    if (ws.role) {
        peers[ws.role] = null;
        
        const otherRole = ws.role === 'sender' ? 'receiver' : 'sender';
        if (peers[otherRole] && peers[otherRole].readyState === WebSocket.OPEN) {
            peers[otherRole].send(JSON.stringify({ 
                type: 'peer-disconnected', 
                peer: ws.role 
            }));
        }
    }
}

const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            console.log(`Terminating inactive connection: ${ws.role || 'unregistered'}`);
            return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(heartbeatInterval);
});

app.use(express.static('public'));

app.get('/status', (req, res) => {
    res.json({
        sender: peers.sender ? 'connected' : 'disconnected',
        receiver: peers.receiver ? 'connected' : 'disconnected',
        turnServer: 'turn:136.107.56.70:3478',
        protocol: protocol,
        secure: protocol === 'https'
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n========================================`);
    console.log(`Signaling Server running on port ${PORT}`);
    console.log(`Protocol: ${protocol.toUpperCase()}`);
    console.log(`WebSocket: ${wsProtocol}://localhost:${PORT}`);
    console.log(`Status: ${protocol}://localhost:${PORT}/status`);
    console.log(`TURN Server: turn:136.107.56.70:3478`);
    if (protocol === 'https') {
        console.log(`\n⚠️  Using self-signed certificate`);
        console.log(`You'll need to accept the security warning in your browser`);
    } else {
        console.log(`\n⚠️  Running on HTTP - camera access limited to localhost`);
        console.log(`For phone access, run: npm run generate-cert`);
    }
    console.log(`========================================\n`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
