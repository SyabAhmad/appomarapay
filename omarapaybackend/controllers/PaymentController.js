import dotenv from 'dotenv';
import crypto from 'crypto';
import axios from 'axios';
import Stripe from 'stripe';
dotenv.config();

// Stripe (cards)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });

// canonical key (trim whitespace)
const COINBASE_KEY = (process.env.COINBASE_API_KEY || process.env.COINBASE_COMMERCE_API_KEY || '').trim();

// create axios instance (optional) — keep but use COINBASE_KEY when sending
const CC_API = axios.create({
  baseURL: 'https://api.commerce.coinbase.com',
  headers: {
    'X-CC-Version': '2018-03-22',
    'Content-Type': 'application/json',
  },
});
const parseChargeStatus = (data) => {
  try {
    const t = data?.timeline || [];
    return String(t[t.length - 1]?.status || data?.status || 'PENDING').toLowerCase();
  } catch { return 'pending'; }
};

// GCash (Xendit) with mock fallback
const hasXendit = !!process.env.XENDIT_SECRET_KEY;

// ----------------- Card (Stripe) -----------------
export const createCardPayment = async (req, res) => {
  try {
    const { amount = '0.00', currency = 'usd', metadata = {} } = req.body || {};
    const cents = Math.round(Number(amount) * 100);
    const pi = await stripe.paymentIntents.create({
      amount: cents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });
    return res.json({ success: true, id: pi.id, clientSecret: pi.client_secret });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'internal' });
  }
};

export const getCardPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const pi = await stripe.paymentIntents.retrieve(id);
    return res.json({
      success: true,
      id: pi.id,
      status: pi.status,
      amount: (pi.amount || 0) / 100,
      currency: pi.currency,
    });
  } catch (err) {
    return res.status(404).json({ success: false, message: err?.message || 'not found' });
  }
};

export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event = req.body;
    if (secret) {
      event = Stripe.webhooks.constructEvent(req.body, sig, secret);
    }
    // Optionally log
    try { console.log('Stripe event:', event?.type, event?.data?.object?.id); } catch {}
    return res.status(200).send('ok');
  } catch (e) {
    return res.status(400).send('invalid signature');
  }
};

// ----------------- Crypto (Coinbase Commerce) -----------------
export const createCryptoCharge = async (req, res) => {
  try {
    if (!COINBASE_KEY) {
      console.error('createCryptoCharge: missing COINBASE key env var');
      return res.status(500).json({ success: false, message: 'Server not configured: missing COINBASE key' });
    }

    // masked log so you can confirm which key the process has
    const masked = COINBASE_KEY.length > 8 ? `${COINBASE_KEY.slice(0,4)}...${COINBASE_KEY.slice(-4)}` : '***';
    console.info('createCryptoCharge: using coinbase key:', masked);

    const payload = {
      name: req.body?.name || 'Charge',
      local_price: { amount: String(req.body?.amount || '0.00'), currency: req.body?.currency || 'USD' },
      pricing_type: 'fixed_price',
      metadata: req.body?.metadata || {},
    };

    // explicit fetch with header from COINBASE_KEY
    const r = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': COINBASE_KEY,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => null);
    console.info('createCryptoCharge: coinbase status=', r.status, 'body=', j);

    if (!r.ok) {
      return res.status(502).json({ success: false, message: j || `Coinbase error (${r.status})` });
    }

    return res.json({ success: true, data: j });
  } catch (err) {
    console.error('createCryptoCharge error', err?.message || err);
    return res.status(500).json({ success: false, message: err?.message || 'internal' });
  }
};

export const getCryptoCharge = async (req, res) => {
  try {
    if (!process.env.COINBASE_API_KEY) return res.status(501).json({ success: false, message: 'COINBASE_API_KEY not configured' });
    const { id } = req.params;
    const resp = await CC_API.get(`/charges/${encodeURIComponent(id)}`);
    const data = resp?.data?.data;
    return res.json({ success: true, id: data?.id, hosted_url: data?.hosted_url || null, status: parseChargeStatus(data) });
  } catch (err) {
    return res.status(err?.response?.status || 500).json({ success: false, message: err?.response?.data || err?.message || 'internal' });
  }
};

export const verifyCryptoCharge = async (req, res) => getCryptoCharge(req, res);
export const verifyCryptoOnChain = async (req, res) => getCryptoCharge(req, res);

export const coinbaseWebhook = (req, res) => {
  try {
    const secret = process.env.COINBASE_WEBHOOK_SECRET || '';
    const signature = req.headers['x-cc-webhook-signature'];
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
    if (secret) {
      const digest = crypto.createHmac('sha256', secret).update(raw).digest('hex');
      if (signature !== digest) return res.status(400).send('invalid signature');
    }
    try { console.log('Coinbase webhook received'); } catch {}
    return res.status(200).send('ok');
  } catch {
    return res.status(200).send('ok');
  }
};

