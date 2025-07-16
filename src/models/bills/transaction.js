import mongoose from 'mongoose';
import Corporate from '../users/corporate.js';
import Facility from '../users/facility.manager.js';
import Agent from '../users/agent.js';
import Resident from '../users/resident.js'




const transactionSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, required: true ,  refPath: 'userType'},
userType: {
  type: String,
  required: true,
  enum:  ['Resident', 'Corporate', 'Facility', 'Agent']
},
  amount: { type: Number, required: true },
  transactionReference: { type: String, unique: true, required: true },
  transactionID: { type: String, unique: true, required: true },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'pending',
  },
  action: {
    type: String,
    enum: ['pay now', 'paid','wallet_topup'],
    default: 'pay now',
  },
  service: {
    type: String,
    enum: ['Waste Bin Disposal', 'Subscription', 'Smart Bin Purchase',"Wallet Top-Up"],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Alat By Wema', 'walletBalance'],
    required: true,
  },
  gatewayResponse: { type: Object },
//   createdBy: {
//   type: mongoose.Schema.Types.ObjectId,
//   required: true,
//   refPath: 'userType' 
// },
    description: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;