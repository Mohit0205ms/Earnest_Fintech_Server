import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
  // Credentials removed to prevent issues with wildcard origins
}));

// Handle preflight OPTIONS requests
app.options('*', function (req, res) {
  res.sendStatus(200);
});

app.use(json());
app.use(requestLogger);

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Error handling middleware
app.use(errorHandler);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Task Management API is running' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
module.exports = app;
