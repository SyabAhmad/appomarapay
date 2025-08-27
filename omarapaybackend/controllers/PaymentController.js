import Stripe from 'stripe';
import axios from 'axios';
import crypto from 'crypto';
import Transaction from '../model/Transaction.js';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

// helper to get raw string for webhook signature checks (works whether body is Buffer or already parsed)
const rawString = (req) => {
  if (req.rawBody && typeof req.rawBody === 'string') return req.rawBody;
  if (Buffer.isBuffer(req.body)) return req.body.toString();
  // fallback: stringify parsed body
  return JSON.stringify(req.body || {});
};

export const createCardPayment = async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;
    const amountInCents = Math.round(Number(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata,
    });

    const tx = await Transaction.create({
      type: 'card',
      provider: 'stripe',
      providerId: paymentIntent.id,
      amount: amountInCents,
      currency,
      status: paymentIntent.status,
      meta: { metadata },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, txId: tx._id });
  } catch (err) {
    console.error('createCardPayment', err);
    res.status(500).json({ success: false, message: err.message });
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

// Create Coinbase Commerce charge
export const createCryptoCharge = async (req, res) => {
  try {
    const { amount, currency = 'USD', name = 'OmaraPay charge', description = '', metadata = {} } = req.body;

    const body = {
      name,
      description,
      local_price: { amount: String(amount), currency },
      pricing_type: 'fixed_price',
      metadata,
    };

    const response = await axios.post('https://api.commerce.coinbase.com/charges', body, {
      headers: {
        'X-CC-Api-Key': process.env.COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22',
        'Content-Type': 'application/json',
      },
    });

    const charge = response.data.data;
    const tx = await Transaction.create({
      type: 'crypto',
      provider: 'coinbase',
      providerId: charge.id,
      amount: Number(amount),
      currency,
      status: charge.timeline?.slice(-1)[0]?.status || 'pending',
      meta: charge,
    });

    // Return minimal fields useful for client (hosted_url to redirect user)
    res.json({
      success: true,
      chargeId: charge.id,
      hosted_url: charge.hosted_url,
      timeline: charge.timeline,
      txId: tx._id,
      raw: charge,
    });
  } catch (err) {
    console.error('createCryptoCharge', err?.response?.data || err.message);
    res.status(500).json({ success: false, message: err?.response?.data || err.message });
  }
};

// Retrieve charge status from Coinbase Commerce (and local DB)
export const getCryptoCharge = async (req, res) => {
  try {
    const chargeId = req.params.id;
    // fetch latest from Coinbase Commerce
    const response = await axios.get(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': process.env.COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22',
      },
    });
    const charge = response.data.data;

    // update local tx status if present
    if (charge && charge.id) {
      const status = charge.timeline?.slice(-1)[0]?.status || 'pending';
      await Transaction.findOneAndUpdate({ providerId: charge.id }, { status, meta: charge }, { upsert: false });
    }

    // return charge payload and local transaction (if any)
    const localTx = await Transaction.findOne({ providerId: chargeId });
    res.json({ success: true, charge, localTx });
  } catch (err) {
    console.error('getCryptoCharge error', err?.response?.data || err.message);
    res.status(500).json({ success: false, message: err?.response?.data || err.message });
  }
};

export const coinbaseWebhook = async (req, res) => {
  try {
    const sig = req.headers['x-cc-webhook-signature'] || '';
    const raw = rawString(req);
    const secret = process.env.COINBASE_WEBHOOK_SECRET || process.env.COINBASE_SECRET_KEY || '';
    // compute HMAC SHA256 hex
    const hmac = crypto.createHmac('sha256', secret).update(raw).digest('hex');

    if (!sig || hmac !== sig) {
      console.warn('coinbase webhook signature mismatch', { got: sig, expected: hmac.slice(0, 8) + '...' });
      return res.status(400).send('invalid signature');
    }

    const payload = JSON.parse(raw.toString());
    const event = payload.event;
    const charge = payload.event?.data;
    if (charge && charge.id) {
      const status = charge.timeline?.slice(-1)[0]?.status || 'pending';
      await Transaction.findOneAndUpdate({ providerId: charge.id }, { status, meta: charge }, { upsert: false });
    }
    res.json({ received: true });
  } catch (err) {
    console.error('coinbase webhook error', err);
    res.status(400).send('error');
  }
};