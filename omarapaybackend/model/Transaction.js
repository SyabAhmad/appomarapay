import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['card', 'crypto'], required: true },
  provider: { type: String }, // e.g. 'stripe', 'coinbase'
  providerId: { type: String }, // id from provider (paymentIntent/charge)
  amount: { type: Number, required: true }, // in smallest unit (cents) or major currency depending on provider
  currency: { type: String, default: 'USD' },
  status: { type: String, default: 'pending' },
  meta: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Transaction', TransactionSchema);