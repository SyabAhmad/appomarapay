import express from 'express';
import {
  createCardPayment,
  stripeWebhook,
  createCryptoCharge,
  coinbaseWebhook,
  getCryptoCharge,
  verifyCryptoCharge, // add this import
} from '../controllers/PaymentController.js';

const router = express.Router();

// normal JSON endpoints
router.post('/card', createCardPayment);
router.post('/crypto', createCryptoCharge);
router.get('/crypto/:id', getCryptoCharge);

// verification endpoint
router.get('/crypto/:id/verify', verifyCryptoCharge);

// webhooks (raw body)
router.post('/webhook/stripe', stripeWebhook);
router.post('/webhook/coinbase', coinbaseWebhook);

export default router;