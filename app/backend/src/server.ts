import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Health check endpoint for Kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Import Routes
import { webhookRouter } from './routes/webhook';
import { subscribeRouter } from './routes/subscribe';

import { chaosRouter } from './routes/chaos';

// Register Routes
app.use('/api/webhook', webhookRouter);
app.use('/api/subscribe', subscribeRouter);
app.use('/api/chaos', chaosRouter);

import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer(app);

// Initialize Socket.io and allow CORS from the React frontend
export const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, restrict this to the frontend URL
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Frontend connected to WebSockets:', socket.id);
});

httpServer.listen(PORT, () => {
  console.log(`HealOps Backend API is running on port ${PORT}`)
})
