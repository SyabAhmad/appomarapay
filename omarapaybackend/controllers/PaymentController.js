import Stripe from 'stripe';
import Transaction from '../model/Transaction.js';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
dotenv.config();

// Coinbase Commerce (no DB)
const CC_API = axios.create({
  baseURL: 'https://api.commerce.coinbase.com',
  headers: {
    'X-CC-Api-Key': process.env.COINBASE_API_KEY || '',
    'X-CC-Version': '2018-03-22',
    'Content-Type': 'application/json',
  },
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

// helper to get raw string for webhook signature checks (works whether body is Buffer or already parsed)
const rawString = (req) => {
  if (req.rawBody && typeof req.rawBody === 'string') return req.rawBody;
  if (Buffer.isBuffer(req.body)) return req.body.toString();
  // fallback: stringify parsed body
  return JSON.stringify(req.body || {});
};

const parseChargeStatus = (charge) => {
  try {
    const timeline = charge?.timeline || [];
    const last = timeline[timeline.length - 1]?.status || charge?.status || 'PENDING';
    return String(last).toLowerCase();
  } catch {
    return 'pending';
  }
};

// Create a crypto checkout (stateless)
export const createCryptoCharge = async (req, res) => {
  try {
    if (!process.env.COINBASE_API_KEY) {
      return res.status(501).json({ success: false, message: 'COINBASE_API_KEY not configured' });
    }
    const {
      amount = '0.00',
      currency = 'USD',
      name = 'OmaraPay Checkout',
      description = 'Pay with crypto',
      metadata = {},
    } = req.body || {};

    const payload = {
      name,
      description,
      pricing_type: 'fixed_price',
      local_price: { amount: String(Number(amount).toFixed(2)), currency: String(currency).toUpperCase() },
      metadata,
    };

    const resp = await CC_API.post('/charges', payload);
    const data = resp?.data?.data;
    const hosted_url = data?.hosted_url || null;
    const id = data?.id || null;
    const status = parseChargeStatus(data);

    return res.json({ success: true, id, hosted_url, status, raw: undefined });
  } catch (err) {
    const msg = err?.response?.data || err?.message || 'internal';
    return res.status(err?.response?.status || 500).json({ success: false, message: msg });
  }
};

// Get crypto charge (stateless fetch from provider)
export const getCryptoCharge = async (req, res) => {
  try {
    if (!process.env.COINBASE_API_KEY) {
      return res.status(501).json({ success: false, message: 'COINBASE_API_KEY not configured' });
    }
    const { id } = req.params;
    const resp = await CC_API.get(`/charges/${encodeURIComponent(id)}`);
    const data = resp?.data?.data;
    const hosted_url = data?.hosted_url || null;
    const status = parseChargeStatus(data);
    return res.json({ success: true, id: data?.id, hosted_url, status });
  } catch (err) {
    const msg = err?.response?.data || err?.message || 'internal';
    return res.status(err?.response?.status || 500).json({ success: false, message: msg });
  }
};

// Verify via provider (alias to get)
export const verifyCryptoCharge = async (req, res) => {
  return getCryptoCharge(req, res);
};

// Optional on-chain verification hook (stateless, returns provider view)
export const verifyCryptoOnChain = async (req, res) => {
  try {
    if (!process.env.COINBASE_API_KEY) {
      return res.status(501).json({ success: false, message: 'COINBASE_API_KEY not configured' });
    }
    const { id } = req.params;
    const resp = await CC_API.get(`/charges/${encodeURIComponent(id)}`);
    const data = resp?.data?.data;
    // You can inspect data.payments for on-chain confirmations
    const payments = data?.payments || [];
    const confirmed = payments.some((p) => (p?.status || '').toLowerCase() === 'confirmed');
    const status = confirmed ? 'confirmed' : parseChargeStatus(data);
    return res.json({ success: true, id: data?.id, status, hosted_url: data?.hosted_url || null });
  } catch (err) {
    const msg = err?.response?.data || err?.message || 'internal';
    return res.status(err?.response?.status || 500).json({ success: false, message: msg });
  }
};

export const createCardPayment = async (req, res) => {
  try {
    const { amount = '0.00', currency = 'usd', metadata = {} } = req.body;
    // Stripe expects integer amount in cents
    const amountCents = Math.round(Number(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      payment_method_types: ['card'],
      metadata,
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error('createCardPayment error', err?.response?.data || err.message || err);
    res.status(500).json({ success: false, message: err?.message || 'internal' });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const raw = rawString(req);
  try {
    const event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
    const data = event.data.object;
    if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
      const pi = data;
      await Transaction.findOneAndUpdate({ providerId: pi.id }, { status: pi.status, meta: { ...pi.metadata } });
    }
    res.json({ received: true });
  } catch (err) {
    console.error('stripe webhook error', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// Simple in-memory store for demo (replace with real provider later)
const gcashMemory = new Map(); // id -> { status, hosted_url, amount, currency, ... }
const googleWalletMemory = new Map(); // id -> { status, hosted_url, amount, currency, ... }

// Helper: pick provider
const hasXendit = !!process.env.XENDIT_SECRET_KEY;
const hasPayMongo = !!process.env.PAYMONGO_SECRET_KEY;

export const createGcashPayment = async (req, res) => {
  try {
    const { amount = '0.00', currency = 'USD', description = '', metadata = {} } = req.body || {};

    // IMPORTANT: GCash providers expect PHP. Convert your amount to PHP before going live.
    // For now we forward as-is; you should replace this with your own USD->PHP conversion.
    const phpAmount = Math.round(Number(amount) * 100); // centavos

    const successUrl = process.env.GCASH_SUCCESS_URL || 'https://appomarapay-production.up.railway.app/success';
    const failUrl = process.env.GCASH_FAILURE_URL || 'https://appomarapay-production.up.railway.app/failed';

    if (hasXendit) {
      // XENDIT eWallet charge (GCASH)
      const reference_id = `gc_${crypto.randomBytes(6).toString('hex')}`;
      const payload = {
        reference_id,
        currency: 'PHP',
        amount: phpAmount, // Xendit expects integer amount; confirm your currency minor unit.
        channel_code: 'GCASH',
        channel_properties: {
          success_redirect_url: successUrl,
          failure_redirect_url: failUrl,
        },
        metadata: { ...metadata, description },
      };

      const resp = await axios.post('https://api.xendit.co/ewallets/charges', payload, {
        auth: { username: process.env.XENDIT_SECRET_KEY, password: '' },
        headers: { 'Content-Type': 'application/json' },
      });

      const data = resp.data;
      const hosted_url =
        data?.actions?.mobile_web_checkout_url ||
        data?.actions?.desktop_web_checkout_url ||
        data?.checkout_url ||
        null;

      return res.json({
        success: true,
        id: data?.id || reference_id,
        hosted_url,
        status: (data?.status || 'PENDING').toLowerCase(),
      });
    }

    if (hasPayMongo) {
      // PAYMONGO source (GCASH)
      const payload = {
        data: {
          attributes: {
            amount: phpAmount, // centavos
            currency: 'PHP',
            type: 'gcash',
            redirect: { success: successUrl, failed: failUrl },
            metadata: { ...metadata, description },
          },
        },
      };

      const base64Key = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64');
      const resp = await axios.post('https://api.paymongo.com/v1/sources', payload, {
        headers: {
          Authorization: `Basic ${base64Key}`,
          'Content-Type': 'application/json',
        },
      });

      const src = resp.data?.data;
      const hosted_url = src?.attributes?.redirect?.checkout_url || null;

      return res.json({
        success: true,
        id: src?.id,
        hosted_url,
        status: (src?.attributes?.status || 'pending').toLowerCase(),
      });
    }

    // Fallback: mock (kept for testing)
    const id = `gc_${crypto.randomBytes(6).toString('hex')}`;
    const hosted_url =
      process.env.GCASH_HOSTED_URL_BASE
        ? `${process.env.GCASH_HOSTED_URL_BASE}?ref=${id}&amount=${encodeURIComponent(amount)}&currency=${currency}`
        : `https://pay.gcash.com/app/pay?ref=${id}&amount=${encodeURIComponent(amount)}&currency=${currency}`;

    const record = { status: 'pending', amount, currency, description, metadata, hosted_url, createdAt: Date.now() };
    gcashMemory.set(id, record);
    return res.json({ success: true, id, hosted_url, status: record.status });
  } catch (err) {
    console.error('createGcashPayment', err?.response?.data || err?.message || err);
    res.status(err?.response?.status || 500).json({ success: false, message: err?.response?.data || err?.message || 'internal' });
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

    if (hasPayMongo) {
      const base64Key = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64');
      const resp = await axios.get(`https://api.paymongo.com/v1/sources/${id}`, {
        headers: { Authorization: `Basic ${base64Key}` },
      });
      const src = resp.data?.data;
      const status = (src?.attributes?.status || 'pending').toLowerCase();
      const hosted_url = src?.attributes?.redirect?.checkout_url || null;

      return res.json({ success: true, status, hosted_url });
    }

    // Fallback: mock memory
    const rec = gcashMemory.get(id);
    if (!rec) return res.status(404).json({ success: false, message: 'not found' });
    return res.json({ success: true, status: rec.status, hosted_url: rec.hosted_url, amount: rec.amount, currency: rec.currency });
  } catch (err) {
    console.error('getGcashStatus', err?.response?.data || err?.message || err);
    res.status(err?.response?.status || 500).json({ success: false, message: err?.response?.data || err?.message || 'internal' });
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

export const coinbaseWebhook = (req, res) => {
  try {
    const secret = process.env.COINBASE_WEBHOOK_SECRET || '';
    const signature = req.headers['x-cc-webhook-signature'];
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');

    if (secret) {
      const digest = crypto.createHmac('sha256', secret).update(raw).digest('hex');
      if (signature !== digest) {
        return res.status(400).send('invalid signature');
      }
    }

    // Optional: inspect event without persisting
    try {
      const event = JSON.parse(raw.toString('utf8'));
      console.log('Coinbase webhook:', event?.type, event?.data?.id);
    } catch {}

    return res.status(200).send('ok');
  } catch (e) {
    console.error('coinbaseWebhook', e?.message || e);
    // Acknowledge to avoid retries if you don't need them now
    return res.status(200).send('ok');
  }
};