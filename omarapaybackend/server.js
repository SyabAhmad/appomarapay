import express from 'express';
import bodyParser from 'body-parser';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();

// Raw body only for webhook routes
app.post('/api/payments/webhook/stripe', bodyParser.raw({ type: 'application/json' }));
app.post('/api/payments/webhook/coinbase', bodyParser.raw({ type: 'application/json' }));

// JSON for the rest
app.use(express.json());

// mount routes (ensure the webhook paths above match routes)
app.use('/api/payments', paymentRoutes);

// quick health check
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
// make server listen on 0.0.0.0 so devices (phone) can connect to host machine
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
