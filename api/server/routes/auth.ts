import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';
import { z } from 'zod';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required in .env file');
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SHOPKEEPER']), // CLIENT accounts are created by the shopkeeper, not self-registered
  storeName: z.string().optional(),
  cnpj: z.string().optional(),
  cep: z.string().optional(),
  whatsapp: z.string().optional(),
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, storeName, cnpj, cep, whatsapp } = registerSchema.parse(req.body);

    console.log(`[AUTH] Tentativa de registro: ${email}`);

    const { data: existingUser } = await db.from('users').select('id, email, role').eq('email', email).single();
    if (existingUser) {
      console.log(`[AUTH] Conflito: E-mail ${email} já existe no banco. Role: ${existingUser.role}`);
      res.status(400).json({ error: 'Email já cadastrado' });
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const { data: newUser, error: userError } = await db.from('users').insert({
      name,
      email,
      phone: whatsapp || null,
      password_hash: passwordHash,
      role,
      trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }).select().single();

    if (userError) throw userError;

    const userId = newUser.id;

    // If shopkeeper, create store placeholder
    if (role === 'SHOPKEEPER') {
      const storeNameFinal = storeName || `${name}'s Store`;
      const slugify = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      let slug = slugify(storeNameFinal);

      // Ensure slug uniqueness
      const { data: existingStore } = await db.from('stores').select('id').eq('slug', slug).single();
      if (existingStore) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }

      const { error: storeError } = await db.from('stores').insert({
        tenant_id: userId,
        slug,
        name: storeNameFinal,
        category: 'Geral',
        cnpj: cnpj || null,
        cep: cep || null
      });

      if (storeError) throw storeError;

      // Create default campaign
      const { error: campaignError } = await db.from('campaigns').insert({
        tenant_id: userId,
        stamps_required: 10,
        reward_description: 'Recompensa da primeira campanha'
      });

      if (campaignError) throw campaignError;
    }
    res.status(201).json({ message: 'User created successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user } = await db.from('users').select('*').eq('email', email).single();

    if (!user || user.role === 'CLIENT' || !bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    let store = null;
    if (user.role === 'SHOPKEEPER') {
      const { data: storeData } = await db.from('stores').select('slug, name').eq('tenant_id', user.id).single();
      store = storeData;
    }

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        trialEndsAt: user.trial_ends_at,
        store: store ? { slug: store.slug, name: store.name } : undefined
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// CLIENT Login (via WhatsApp)
router.post('/client/login', async (req, res) => {
  try {
    const { whatsapp, password } = req.body;
    const { data: user } = await db.from('users').select('*').eq('phone', whatsapp).eq('role', 'CLIENT').single();

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        mustChangePassword: !!user.must_change_password
      }
    });
  } catch (error: any) {
    console.error('[AUTH] Crash no login do cliente:', error);
    res.status(500).json({ error: 'Erro interno no login: ' + error.message });
  }
});

// CLIENT Change Password (first access)
router.post('/client/change-password', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'CLIENT') return res.status(403).json({ error: 'Forbidden' });

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    const { error } = await db.from('users').update({
      password_hash: hash,
      must_change_password: false
    }).eq('id', decoded.id);

    if (error) throw error;

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
