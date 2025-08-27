import express from 'express';
import {
  createCardPayment,
  stripeWebhook,
  createCryptoCharge,
  coinbaseWebhook,
  getCryptoCharge,
  verifyCryptoCharge,
  verifyCryptoOnChain,
} from '../controllers/PaymentController.js';

const router = express.Router();

// normal JSON endpoints
router.post('/card', createCardPayment);
router.post('/crypto', createCryptoCharge);
router.get('/crypto/:id', getCryptoCharge);
router.get('/crypto/:id/verify', verifyCryptoCharge);
router.get('/crypto/:id/verify-onchain', verifyCryptoOnChain);

// webhooks (raw body)
router.post('/webhook/stripe', stripeWebhook);
router.post('/webhook/coinbase', coinbaseWebhook);

export default router;