import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  topUps: [
    {
      amount: {
        type: Number,
        required: true,
        min: [100, 'Minimum top-up is ₦100'],
     
      },
      date: { type: Date, default: Date.now },
      reference: { type: String, required: true },
      paymentMethod: {
        type: String,
        enum: ['Alat By Wema', 'Flutterwave', 'Paystack', 'Bank Transfer'],
        default: 'Alat By Wema',
      }
    }
  ]
});

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;