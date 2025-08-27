import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
connectDB();

// parse JSON for normal routes
app.use(express.json());

// expose raw body for webhook endpoints (Stripe / Coinbase)
app.use('/api/payments/webhook/stripe', bodyParser.raw({ type: 'application/json' }));
app.use('/api/payments/webhook/coinbase', bodyParser.raw({ type: 'application/json' }));

// mount API routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// quick health check
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
// make server listen on 0.0.0.0 so devices (phone) can connect to host machine
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
