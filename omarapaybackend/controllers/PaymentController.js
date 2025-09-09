import dotenv from 'dotenv';
import axios from 'axios';
import Stripe from 'stripe';
import crypto from 'crypto';
dotenv.config();

// Stripe (cards)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });

// Coingate
const COINGATE_KEY = (process.env.COINGATE_API_KEY || '').trim();
const mask = s => (s && s.length > 8 ? `${s.slice(0,4)}...${s.slice(-4)}` : (s ? '***' : '(none)'));
console.info('startup: using COINGATE_API_KEY=', mask(COINGATE_KEY));

const CG_API = axios.create({
  baseURL: 'https://api.coingate.com/v2',
  headers: {
    'Content-Type': 'application/json',
    ...(COINGATE_KEY ? { 'Authorization': `Token ${COINGATE_KEY}` } : {}),
  },
});

const mapCoingateStatus = (s) => {
  const v = String(s || '').toLowerCase();
  if (['paid', 'confirmed', 'finished', 'complete', 'completed', 'success'].includes(v)) return 'succeeded';
  if (['pending', 'new', 'confirming', 'processing'].includes(v)) return 'pending';
  if (['expired', 'canceled', 'cancelled', 'invalid', 'refunded', 'failed', 'rejected'].includes(v)) return 'failed';
  return v || 'pending';
};

// --- CHANGED: use only COINBASE_API_KEY (no || fallback) ---
const COINBASE_KEY = (process.env.COINBASE_API_KEY || '').trim();
const mask = s => (s && s.length > 8 ? `${s.slice(0,4)}...${s.slice(-4)}` : (s ? '***' : '(none)'));

console.info('startup: using COINBASE_API_KEY=', mask(COINBASE_KEY));

// axios instance with explicit API key header
const CC_API = axios.create({
  baseURL: 'https://api.commerce.coinbase.com',
  headers: {
    'Content-Type': 'application/json',
    'X-CC-Version': '2018-03-22',
    ...(COINBASE_KEY ? { 'X-CC-Api-Key': COINBASE_KEY } : {}),
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

// ----------------- Crypto (Coingate) -----------------
export const createCryptoCharge = async (req, res) => {
  try {
    if (!COINGATE_KEY) {
      console.error('createCryptoCharge: missing COINGATE_API_KEY');
      return res.status(500).json({ success: false, message: 'Server not configured: missing COINGATE_API_KEY' });
    }

    const { amount = '0.00', currency = 'USD', name = 'Charge', description = '', metadata = {} } = req.body || {};

    const payload = {
      price_amount: String(amount),
      price_currency: String(currency).toUpperCase(), // e.g., USD
      receive_currency: 'BTC', // change if you prefer USDT/ETH/BTC etc.
      title: name,
      description,
      // optional callbacks:
      // callback_url: process.env.COINGATE_CALLBACK_URL,
      // cancel_url: process.env.COINGATE_CANCEL_URL,
      // success_url: process.env.COINGATE_SUCCESS_URL,
      // order_id: metadata?.orderId,
    };

    const r = await CG_API.post('/orders', payload);
    if (r.status !== 201) {
      console.error('Coingate create order failed', r.status, r.data);
      return res.status(r.status).json({ success: false, message: r.data });
    }

    return res.json({
      success: true,
      chargeId: r.data?.id,
      hosted_url: r.data?.payment_url,
      status: mapCoingateStatus(r.data?.status),
      raw: r.data,
    });
  } catch (err) {
    if (err?.response) {
      console.error('Coingate create error', err.response.status, err.response.data);
      return res.status(502).json({ success: false, message: err.response.data || `Coingate error (${err.response.status})` });
    }
    console.error('createCryptoCharge error', err?.message || err);
    return res.status(500).json({ success: false, message: err?.message || 'internal' });
  }
};

export const getCryptoCharge = async (req, res) => {
  try {
    if (!COINGATE_KEY) return res.status(501).json({ success: false, message: 'COINGATE_API_KEY not configured' });
    const { id } = req.params;
    const r = await CG_API.get(`/orders/${encodeURIComponent(id)}`);
    const d = r.data || {};
    return res.json({
      success: true,
      id: d?.id,
      hosted_url: d?.payment_url || null,
      status: mapCoingateStatus(d?.status),
      raw: d,
    });
  } catch (err) {
    return res.status(err?.response?.status || 500).json({ success: false, message: err?.response?.data || err?.message || 'internal' });
  }
};

export const verifyCryptoCharge = async (req, res) => getCryptoCharge(req, res);
export const verifyCryptoOnChain = async (req, res) => getCryptoCharge(req, res);

// Optional webhook placeholder
export const coingateWebhook = (req, res) => {
  try {
    // Coingate sends callbacks without signature by default (can use Basic auth). Add validation if you configure it.
    console.info('Coingate webhook received');
    return res.status(200).send('ok');
  } catch {
    return res.status(200).send('ok');
  }
};

// ----------------- Crypto (Coinbase Commerce) -----------------
export const createCryptoCharge = async (req, res) => {
  try {
    if (!COINBASE_KEY) {
      console.error('createCryptoCharge: missing COINBASE_API_KEY');
      return res.status(500).json({ success: false, message: 'Server not configured: missing COINBASE_API_KEY' });
    }

    const payload = {
      name: req.body?.name || 'Charge',
      description: req.body?.description || '',
      local_price: { amount: String(req.body?.amount || '0.00'), currency: req.body?.currency || 'USD' },
      pricing_type: 'fixed_price',
      metadata: req.body?.metadata || {},
    };

    console.info('createCryptoCharge: posting to coinbase with key=', mask(COINBASE_KEY));
    const r = await CC_API.post('/charges', payload);
    console.info('createCryptoCharge: coinbase status=', r.status, 'id=', r.data?.data?.id);

    return res.json({ success: true, chargeId: r.data?.data?.id, hosted_url: r.data?.data?.hosted_url, raw: r.data });
  } catch (err) {
    if (err?.response) {
      console.error('createCryptoCharge: coinbase response error', err.response.status, err.response.data);
      return res.status(502).json({ success: false, message: err.response.data || `Coinbase error (${err.response.status})` });
    }
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
    // fallback: mock hosted url
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
    // Fallback mock
    const status = req.query.success === '1' ? 'succeeded' : 'pending';
    const hosted_url =
      process.env.GCASH_HOSTED_URL_BASE
        ? `${process.env.GCASH_HOSTED_URL_BASE}?ref=${id}&amount=${encodeURIComponent(req.query.amount || 0)}&currency=${String(req.query.currency || 'USD').toUpperCase()}`
        : null;
    return res.json({ success: true, id, hosted_url, status });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'internal' });
  }
};

// ----------------- Google Wallet (mock) -----------------
const googleWalletMemory = new Map();

export const createGoogleWalletPayment = async (req, res) => {
  try {
    const { amount = '0.00', currency = 'USD', description = '', metadata = {} } = req.body || {};
    const id = `gw_${crypto.randomBytes(6).toString('hex')}`;
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