import express from 'express';
import fetch from 'node-fetch';
import {
  createCardPayment,
  getCardPayment,
  stripeWebhook,
  createCryptoCharge,
  getCryptoCharge,
  verifyCryptoCharge,
  verifyCryptoOnChain,
  coinbaseWebhook,
  createGcashPayment,
  getGcashStatus,
  createGoogleWalletPayment,
  getGoogleWalletStatus,
} from '../controllers/PaymentController.js';

const router = express.Router();

// --- new: canonical coinbase env read & masked log ---
const RAW_COINBASE = (process.env.COINBASE_API_KEY || process.env.COINBASE_COMMERCE_API_KEY || '').trim();
const mask = s => (s && s.length > 8 ? `${s.slice(0,4)}...${s.slice(-4)}` : (s ? '***' : '(none)'));
console.info('paymentRoutes: COINBASE_API_KEY=', mask(process.env.COINBASE_API_KEY), 'COINBASE_COMMERCE_API_KEY=', mask(process.env.COINBASE_COMMERCE_API_KEY), '-> using', mask(RAW_COINBASE));
const COINBASE_KEY = RAW_COINBASE;

// Card (Stripe)
router.post('/card', createCardPayment);
router.get('/card/:id', getCardPayment);
router.post('/webhook/stripe', stripeWebhook);

// GCash (PHP only)
router.post('/gcash', createGcashPayment);
router.get('/gcash/:id', getGcashStatus);

// Crypto (Coinbase Commerce) - use COINBASE_KEY (single canonical env)
router.post('/crypto', async (req, res) => {
  try {
    if (!COINBASE_KEY) return res.status(500).json({ success: false, message: 'Server not configured: missing COINBASE_API_KEY' });

    const { amount = '0.00', currency = 'USD', name = 'Crypto charge', description = '', metadata = {} } = req.body || {};
    const r = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': COINBASE_KEY,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify({
        name,
        description,
        pricing_type: 'fixed_price',
        local_price: { amount: String(Number(amount).toFixed(2)), currency },
        metadata,
      }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      console.error('paymentRoutes /crypto: coinbase error', r.status, j);
      return res.status(r.status).json({ success: false, message: j });
    }
    const data = j?.data || j;
    return res.json({
      success: true,
      chargeId: data?.id || data?.code,
      hosted_url: data?.hosted_url,
      addresses: data?.addresses || data?.data?.addresses || null,
      status: data?.timeline?.[data?.timeline?.length - 1]?.status || data?.status || 'PENDING',
      raw: data,
    });
  } catch (e) {
    console.error('paymentRoutes /crypto exception', e?.message || e);
    return res.status(500).json({ success: false, message: e?.message || 'create crypto failed' });
  }
});
router.get('/crypto/:id', getCryptoCharge);
router.get('/crypto/:id/verify', async (req, res) => {
  try {
    const id = req.params.id;
    if (!COINBASE_KEY) return res.status(500).json({ success: false, message: 'Server not configured: missing COINBASE_API_KEY' });

    const r = await fetch(`https://api.commerce.coinbase.com/charges/${encodeURIComponent(id)}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': COINBASE_KEY,
        'X-CC-Version': '2018-03-22',
      },
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      console.error('paymentRoutes /crypto/:id/verify coinbase error', r.status, j);
      return res.status(r.status).json({ success: false, message: j });
    }
    const data = j?.data || j;
    const latest = (data?.timeline || []).slice(-1)[0]?.status || data?.status || 'PENDING';
    const verified = ['CONFIRMED', 'COMPLETED', 'RESOLVED'].includes(String(latest).toUpperCase());
    return res.json({
      success: true,
      verified,
      status: latest,
      raw: data,
    });
  } catch (e) {
    console.error('paymentRoutes /crypto/:id/verify exception', e?.message || e);
    return res.status(500).json({ success: false, message: e?.message || 'verify failed' });
  }
});
router.post('/webhook/coinbase', coinbaseWebhook);

// Google Wallet (mock)
router.post('/googlewallet', createGoogleWalletPayment);
router.get('/googlewallet/:id', getGoogleWalletStatus);

export default router;