// ----------------- GCash (Xendit/mock) -----------------
export const createGcashPayment = async (req, res) => {
  try {
    const { amount = '0.00', currency = 'USD', description = '', metadata = {} } = req.body || {};
    if (hasXendit) {
      const usdToPhp = Number(process.env.USD_TO_PHP || 58);
      const amountPhp = currency?.toUpperCase() === 'PHP' ? Number(amount) : Number(amount) * usdToPhp;
      const centavos = Math.round(amountPhp * 100);
      const reference_id = `gc_${crypto.randomBytes(6).toString('hex')}`;
      const payload = {
        reference_id,
        currency: 'PHP',
        amount: centavos,
        channel_code: 'GCASH',
        channel_properties: {
          success_redirect_url: process.env.GCASH_SUCCESS_URL || 'https://example.com/success',
          failure_redirect_url: process.env.GCASH_FAILURE_URL || 'https://example.com/failed',
        },
        metadata: { ...metadata, description },
      };
      const resp = await axios.post('https://api.xendit.co/ewallets/charges', payload, {
        auth: { username: process.env.XENDIT_SECRET_KEY, password: '' },
      });
      const d = resp.data;
      const hosted_url = d?.actions?.mobile_web_checkout_url || d?.actions?.desktop_web_checkout_url || d?.checkout_url || null;
      return res.json({ success: true, id: d?.id || reference_id, hosted_url, status: (d?.status || 'PENDING').toLowerCase() });
    }
    // fallback: no hosted url when not configured
    const id = `gc_${crypto.randomBytes(6).toString('hex')}`;
    const hosted_url =
      process.env.GCASH_HOSTED_URL_BASE
        ? `${process.env.GCASH_HOSTED_URL_BASE}?ref=${id}&amount=${encodeURIComponent(amount)}&currency=${currency}`
        : `https://pay.gcash.com/app/pay?ref=${id}&amount=${encodeURIComponent(amount)}&currency=${currency}`;
    return res.json({ success: true, id, hosted_url, status: 'pending' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'internal' });
  }
};

export const getGcashStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'missing id' });
    if (hasXendit) {
      const resp = await axios.get(`https://api.xendit.co/ewallets/charges/${id}`, {
        auth: { username: process.env.XENDIT_SECRET_KEY, password: '' },
      });
      const data = resp.data;
      const status = (data?.status || 'PENDING').toLowerCase();
      const hosted_url =
        data?.actions?.mobile_web_checkout_url ||
        data?.actions?.desktop_web_checkout_url ||
        data?.checkout_url ||
        null;
      return res.json({ success: true, status, hosted_url });
    }
    // Fallback: mock memory (not persisted)
    const idPrefix = 'gc_';
    if (!id.startsWith(idPrefix)) return res.status(404).json({ success: false, message: 'not found' });
    const amount = Number(req.query.amount) || 0;
    const currency = String(req.query.currency || 'USD').toUpperCase();
    const status = req.query.success === '1' ? 'succeeded' : 'pending';
    const hosted_url =
      process.env.GCASH_HOSTED_URL_BASE
        ? `${process.env.GCASH_HOSTED_URL_BASE}?ref=${id}&amount=${encodeURIComponent(amount)}&currency=${currency}`
        : `https://pay.gcash.com/app/pay?ref=${id}&amount=${encodeURIComponent(amount)}&currency=${currency}`;
    return res.json({ success: true, id, hosted_url, status, amount, currency });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'internal' });
  }
};

export const createGoogleWalletPayment = async (req, res) => {
  try {
    const { amount = '0.00', currency = 'USD', description = '', metadata = {} } = req.body || {};
    const id = `gw_${crypto.randomBytes(6).toString('hex')}`;
    // placeholder hosted URL (replace with provider checkout/deeplink when available)
    const hosted_url = `https://pay.google.com/gp/p/ui/pay?ref=${id}&amount=${encodeURIComponent(amount)}&currency=${currency}`;
    const record = { status: 'pending', amount, currency, description, metadata, hosted_url, createdAt: Date.now() };
    googleWalletMemory.set(id, record);
    return res.json({ success: true, id, hosted_url, status: record.status });
  } catch (err) {
    console.error('createGoogleWalletPayment', err?.message || err);
    res.status(500).json({ success: false, message: err?.message || 'internal' });
  }
};

export const getGoogleWalletStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'missing id' });
    const rec = googleWalletMemory.get(id);
    if (!rec) return res.status(404).json({ success: false, message: 'not found' });
    // test-only: force success with ?success=1
    if (req.query.success === '1' && rec.status !== 'succeeded') {
      rec.status = 'succeeded';
      googleWalletMemory.set(id, rec);
    }
    return res.json({ success: true, status: rec.status, hosted_url: rec.hosted_url, amount: rec.amount, currency: rec.currency });
  } catch (err) {
    console.error('getGoogleWalletStatus', err?.message || err);
    res.status(500).json({ success: false, message: err?.message || 'internal' });
  }
};