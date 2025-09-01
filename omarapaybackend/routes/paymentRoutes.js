import express from 'express';
import {
  createCardPayment,
  getCardPayment,
  stripeWebhook,
  createCryptoCharge,
  getCryptoCharge,
  verifyCryptoCharge,
  verifyCryptoOnChain,
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

// Crypto (Coinbase Commerce)
router.post('/crypto', createCryptoCharge);
router.get('/crypto/:id', getCryptoCharge);
router.get('/crypto/:id/verify', verifyCryptoCharge);
router.get('/crypto/:id/verify-onchain', verifyCryptoOnChain);
// router.post('/webhook/coinbase', coinbaseWebhook);

// GCash (Xendit/PayMongo/mock)
router.post('/gcash', createGcashPayment);
router.get('/gcash/:id', getGcashStatus);
// Google Wallet (mock)
router.post('/googlewallet', createGoogleWalletPayment);
router.get('/googlewallet/:id', getGoogleWalletStatus);

export default router;