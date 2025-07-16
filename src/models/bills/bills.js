import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: {
  type: String,
  required: true,
  enum:  ['Resident', 'Corporate', 'Facility', 'Agent']
},
  billId: { type: String, required: true, unique: true },
  service: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidAt: { type: Date },
  paymentMethod: { type: String, enum: ['Wallet', 'Alat By Wema'] },
});

const Bill= mongoose.model('Bill', billSchema);
export default Bill;