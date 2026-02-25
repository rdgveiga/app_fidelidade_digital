import dotenv from 'dotenv';
dotenv.config();

console.log('[DEV-SERVER] Variáveis de ambiente carregadas.');

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

const PORT = Number(process.env.PORT) || 3000;

async function start() {
    console.log('[DEV-SERVER] Iniciando função start...');
    try {
        // Import routes dynamically so dotenv.config() has run
        console.log('[DEV-SERVER] Carregando módulos internos...');
        const { initDb } = await import('./db.js');
        const authRoutes = (await import('./routes/auth.js')).default;
        const shopRoutes = (await import('./routes/shop.js')).default;
        const clientRoutes = (await import('./routes/client.js')).default;
        const adminRoutes = (await import('./routes/admin.js')).default;

        const app = express();

        console.log('[DEV-SERVER] Criando servidor Vite...');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });

        app.use(cors());
        app.use(express.json());

        // Init DB
        console.log('[DEV-SERVER] Inicializando banco de dados...');
        await initDb();

        // API routes
        app.use('/api/auth', authRoutes);
        app.use('/api/shop', shopRoutes);
        app.use('/api/client', clientRoutes);
        app.use('/api/admin', adminRoutes);
        app.get('/api/health', (_req, res) => {
            res.json({ status: 'ok', ts: new Date().toISOString() });
        });

        // Vite handles everything else
        app.use(vite.middlewares);

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🚀  App running at http://localhost:${PORT}`);
            console.log(`📡  API: http://localhost:${PORT}/api/health\n`);
        });
    } catch (error) {
        console.error('[DEV-SERVER] Erro crítico na inicialização:', error);
        process.exit(1);
    }
}

start();
