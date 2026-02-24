import express from 'express';
import db from '../db.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { addSeconds, addMinutes, format } from 'date-fns';

const router = express.Router();

// List My Cards
// List My Cards
router.get('/cards', authenticate, requireRole(['CLIENT']), async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  try {
    // 1. Fetch Loyalty Cards with Store info
    const { data: cards, error: cardsError } = await db.from('loyalty_cards')
      .select(`
        *,
        store:stores!inner(name, logo_url, slug)
      `)
      .eq('user_id', userId);

    if (cardsError) throw cardsError;

    // 2. Fetch Campaigns for those stores
    const storeIds = (cards || []).map((c: any) => c.tenant_id);
    const { data: campaigns } = await db.from('campaigns')
      .select('tenant_id, stamps_required, reward_description, reward_image_url, expires_at, rules_config')
      .in('tenant_id', storeIds);

    // Transform to match previous format for frontend compatibility
    const formattedCards = (cards || []).map((c: any) => {
      const campaign = (campaigns || []).find((camp: any) => camp.tenant_id === c.tenant_id);
      return {
        ...c,
        store_name: c.store?.name || 'Loja',
        logo_url: c.store?.logo_url || null,
        store_slug: c.store?.slug || '',
        stamps_required: campaign?.stamps_required || 10,
        reward_description: campaign?.reward_description || '',
        reward_image_url: campaign?.reward_image_url || null,
        expires_at: campaign?.expires_at || null,
        rules_config: campaign?.rules_config || null
      };
    });

    res.json(formattedCards);
  } catch (error: any) {
    console.error('Erro ao buscar cartões:', error);
    res.status(500).json({ error: 'Erro ao buscar cartões: ' + error.message });
  }
});

// Get Card Details (handles :tenantId or :slug)
// Get Card Details (handles :tenantId or :slug)
router.get('/cards/:identifier', authenticate, requireRole(['CLIENT']), async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const identifier = req.params.identifier;

  try {
    // Try to find the store first either by tenant_id or slug
    let query = db.from('stores').select('*');
    if (/^\d+$/.test(identifier)) {
      query = query.or(`tenant_id.eq.${identifier},slug.eq.${identifier}`);
    } else {
      query = query.eq('slug', identifier);
    }

    const { data: store, error: storeError } = await query.single();

    if (storeError || !store) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    const tenantId = store.tenant_id;

    const { data: card, error: cardError } = await db.from('loyalty_cards')
      .select(`
        *,
        store:stores!inner(name, logo_url, slug)
      `)
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (cardError) throw cardError;

    const { data: campaign } = await db.from('campaigns')
      .select('stamps_required, reward_description, reward_image_url, expires_at, rules_config')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (!card) {
      res.json({
        tenant_id: tenantId,
        store_name: store.name,
        logo_url: store.logo_url,
        store_slug: store.slug,
        stamps_required: campaign?.stamps_required || 10,
        reward_description: campaign?.reward_description,
        reward_image_url: campaign?.reward_image_url || null,
        expires_at: campaign?.expires_at || null,
        rules_config: campaign?.rules_config || null,
        current_stamps: 0,
        completed_cycles: 0,
        is_new: true
      });
      return;
    }

    // Get recent transactions
    const { data: transactions } = await db.from('stamp_transactions')
      .select('*')
      .eq('loyalty_card_id', card.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Format for frontend
    const formattedCard = {
      ...card,
      store_name: card.store.name,
      logo_url: card.store.logo_url,
      store_slug: card.store.slug,
      stamps_required: campaign?.stamps_required || 10,
      reward_description: campaign?.reward_description || '',
      reward_image_url: campaign?.reward_image_url || null,
      expires_at: campaign?.expires_at || null,
      rules_config: campaign?.rules_config || null,
      transactions: transactions || []
    };

    res.json(formattedCard);
  } catch (error: any) {
    console.error('Erro ao buscar detalhes do cartão:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do cartão: ' + error.message });
  }
});

// Generate Code
router.post('/generate-code', authenticate, requireRole(['CLIENT']), async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { type } = req.body; // STAMP or REDEEM

  // Generate 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Expiration
  const now = new Date();
  const expiresAt = type === 'STAMP' ? addSeconds(now, 60) : addMinutes(now, 5);

  try {
    const { error } = await db.from('temporary_codes').insert({
      user_id: userId,
      code_hash: code,
      expires_at: expiresAt.toISOString(),
      type
    });

    if (error) throw error;

    res.json({ code, expiresAt, type });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar código' });
  }
});

