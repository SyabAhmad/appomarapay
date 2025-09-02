import express from 'express';
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
router.post('/crypto', createCryptoCharge);
router.get('/crypto/:id', getCryptoCharge);
router.get('/crypto/:id/verify', verifyCryptoCharge);
router.get('/crypto/:id/verify-onchain', verifyCryptoOnChain);
router.post('/webhook/coinbase', coinbaseWebhook);

// Google Wallet (mock)
router.post('/googlewallet', createGoogleWalletPayment);
router.get('/googlewallet/:id', getGoogleWalletStatus);

export default router;