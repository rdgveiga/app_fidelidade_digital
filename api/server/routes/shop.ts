import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

const router = express.Router();

// Get Shop Dashboard Stats
// Get Shop Dashboard Stats
router.get('/dashboard', authenticate, requireRole(['SHOPKEEPER']), async (req: AuthRequest, res) => {
  const tenantId = req.user!.id;

  try {
    const { data: store } = await db.from('stores').select('*').eq('tenant_id', tenantId).single();
    const { data: campaign } = await db.from('campaigns').select('*, expires_at').eq('tenant_id', tenantId).single();

    const { count: activeCards } = await db.from('loyalty_cards').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId);
    const { count: totalStamps } = await db.from('stamp_transactions').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('type', 'STAMP');
    const { count: totalRedeems } = await db.from('stamp_transactions').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('type', 'REDEEM');

    res.json({
      store,
      campaign,
      stats: {
        activeCards: activeCards || 0,
        totalStamps: totalStamps || 0,
        totalRedeems: totalRedeems || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
});

// Upload Logo
router.post('/upload-logo', authenticate, requireRole(['SHOPKEEPER']), upload.single('logo'), async (req: AuthRequest, res) => {
  const tenantId = req.user!.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  try {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${tenantId}-${Date.now()}.${fileExt}`;
    const filePath = fileName; // No bucket, salvamos direto na raiz do bucket 'logos'

    const { error: uploadError } = await db.storage
      .from('logos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = db.storage.from('logos').getPublicUrl(filePath);

    // Update store logo_url
    const { error: updateError } = await db.from('stores').update({ logo_url: publicUrl }).eq('tenant_id', tenantId);
    if (updateError) throw updateError;

    res.json({ message: 'Logo atualizada com sucesso', url: publicUrl });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao fazer upload da logo: ' + error.message });
  }
});

// Upload Reward Image
router.post('/upload-reward-image', authenticate, requireRole(['SHOPKEEPER']), upload.single('image'), async (req: AuthRequest, res) => {
  const tenantId = req.user!.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  try {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `reward-${tenantId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await db.storage
      .from('logos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = db.storage.from('logos').getPublicUrl(fileName);

    const { error: updateError } = await db.from('campaigns')
      .update({ reward_image_url: publicUrl })
      .eq('tenant_id', tenantId);
    if (updateError) throw updateError;

    res.json({ message: 'Imagem enviada com sucesso', url: publicUrl });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao fazer upload da imagem: ' + error.message });
  }
});

// Update Campaign
router.put('/campaign', authenticate, requireRole(['SHOPKEEPER']), async (req: AuthRequest, res) => {
  const tenantId = req.user!.id;
  const { stamps_required, reward_description, active, reward_image_url, expires_at, rules_config } = req.body;

  try {
    const updateData: any = { stamps_required, reward_description, active: !!active };
    if (reward_image_url !== undefined) updateData.reward_image_url = reward_image_url;
    if (expires_at !== undefined) updateData.expires_at = expires_at;
    if (rules_config !== undefined) updateData.rules_config = rules_config;

    const { error } = await db.from('campaigns').update(updateData).eq('tenant_id', tenantId);

    if (error) throw error;
    res.json({ message: 'Campaign updated' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar campanha' });
  }
});

// Validate Code (Stamp or Redeem)
router.post('/validate-code', authenticate, requireRole(['SHOPKEEPER']), async (req: AuthRequest, res) => {
  const tenantId = req.user!.id;
  const { code, force } = req.body; // 6 digit code, optional force flag for override

  try {
    const { data: tempCode, error: fetchError } = await db.from('temporary_codes')
      .select('*')
      .eq('code_hash', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !tempCode) {
      res.status(400).json({ error: 'Código inválido ou expirado.' });
      return;
    }

    const userId = tempCode.user_id;
    const type = tempCode.type; // STAMP or REDEEM

    // 1. Get Campaign Rules
    const { data: campaign } = await db.from('campaigns').select('*').eq('tenant_id', tenantId).single();
    if (!campaign) throw new Error('Campanha não configurada');

    // 2. Check Campaign Expiration
    if (campaign.expires_at && new Date(campaign.expires_at) < new Date()) {
      return res.status(400).json({
        error: 'Esta campanha já expirou.',
        code: 'CAMPAIGN_EXPIRED'
      });
    }

    // 3. Get or Create Loyalty Card
    let { data: card } = await db.from('loyalty_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (!card) {
      const { data: newCard, error: cardError } = await db.from('loyalty_cards')
        .insert({ user_id: userId, tenant_id: tenantId })
        .select()
        .single();
      if (cardError) throw cardError;
      card = newCard;
    }

    // 4. Cooldown Validation (Only for STAMP)
    if (type === 'STAMP' && !force) {
      const rules = (campaign.rules_config || {}) as any;
      const cooldownHours = rules.cooldown_hours || 0;

      if (cooldownHours > 0 && card.last_stamp_at) {
        const lastStamp = new Date(card.last_stamp_at).getTime();
        const now = new Date().getTime();
        const hoursSinceLast = (now - lastStamp) / (1000 * 60 * 60);

        if (hoursSinceLast < cooldownHours) {
          const minutesLeft = Math.ceil((cooldownHours - hoursSinceLast) * 60);
          return res.json({
            success: false,
            warning: 'DOUBLE_STAMP_DETECTION',
            message: `Este cliente já carimbou recentemente.`,
            last_stamp_at: card.last_stamp_at,
            cooldown_hours: cooldownHours
          });
        }
      }
    }

    // 5. Mark code as used
    await db.from('temporary_codes').update({ used: true }).eq('id', tempCode.id);

    // Fetch customer name
    const { data: customerUser } = await db.from('users').select('id, name').eq('id', userId).single();

    if (type === 'STAMP') {
      const { error: updateError } = await db.from('loyalty_cards')
        .update({
          current_stamps: card.current_stamps + 1,
          last_stamp_at: new Date().toISOString()
        })
        .eq('id', card.id);
      if (updateError) throw updateError;

      await db.from('stamp_transactions').insert({
        loyalty_card_id: card.id,
        tenant_id: tenantId,
        type: 'STAMP'
      });

      res.json({
        success: true,
        message: 'Carimbo adicionado com sucesso!',
        newStamps: card.current_stamps + 1,
        customer: { id: customerUser?.id, name: customerUser?.name }
      });
    } else if (type === 'REDEEM') {
      if (card.current_stamps < campaign.stamps_required) {
        throw new Error(`Selos insuficientes. Necessário: ${campaign.stamps_required}`);
      }

      await db.from('loyalty_cards').update({
        current_stamps: 0,
        completed_cycles: card.completed_cycles + 1
      }).eq('id', card.id);

      await db.from('stamp_transactions').insert({
        loyalty_card_id: card.id,
        tenant_id: tenantId,
        type: 'REDEEM'
      });

      res.json({
        success: true,
        message: 'Recompensa resgatada com sucesso!',
        customer: { id: customerUser?.id, name: customerUser?.name }
      });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get Recent Activity (stamp/redeem events with customer info)
router.get('/recent-activity', authenticate, requireRole(['SHOPKEEPER']), async (req: AuthRequest, res) => {
  const tenantId = req.user!.id;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const { data, error } = await db.from('stamp_transactions')
      .select(`
        id,
        type,
        created_at,
        loyalty_card:loyalty_cards!inner(
          id,
          user_id,
          user:users!inner(id, name)
        )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const activity = (data || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      created_at: t.created_at,
      customer_id: t.loyalty_card?.user?.id,
      customer_name: t.loyalty_card?.user?.name,
    }));

    res.json({ activity });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atividade recente' });
  }
});

// Get Customers List for Shopkeeper
router.get('/customers', authenticate, requireRole(['SHOPKEEPER']), async (req: AuthRequest, res) => {
  const tenantId = req.user!.id;
  const search = (req.query.search as string) || '';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = (req.query.status as string) || 'all';
  const offset = (page - 1) * limit;

  try {
    let query = db.from('loyalty_cards')
      .select(`
        id,
        current_stamps,
        completed_cycles,
        status,
        last_stamp_at,
        created_at,
        user:users!inner(id, name, email, phone)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`, { foreignTable: 'users' });
    }

    if (status === 'active') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.eq('status', 'ACTIVE').gte('last_stamp_at', thirtyDaysAgo);
    } else if (status === 'inactive') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.eq('status', 'ACTIVE').or(`last_stamp_at.lt.${thirtyDaysAgo},last_stamp_at.is.null`);
    } else if (status === 'archived') {
      query = query.eq('status', 'ARCHIVED');
    } else {
      query = query.eq('status', 'ACTIVE');
    }

    const { data: rawCustomers, count, error } = await query
      .order('last_stamp_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Transform data to match original format
    const customers = await Promise.all((rawCustomers || []).map(async (c: any) => {
      const { count: totalStamps } = await db.from('stamp_transactions').select('*', { count: 'exact', head: true }).eq('loyalty_card_id', c.id).eq('type', 'STAMP');
      const { count: totalRedeems } = await db.from('stamp_transactions').select('*', { count: 'exact', head: true }).eq('loyalty_card_id', c.id).eq('type', 'REDEEM');

      return {
        user_id: c.user.id,
        name: c.user.name,
        email: c.user.email,
        phone: c.user.phone,
        card_id: c.id,
        current_stamps: c.current_stamps,
        completed_cycles: c.completed_cycles,
        status: c.status,
        last_stamp_at: c.last_stamp_at,
        card_created_at: c.created_at,
        total_stamps: totalStamps || 0,
        total_redeems: totalRedeems || 0
      };
    }));

    const { data: campaign } = await db.from('campaigns').select('stamps_required').eq('tenant_id', tenantId).single();

    // Stats
    const { count: totalCount } = await db.from('loyalty_cards').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeCount } = await db.from('loyalty_cards').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).gte('last_stamp_at', thirtyDaysAgo);

    res.json({
      customers,
      stampsRequired: campaign?.stamps_required || 10,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: {
        totalCustomers: totalCount || 0,
        activeCustomers: activeCount || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Check if a CLIENT exists by phone
router.get('/customers/check', authenticate, requireRole(['SHOPKEEPER']), async (req: AuthRequest, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'WhatsApp é obrigatório' });

  try {
    const { data: client } = await db.from('users').select('id, name').eq('phone', phone).eq('role', 'CLIENT').single();

    if (client) {
      res.json({ exists: true, client: { id: client.id, name: client.name } });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.json({ exists: false });
  }
});

// Link an existing CLIENT to this store
router.post('/customers/link', authenticate, requireRole(['SHOPKEEPER']), async (req: AuthRequest, res) => {
  const tenantId = req.user!.id;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'ID do cliente é obrigatório' });

  try {
    const { data: existingCard } = await db.from('loyalty_cards')
      .select('id')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (existingCard) {
      return res.status(400).json({ error: 'Cliente já possui cartão nesta loja' });
    }

    const { error } = await db.from('loyalty_cards').insert({ user_id: userId, tenant_id: tenantId });
    if (error) throw error;

    res.json({ message: 'Cliente vinculado com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao vincular cliente' });
  }
});

// Create a new CLIENT for this store
router.post('/customers', authenticate, requireRole(['SHOPKEEPER']), async (req: AuthRequest, res) => {
  const tenantId = req.user!.id;
  let { name, phone, email, address, password } = req.body;
  if (!password) password = '123456';

  if (!name || !phone) {
    res.status(400).json({ error: 'Nome e WhatsApp são obrigatórios' });
    return;
  }

  try {
    const { data: existingByPhone } = await db.from('users').select('id').eq('phone', phone).single();
    if (existingByPhone) {
      return res.status(400).json({ error: 'Este número de WhatsApp já está cadastrado no sistema.' });
    }

    // Generate password hash
    if (!password) password = '123456';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('SHOP: Creating customer for tenant:', tenantId);

    // 1. Create User
    const { data: newUser, error: userError } = await db.from('users').insert({
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      password_hash: passwordHash,
      role: 'CLIENT',
      must_change_password: true
    }).select().single();

    if (userError) {
      console.error('SHOP: Error creating user:', userError);
      throw userError;
    }

    console.log('SHOP: User created with ID:', newUser.id);

    // 2. Create Loyalty Card
    const { error: cardError } = await db.from('loyalty_cards').insert({
      user_id: newUser.id,
      tenant_id: tenantId
    });

    if (cardError) {
      console.error('SHOP: Error creating loyalty card:', cardError);
      // Even if card creation fails, the user was created.
      // But we should report this clearly.
      throw new Error('Usuário criado, mas erro ao vincular cartão fidelidade.');
    }

    console.log('SHOP: Loyalty card created successfully');

    res.status(201).json({
      message: 'Cliente cadastrado com sucesso!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (error: any) {
    console.error('Create customer exception:', error);
    res.status(error.status || 400).json({ error: error.message || 'Erro ao cadastrar cliente' });
  }
});

// Update Customer Details
router.put('/customers/:userId', authenticate, requireRole(['SHOPKEEPER']), async (req: AuthRequest, res) => {
  const { userId } = req.params;
  const { name, phone, email, address } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Nome e WhatsApp são obrigatórios' });
  }

  try {
    // Check if phone belongs to another user
    const { data: existing } = await db.from('users').select('id').eq('phone', phone).neq('id', userId).single();
    if (existing) {
      return res.status(400).json({ error: 'Este número de WhatsApp já está em uso por outro usuário.' });
    }

    const { error } = await db.from('users').update({
      name,
      phone,
      email: email || null,
      address: address || null
    }).eq('id', userId);

    if (error) throw error;

    res.json({ message: 'Cliente atualizado com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar cliente' });
  }
});

// Update Loyalty Card Status (Archive/Unarchive)
router.patch('/customers/card/:cardId/status', authenticate, requireRole(['SHOPKEEPER']), async (req: AuthRequest, res) => {
  const tenantId = req.user!.id;
  const { cardId } = req.params;
  const { status } = req.body;

  if (!['ACTIVE', 'ARCHIVED'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  try {
    const { data, error } = await db.from('loyalty_cards')
      .update({ status })
      .eq('id', cardId)
      .eq('tenant_id', tenantId)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    res.json({ message: status === 'ARCHIVED' ? 'Cliente arquivado' : 'Cliente restaurado' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar status' });
  }
});

// Delete Loyalty Card (Remove from store)
router.delete('/customers/card/:cardId', authenticate, requireRole(['SHOPKEEPER']), async (req: AuthRequest, res) => {
  const tenantId = req.user!.id;
  const { cardId } = req.params;

  try {
    const { error, count } = await db.from('loyalty_cards')
      .delete({ count: 'exact' })
      .eq('id', cardId)
      .eq('tenant_id', tenantId);

    if (error || count === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    res.json({ message: 'Cliente removido desta loja' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao remover cliente' });
  }
});

export default router;
