import express from 'express';
import {
  createCardPayment,
  getCardPayment,
  stripeWebhook,
  createCryptoCharge,     // Coingate-backed now
  getCryptoCharge,        // Coingate GET /orders/:id
  verifyCryptoCharge,
  verifyCryptoOnChain,
  coingateWebhook,        // optional
  createGcashPayment,
  getGcashStatus,
  createGoogleWalletPayment,
  getGoogleWalletStatus,
} from '../controllers/PaymentController.js';

const router = express.Router();

// Cards (Stripe)
router.post('/card', createCardPayment);
router.get('/card/:id', getCardPayment);
router.post('/webhook/stripe', stripeWebhook);

// Crypto (Coingate)
router.post('/crypto', createCryptoCharge);
router.get('/crypto/:id', getCryptoCharge);
router.get('/crypto/:id/verify', verifyCryptoCharge);
// optional webhook
router.post('/webhook/coingate', coingateWebhook);

// GCash
router.post('/gcash', createGcashPayment);
router.get('/gcash/:id', getGcashStatus);

// Google Wallet (mock)
router.post('/googlewallet', createGoogleWalletPayment);
router.get('/googlewallet/:id', getGoogleWalletStatus);

export default router;