// List Client Rewards History
router.get('/rewards', authenticate, requireRole(['CLIENT']), async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  try {
    // Get all loyalty cards for this user
    const { data: cards, error: cardsError } = await db.from('loyalty_cards')
      .select('id, tenant_id, current_stamps, store:stores!inner(name, logo_url, slug)')
      .eq('user_id', userId);

    if (cardsError) throw cardsError;

    if (!cards || cards.length === 0) {
      return res.json({ redemptions: [], cards: [] });
    }

    const cardIds = cards.map((c: any) => c.id);
    const storeIds = cards.map((c: any) => c.tenant_id);

    // Get REDEEM transactions
    const { data: transactions, error: txError } = await db.from('stamp_transactions')
      .select('*')
      .in('loyalty_card_id', cardIds)
      .eq('type', 'REDEEM')
      .order('created_at', { ascending: false });

    if (txError) throw txError;

    // Get campaigns
    const { data: campaigns } = await db.from('campaigns')
      .select('tenant_id, stamps_required, reward_description, expires_at, rules_config')
      .in('tenant_id', storeIds);

    // Map transactions with store info
    const redemptions = (transactions || []).map((tx: any) => {
      const card = cards.find((c: any) => c.id === tx.loyalty_card_id);
      const campaign = (campaigns || []).find((camp: any) => camp.tenant_id === card?.tenant_id);
      return {
        id: tx.id,
        created_at: tx.created_at,
        store_name: (card?.store as any)?.name || 'Loja',
        logo_url: (card?.store as any)?.logo_url || null,
        store_slug: (card?.store as any)?.slug || '',
        reward_description: campaign?.reward_description || '',
        stamps_required: campaign?.stamps_required || 10,
        expires_at: campaign?.expires_at || null,
        rules_config: campaign?.rules_config || null
      };
    });

    // Card summaries for overview
    const cardSummaries = cards.map((c: any) => {
      const campaign = (campaigns || []).find((camp: any) => camp.tenant_id === c.tenant_id);
      return {
        id: c.id,
        store_name: (c.store as any)?.name || 'Loja',
        logo_url: (c.store as any)?.logo_url || null,
        store_slug: (c.store as any)?.slug || '',
        current_stamps: c.current_stamps,
        stamps_required: campaign?.stamps_required || 10,
        reward_description: campaign?.reward_description || '',
        expires_at: campaign?.expires_at || null,
        rules_config: campaign?.rules_config || null
      };
    });

    res.json({ redemptions, cards: cardSummaries });
  } catch (error: any) {
    console.error('Erro ao buscar recompensas:', error);
    res.status(500).json({ error: 'Erro ao buscar recompensas: ' + error.message });
  }
});

// List All Stores (For "Explorar Lojas")
router.get('/stores', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data: stores, error } = await db.from('stores')
      .select(`
        tenant_id,
        slug,
        name,
        category,
        logo_url
      `)
      .eq('status', 'ACTIVE');

    if (error) throw error;

    // Fetch all campaigns for these stores
    const storeIds = (stores || []).map((s: any) => s.tenant_id);
    const { data: campaigns } = await db.from('campaigns')
      .select('tenant_id, reward_description')
      .in('tenant_id', storeIds);

    const formattedStores = (stores || []).map((s: any) => {
      const campaign = (campaigns || []).find((c: any) => c.tenant_id === s.tenant_id);
      return {
        tenant_id: s.tenant_id,
        slug: s.slug,
        name: s.name,
        category: s.category,
        logo_url: s.logo_url,
        reward_description: campaign?.reward_description || 'Peça seu carimbo e ganhe recompensas!'
      };
    });

    res.json(formattedStores);
  } catch (error: any) {
    console.error('Erro ao buscar lojas:', error);
    res.status(500).json({ error: 'Erro ao buscar lojas: ' + error.message });
  }
});

// Public Store Info (for marketing links)
router.get('/public/card/:identifier', async (req, res) => {
  const identifier = req.params.identifier;

  try {
    let query = db.from('stores').select('tenant_id, name, logo_url, slug');
    if (/^\d+$/.test(identifier)) {
      query = query.or(`slug.eq.${identifier},tenant_id.eq.${identifier}`);
    } else {
      query = query.eq('slug', identifier);
    }

    const { data: store, error: storeError } = await query.single();

    if (storeError || !store) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    const { data: campaign } = await db.from('campaigns')
      .select('stamps_required, reward_description, reward_image_url, expires_at, rules_config')
      .eq('tenant_id', store.tenant_id)
      .single();

    res.json({
      store_name: store.name,
      logo_url: store.logo_url,
      store_slug: store.slug,
      stamps_required: campaign?.stamps_required || 10,
      reward_description: campaign?.reward_description,
      reward_image_url: campaign?.reward_image_url || null,
      expires_at: campaign?.expires_at || null,
      rules_config: campaign?.rules_config || null,
      is_public: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar informações da loja' });
  }
});

export default router;
