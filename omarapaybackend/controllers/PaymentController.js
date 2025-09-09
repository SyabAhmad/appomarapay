import dotenv from 'dotenv';
import axios from 'axios';
import Stripe from 'stripe';
import crypto from 'crypto';

dotenv.config();

// Helpers
const mask = (s) => (s && s.length > 8 ? `${s.slice(0,4)}...${s.slice(-4)}` : (s ? '***' : '(none)'));

// --- Coingate LIVE base ---
const COINGATE_KEY = (process.env.COINGATE_API_KEY || '').trim();
const COINGATE_BASE = 'https://api.coingate.com/v2';
console.info('startup: Coingate base=', COINGATE_BASE, 'key=', mask(COINGATE_KEY));

const CG_API = axios.create({
  baseURL: COINGATE_BASE,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(COINGATE_KEY ? { Authorization: `Token ${COINGATE_KEY}` } : {}),
  },
});

const mapCoingateStatus = (s) => {
  const v = String(s || '').toLowerCase();
  if (['paid', 'confirmed', 'finished', 'complete', 'completed', 'success'].includes(v)) return 'succeeded';
  if (['pending', 'new', 'confirming', 'processing'].includes(v)) return 'pending';
  if (['expired', 'canceled', 'cancelled', 'invalid', 'refunded', 'failed', 'rejected'].includes(v)) return 'failed';
  return v || 'pending';
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
    try { console.log('Stripe event:', event?.type, event?.data?.object?.id); } catch {}
    return res.status(200).send('ok');
  } catch {
    return res.status(400).send('invalid signature');
  }
};

// ----------------- Crypto (Coingate) -----------------
export const createCryptoCharge = async (req, res) => {
  try {
    if (!COINGATE_KEY) {
      return res.status(500).json({ success: false, message: 'Server not configured: missing COINGATE_API_KEY' });
    }
    const {
      amount = '1.00',
      currency = 'USD',
      name = 'Charge',
      description = '',
      receive_currency = 'USDT', // allow override from client; default to USDT
      metadata = {},
    } = req.body || {};

    const payload = {
      price_amount: String(amount),
      price_currency: String(currency).toUpperCase(), // e.g., USD
      receive_currency: String(receive_currency).toUpperCase(), // e.g., USDT/BTC/ETH
      title: name,
      description,
      // success_url / cancel_url / callback_url can be added here
      // order_id: metadata?.orderId,
    };

    const r = await CG_API.post('/orders', payload);
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
      // forward actual Coingate status instead of 502 so we can see the real cause
      return res
        .status(err.response.status)
        .json({ success: false, message: err.response.data || `Coingate error (${err.response.status})` });
    }
    console.error('Coingate network error', err?.message || err);
    return res.status(502).json({ success: false, message: err?.message || 'Network error calling Coingate' });
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
    console.info('Coingate webhook received');
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