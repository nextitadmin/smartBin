import Wallet from '../../models/bills/wallet.js';
import Transaction from '../../models/bills/transaction.js';
import { verifyAlatTransaction } from '../../service/alatPay.service.js';

import crypto from 'crypto';


// getwallet
export async function getWallet  (req, res)  {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication error: User not found. Please log in.' });
    }
    const userId = req.user.id;
    const wallet = await Wallet.findOne({ userId: userId }).lean();

    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json({
      message: 'Wallet details retrieved successfully.',
      data: {
        balance: wallet.balance,
        topUps: wallet.topUps
      }
    });
  } catch (error) {
    console.error("Error in getting wallet:", error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};



// topup wallet
export const initiateTopUp = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication error: User not found. Please log in.' });
    }
    const userId = req.user.id;
    const userType = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    const { amount } = req.body;

    if (amount < 100 || amount > 1000000) {
      return res.status(400).json({ message: 'Amount must be between ₦100 and ₦1,000,000' });
    }
    const shortId = crypto.randomBytes(4).toString('hex').toUpperCase();
    const reference = `ALAT-${shortId}`;

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId, balance: 0 });

    wallet.topUps.push({ amount, reference, paymentMethod: 'Alat By Wema', status: 'pending' });
    await wallet.save();

     await Transaction.create({
      userId,
      userType,
      amount,
      transactionReference: reference,
      transactionID: reference, 
      status: 'pending',
      action: 'wallet_topup',
      service: 'Wallet Top-Up',
      paymentMethod: 'Alat By Wema',
      description: 'Wallet top-up via AlatPay'
    });

    const mockPaymentUrl = `${process.env.BASE_URL}/api/wallets/mock-verify?reference=${reference}`;

    res.status(200).json({ reference, payment_url: mockPaymentUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const verifyTopUpTransaction = async (req, res) => {
  try {
    const reference = String(req.query.reference).trim();

    const transaction = await verifyAlatTransaction(reference);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const wallet = await Wallet.findOne({ userId: transaction.userId.toString() });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    const topUp = wallet.topUps.find(t => t.reference === reference);
    if (topUp) {
      topUp.status = 'successful';
      wallet.markModified('topUps');
    } else {
      wallet.topUps.push({
        amount: transaction.amount,
        reference,
        paymentMethod: 'Alat By Wema',
        status: 'successful'
      });
    }

    wallet.balance += transaction.amount;
    await wallet.save();

    return res.status(200).json({
      message: 'Transaction verified and wallet credited',
      walletBalance: wallet.balance,
      transaction
    });
  } catch (error) {
    console.error('Error verifying transaction:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


