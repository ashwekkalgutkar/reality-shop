import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runMigrations } from './db/migrate.js';
import eventsRouter from './routes/events.js';
import analyticsRouter from './routes/analytics.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

// Ensure DB schema exists on startup
runMigrations();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/events', eventsRouter);
app.use('/api/analytics', analyticsRouter);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Analytics Server running on http://localhost:${PORT}`);
});
