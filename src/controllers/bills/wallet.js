import Wallet from '../../models/bills/wallet.js';
import crypto from 'crypto';



export async function getWallet  (req, res)  {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication error: User not found. Please log in.' });
    }
    const userId = req.user.id;
    const wallet = await Wallet.findOne({ userId: userId }).lean();

    if (!wallet) {
      return res.json({
        message: 'Wallet details retrieved.',
        data: {
          balance: 0,
          topUps: []
        }
      });
    }
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
export async function topUpWallet  (req, res)  {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication error: User not found. Please log in.' });
    }
    const userId = req.user.id;
    const { amount, paymentMethod } = req.body || {};

    if (typeof amount !== 'number' || amount < 100 ) {
      return res.status(400).json({ message: 'Amount must be a number between ₦100 and ₦1,000,000.' });
    }

    const reference = crypto.randomBytes(5).toString('hex');

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId, balance: 0 });

    wallet.balance += amount;
    const newTopUp = {
      amount,
      reference,
      paymentMethod,
      date: new Date()
    };

    wallet.topUps.push(newTopUp);
    await wallet.save();

    res.json({
      message: 'Top-up successful',
      data: {
        amount,
        paymentStatus: 'Success',
        reference,
        paymentMethod,
        paymentTime: newTopUp.date
      }
    });
  } catch (error) {
    console.error("Error in topUpWallet:", error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};
