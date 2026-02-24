import express from 'express';
import db from '../db';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get Global Stats
// Get Global Stats
router.get('/stats', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { count: totalUsers } = await db.from('users').select('*', { count: 'exact', head: true });
    const { count: totalStores } = await db.from('stores').select('*', { count: 'exact', head: true });
    const { count: totalStamps } = await db.from('stamp_transactions').select('*', { count: 'exact', head: true }).eq('type', 'STAMP');

    const { data: stores, error } = await db.from('stores')
      .select(`
        *,
        owner:users!inner(name, email, phone, address)
      `);

    if (error) throw error;

    const formattedStores = stores.map((s: any) => ({
      ...s,
      owner_name: s.owner.name,
      owner_email: s.owner.email,
      owner_phone: s.owner.phone,
      owner_address: s.owner.address
    }));

    res.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalStores: totalStores || 0,
        totalStamps: totalStamps || 0
      },
      stores: formattedStores
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar estatísticas globais' });
  }
});

// Toggle Store Status
// Toggle Store Status
router.put('/store/:id/status', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body; // ACTIVE or SUSPENDED

  try {
    const { error } = await db.from('stores').update({ status }).eq('id', id);
    if (error) throw error;
    res.json({ message: 'Store status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status da loja' });
  }
});

// Delete Store and all associated data
// Delete Store and all associated data
router.delete('/store/:id', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const { data: store, error: fetchError } = await db.from('stores').select('tenant_id').eq('id', id).single();
    if (fetchError || !store) return res.status(404).json({ error: 'Loja não encontrada' });

    const tenantId = store.tenant_id;

    // 1. Delete stamp transactions
    const { data: cards } = await db.from('loyalty_cards').select('id').eq('tenant_id', tenantId);
    if (cards && cards.length > 0) {
      const cardIds = cards.map(c => c.id);
      await db.from('stamp_transactions').delete().in('loyalty_card_id', cardIds);
    }

    // 2. Delete loyalty cards
    await db.from('loyalty_cards').delete().eq('tenant_id', tenantId);

    // 3. Delete campaigns
    await db.from('campaigns').delete().eq('tenant_id', tenantId);

    // 4. Delete temporary codes
    await db.from('temporary_codes').delete().eq('user_id', tenantId);

    // 5. Delete the store
    await db.from('stores').delete().eq('id', id);

    // 6. Delete the shopkeeper user
    await db.from('users').delete().eq('id', tenantId);

    res.json({ message: 'Loja e todos os dados vinculados foram deletados com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao deletar loja: ' + error.message });
  }
});

// Get Store Customers (Admin view)
router.get('/store/:id/customers', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  const { id } = req.params; // Store ID

  try {
    const { data: store } = await db.from('stores').select('tenant_id').eq('id', id).single();
    if (!store) return res.status(404).json({ error: 'Loja não encontrada' });

    const { data: customers, error } = await db.from('loyalty_cards')
      .select(`
        id,
        current_stamps,
        completed_cycles,
        status,
        last_stamp_at,
        created_at,
        user:users!inner(id, name, email, phone)
      `)
      .eq('tenant_id', store.tenant_id);

    if (error) throw error;
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes da loja' });
  }
});

// Update Store Info (Admin)
router.put('/store/:id', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, slug, category, cnpj, cep } = req.body;

  try {
    const { error } = await db.from('stores').update({
      name,
      slug: slug || null,
      category: category || null,
      cnpj: cnpj || null,
      cep: cep || null
    }).eq('id', id);

    if (error) throw error;
    res.json({ message: 'Dados da loja atualizados com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar loja: ' + error.message });
  }
});

// Update User Info (Admin)
router.put('/user/:id', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  try {
    const { error } = await db.from('users').update({
      name,
      email: email || null,
      phone: phone || null,
      address: address || null
    }).eq('id', id);

    if (error) throw error;
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar usuário: ' + error.message });
  }
});

// Reset User Password (Admin)
router.post('/user/:id/reset-password', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
  }

  try {
    const { bcrypt } = await import('bcryptjs' as any); // Dynamic import for simplicity in route
    const salt = await (await import('bcryptjs' as any)).genSalt(10);
    const hash = await (await import('bcryptjs' as any)).hash(password, salt);

    const { error } = await db.from('users').update({
      password_hash: hash,
      must_change_password: true
    }).eq('id', id);

    if (error) throw error;
    res.json({ message: 'Senha resetada com sucesso' });
  } catch (error: any) {
    // Falls back to direct require if dynamic import fails or just use global if available
    const bcryptLocal = require('bcryptjs');
    const hash = bcryptLocal.hashSync(password, 10);
    await db.from('users').update({ password_hash: hash, must_change_password: true }).eq('id', id);
    res.json({ message: 'Senha resetada com sucesso' });
  }
});

export default router;
