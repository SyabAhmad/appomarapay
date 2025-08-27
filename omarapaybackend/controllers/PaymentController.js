import Stripe from 'stripe';
import axios from 'axios';
import Transaction from '../model/Transaction.js';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
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

    // simple retry/backoff for transient network errors (ECONNRESET, ETIMEDOUT)
    const maxAttempts = 3;
    let attempt = 0;
    let response;
    let lastErr;
    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        response = await axios.get(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
          headers: {
            'X-CC-Api-Key': process.env.COINBASE_API_KEY,
            'X-CC-Version': '2018-03-22',
          },
          timeout: 10000, // 10s
        });
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        console.warn(`getCryptoCharge attempt ${attempt} failed:`, err.message);
        // exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }

    if (lastErr) throw lastErr;

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

export const verifyCryptoCharge = async (req, res) => {
  try {
    const chargeId = req.params.id;
    const response = await axios.get(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': process.env.COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22',
      },
    });

    const charge = response.data?.data;
    const payments = Array.isArray(charge?.payments) ? charge.payments : [];
    // statuses treated as final / successful from Coinbase
    const finalSuccess = ['COMPLETED', 'RESOLVED', 'CONFIRMED', 'SETTLED', 'SUCCESS'];
    const foundSuccessful = payments.find((p) => finalSuccess.includes((p.status || '').toUpperCase()));

    // derive a status we can record locally
    const timelineStatus = (charge?.timeline?.slice(-1)[0]?.status || '').toUpperCase();
    const derivedStatus = foundSuccessful ? 'completed' : (timelineStatus ? timelineStatus.toLowerCase() : 'pending');

    // update local transaction if exists
    await Transaction.findOneAndUpdate(
      { providerId: chargeId },
      { status: derivedStatus, meta: charge },
      { upsert: false }
    );

    const localTx = await Transaction.findOne({ providerId: chargeId });

    res.json({
      success: true,
      verified: !!foundSuccessful,
      status: derivedStatus,
      payments,
      charge,
      localTx,
    });
  } catch (err) {
    console.error('verifyCryptoCharge', err?.response?.data || err.message);
    const message = err?.response?.data || err?.message || 'unknown error';
    res.status(500).json({ success: false, message });
  }
};

// verify on-chain by inspecting Coinbase charge payments and querying an RPC provider (if configured)
export const verifyCryptoOnChain = async (req, res) => {
  try {
    const chargeId = req.params.id;
    const response = await axios.get(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': process.env.COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22',
      },
      timeout: 10000,
    });
    const charge = response.data?.data;
    const payments = Array.isArray(charge?.payments) ? charge.payments : [];

    if (!payments.length) {
      return res.status(404).json({ success: false, message: 'No payments found on the charge', payments });
    }

    // find first payment with an onchain transaction id/hash
    let candidate = payments.find((p) => p.transaction_id || p.transaction_hash || p.network_transaction_id || p.onchain_transaction_id) ?? payments[0];

    const txHash = candidate.transaction_id || candidate.transaction_hash || candidate.network_transaction_id || candidate.onchain_transaction_id;
    // network hints (Coinbase may provide "network" or "blockchain")
    const networkHint = (candidate.network || candidate.blockchain || candidate.chain || candidate.network_name || '').toLowerCase();

    // map common network hints to RPC env var names
    const RPC_MAP = {
      ethereum: process.env.RPC_ETHEREUM,
      eth: process.env.RPC_ETHEREUM,
      polygon: process.env.RPC_POLYGON,
      matic: process.env.RPC_POLYGON,
      bsc: process.env.RPC_BSC,
      binance: process.env.RPC_BSC,
      optimism: process.env.RPC_OPTIMISM,
      arbitrum: process.env.RPC_ARBITRUM,
      base: process.env.RPC_BASE,
    };

    // try direct env fallback (user can set RPC_URL_<NETWORK>)
    let rpcUrl = RPC_MAP[networkHint] || process.env.RPC_DEFAULT || null;

    // if still not found, try to discover environment key like RPC_<UPPER>
    if (!rpcUrl && networkHint) {
      const key = `RPC_${networkHint.toUpperCase()}`;
      rpcUrl = process.env[key] || null;
    }

    if (!txHash) {
      return res.status(400).json({ success: false, message: 'No transaction hash found for payment', payments });
    }

    if (!rpcUrl) {
      // Not configured to query chain — return payment info so frontend can attempt manual verification or show block explorer links
      return res.json({
        success: true,
        onchain: false,
        message: 'No RPC configured for network; unable to verify on-chain automatically',
        txHash,
        networkHint,
        payments,
      });
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      // tx exists but not mined yet OR hash unknown to provider
      const tx = await provider.getTransaction(txHash);
      return res.json({
        success: true,
        onchain: false,
        message: 'Transaction not mined or not found yet',
        txFound: !!tx,
        tx,
        txHash,
        networkHint,
        payments,
      });
    }

    // compute confirmations (if receipt.blockNumber present)
    const blockNumber = await provider.getBlockNumber();
    const confirmations = receipt.blockNumber ? Math.max(0, blockNumber - receipt.blockNumber + 1) : 0;

    // update local transaction if exists
    await Transaction.findOneAndUpdate({ providerId: chargeId }, { status: receipt.status === 1 ? 'completed' : 'failed', meta: { ...charge, onchainReceipt: receipt } }, { upsert: false });

    res.json({
      success: true,
      onchain: true,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      confirmations,
      receipt,
      txHash,
      networkHint,
      payments,
    });
  } catch (err) {
    console.error('verifyCryptoOnChain', err?.response?.data || err.message || err);
    res.status(500).json({ success: false, message: err?.response?.data || err?.message || 'unknown' });
  }
};