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

// Card (Stripe)
router.post('/card', createCardPayment);
router.get('/card/:id', getCardPayment);
router.post('/webhook/stripe', stripeWebhook);

// GCash (PHP only)
router.post('/gcash', createGcashPayment);
router.get('/gcash/:id', getGcashStatus);

// Crypto (Coinbase Commerce)
router.post('/crypto', async (req, res) => {
  try {
    const { amount = '0.00', currency = 'USD', name = 'Crypto charge', description = '', metadata = {} } = req.body || {};
    const r = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY,
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
    const j = await r.json();
    if (!r.ok) return res.status(r.status).json({ success: false, message: j });
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
    return res.status(500).json({ success: false, message: e?.message || 'create crypto failed' });
  }
});
router.get('/crypto/:id', getCryptoCharge);
router.get('/crypto/:id/verify', async (req, res) => {
  try {
    const id = req.params.id;
    const r = await fetch(`https://api.commerce.coinbase.com/charges/${encodeURIComponent(id)}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY,
        'X-CC-Version': '2018-03-22',
      },
    });
    const j = await r.json();
    if (!r.ok) return res.status(r.status).json({ success: false, message: j });
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
    return res.status(500).json({ success: false, message: e?.message || 'verify failed' });
  }
});
router.post('/webhook/coinbase', coinbaseWebhook);

// Google Wallet (mock)
router.post('/googlewallet', createGoogleWalletPayment);
router.get('/googlewallet/:id', getGoogleWalletStatus);

export default router;