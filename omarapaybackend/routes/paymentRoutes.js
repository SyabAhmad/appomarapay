import express from 'express';
import {
  createCardPayment,
  stripeWebhook,
  createCryptoCharge,
  coinbaseWebhook,
  getCryptoCharge,
  verifyCryptoCharge,
  verifyCryptoOnChain,
  getCardPayment, // <- add this
} from '../controllers/PaymentController.js';

const router = express.Router();

// normal JSON endpoints
router.post('/card', createCardPayment);
router.post('/crypto', createCryptoCharge);
router.get('/crypto/:id', getCryptoCharge);

// verification endpoints
router.get('/crypto/:id/verify', verifyCryptoCharge);
router.get('/crypto/:id/verify-onchain', verifyCryptoOnChain);

// card status endpoint
router.get('/card/:id', getCardPayment);

// webhooks (raw body)
router.post('/webhook/stripe', stripeWebhook);
router.post('/webhook/coinbase', coinbaseWebhook);

export default router;