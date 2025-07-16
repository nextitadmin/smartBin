import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, ref: 'User' },
  balance: { type: Number, default: 0 },
  topUps: [
    {
      amount: {
        type: Number,
        required: true,
        min: [100, 'Minimum top-up is ₦100'],
        max: [1000000, 'Maximum top-up is ₦1,000,000']
     
      },
      date: { type: Date, default: Date.now },
      reference: { type: String, required: true },
      paymentMethod: {
        type: String,
        enum: ['Alat By Wema','Paystack','Bank Transfer'],
        default: 'Alat By Wema',
      },
      status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending'
      }
    }
  ]
});

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;