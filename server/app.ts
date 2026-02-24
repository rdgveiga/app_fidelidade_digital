import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db';
import authRoutes from './routes/auth';
import shopRoutes from './routes/shop';
import clientRoutes from './routes/client';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('SERVER ERROR:', err);

    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Something went wrong!';

    res.status(status).json({
        error: message,
        status
    });
});

export default app;
