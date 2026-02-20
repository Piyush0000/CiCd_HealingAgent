require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const { runOrchestrator } = require('./agents/orchestratorAgent');

const RESULTS_DIR = path.join(__dirname, 'results');
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

const app = express();
const server = http.createServer(app);

// Parse allowed origins
const allowedOrigins = (process.env.FRONTEND_URL || '*').split(',').map(url => url.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List all saved results
app.get('/results', (req, res) => {
  try {
    const files = fs.readdirSync(RESULTS_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const full = path.join(RESULTS_DIR, f);
        const stat = fs.statSync(full);
        const data = JSON.parse(fs.readFileSync(full, 'utf8'));
        return {
          filename: f,
          createdAt: stat.mtime.toISOString(),
          branch: data.branch,
          finalStatus: data.finalStatus,
          score: data.score,
          timeTaken: data.timeTaken,
          totalFixes: data.totalFixes
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ count: files.length, results: files });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get a specific result file
app.get('/results/:filename', (req, res) => {
  try {
    const filePath = path.join(RESULTS_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Main agent endpoint
app.post('/run-agent', async (req, res) => {
  const { repoUrl, teamName, leaderName } = req.body;

  if (!repoUrl || !teamName || !leaderName) {
    return res.status(400).json({
      error: 'Missing required fields: repoUrl, teamName, leaderName'
    });
  }

  // Validate repo URL
  try {
    new URL(repoUrl);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid repository URL' });
  }

  // Use socket room based on request timestamp
  const runId = `run_${Date.now()}`;

  // Return run ID immediately, emit events via socket
  res.json({ runId, message: 'Agent started. Connect to socket for live updates.' });

  // Run orchestrator in background
  const socketRoom = io.to(runId);

  const emitEvent = (event) => {
    socketRoom.emit('agent-event', { ...event, runId, ts: new Date().toISOString() });
    console.log(`[${runId}] ${event.type}: ${event.message}`);
  };

  try {
    const result = await runOrchestrator({ repoUrl, teamName, leaderName }, emitEvent);
    socketRoom.emit('agent-complete', { runId, result });
  } catch (error) {
    console.error(`[${runId}] Fatal error:`, error.message);
    socketRoom.emit('agent-error', { runId, error: error.message });
  }
});

// Synchronous endpoint (polling fallback)
app.post('/run-agent-sync', async (req, res) => {
  const { repoUrl, teamName, leaderName } = req.body;

  if (!repoUrl || !teamName || !leaderName) {
    return res.status(400).json({
      error: 'Missing required fields: repoUrl, teamName, leaderName'
    });
  }

  const events = [];
  const emitEvent = (event) => {
    events.push({ ...event, ts: new Date().toISOString() });
    console.log(`[SYNC] ${event.type}: ${event.message}`);
  };

  try {
    const result = await runOrchestrator({ repoUrl, teamName, leaderName }, emitEvent);
    res.json({ success: true, result, events });
  } catch (error) {
    console.error('[SYNC] Fatal error:', error.message);
    res.status(500).json({ success: false, error: error.message, events });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-run', (runId) => {
    socket.join(runId);
    console.log(`Socket ${socket.id} joined room: ${runId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\n🚀 Reparo Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});

module.exports = { app, server };
