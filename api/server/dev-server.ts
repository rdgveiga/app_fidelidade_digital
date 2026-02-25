import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import shopRoutes from './routes/shop.js';
import clientRoutes from './routes/client.js';
import adminRoutes from './routes/admin.js';

const PORT = Number(process.env.PORT) || 3000;

async function start() {
    const app = express();

    // Vite dev server in middleware mode (handles frontend + HMR)
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
    });

    // Request logger
    app.use((req, res, next) => {
        console.log(`[DEV-SERVER] ${req.method} ${req.url}`);
        next();
    });

    // Standard middleware
    app.use(cors());
    app.use(express.json());

    // Init DB
    initDb();

    // API routes (must come BEFORE Vite so /api/* isn't intercepted by frontend)
    app.use('/api/auth', authRoutes);
    app.use('/api/shop', shopRoutes);
    app.use('/api/client', clientRoutes);
    app.use('/api/admin', adminRoutes);
    app.get('/api/health', (_req, res) => {
        console.log('[DEV-SERVER] Health check hit');
        res.json({ status: 'ok', ts: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
    });

    // Error handler for API routes
    app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.error('API ERROR:', err);
        res.status(err.status || 500).json({ error: err.message || 'Something went wrong' });
    });

    // Vite handles everything else (React SPA + HMR)
    app.use(vite.middlewares);

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀  App running at http://localhost:${PORT}`);
        console.log(`📡  API: http://localhost:${PORT}/api/health\n`);
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
