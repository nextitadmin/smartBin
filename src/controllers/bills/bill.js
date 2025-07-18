import Bill from '../../models/bills/bills.js';
import Wallet from '../../models/bills/wallet.js';
import Corporate from '../../models/users/corporate.js';
import Facility from '../../models/users/facility.manager.js';
import Agent from '../../models/users/agent.js';
import Resident from '../../models/users/resident.js'
import crypto from 'crypto';
import { initiateAlatTransaction , verifyAlatTransaction } from '../../service/alatPay.service.js';

import Transaction from '../../models/bills/transaction.js';




export const getBills = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);

    const bills = await Bill.find({ userId, userType }).sort({ dueDate: -1 }).lean();

    let user;
    switch (userType) {
      case 'Resident':
        user = await Resident.findById(userId).lean();
        break;
      case 'Corporate':
        user = await Corporate.findById(userId).lean();
        break;
      case 'Agent':
        user = await Agent.findById(userId).lean();
        break;
      case 'Facility':
        user = await Facility.findById(userId).lean();
        break;
      default:
        user = null;
    }

    const customerName =
      user?.name ||
      `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
      'Unknown';

    const data = bills.map((bill) => ({
      id: bill._id,
      billId: bill.billId,
      amount: bill.amount,
      service: bill.service,
      dueDate: bill.dueDate,
      status: bill.status,
      paymentMethod: bill.paymentMethod || null,
      paidAt: bill.paidAt || null,
      customerName,
    }));

    return res.status(200).json({ message: 'Bills retrieved successfully', data });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



export const payBill = async (req, res) => {
  try {
    const user = req.user;
    const userType = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    const { billId } = req.params;
    const { paymentMethod, channel } = req.body;

    const bill = await Bill.findOne({ userId: user.id, billId , userType});
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    if (bill.status === 'paid') return res.status(400).json({ message: 'Bill already paid' });

    if (paymentMethod === 'Wallet') {
      const wallet = await Wallet.findOne({ userId: user.id });
      if (!wallet || wallet.balance < bill.amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      wallet.balance -= bill.amount;
      await wallet.save();

      bill.status = 'paid';
      bill.paidAt = new Date();
      bill.paymentMethod = 'Wallet';
      await bill.save();

      return res.json({ message: 'Bill paid with wallet successfully' });
    }

    const userId = user.id; 
    if (paymentMethod === 'Alat By Wema') {
      
      const userForService = { ...user, role: userType };
      const result = await initiateAlatTransaction(userForService, bill.amount, bill.service, channel, userId);
        bill.transactionID = result.transactionID;
        bill.paymentMethod = 'Alat By Wema';
        bill.transactionReference = result.transactionReference;
        bill.status = 'pending';
        await bill.save();

    return res.status(200).json({
          message: 'Alat Pay payment initiated.',
          paymentUrl: result.authorization.payment_url,
          transactionID: result.transactionID,
          reference: result.transactionReference,
        });
    }

    res.status(400).json({ message: 'Invalid payment method' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const verifyBillPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const transaction = await verifyAlatTransaction(reference);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

   const bill = await Bill.findOne({
  userId: transaction.userId,
  userType: transaction.userType, 
  amount: transaction.amount,
  service: transaction.service,
  status: transaction.status,
});


    if (!bill) return res.status(404).json({ message: 'Bill not found for transaction' });

    if (bill.status !== 'paid') {
      bill.status = 'paid';
      bill.paidAt = new Date();
      bill.paymentMethod = 'Alat By Wema';
      await bill.save();
    }

    res.json({ message: 'Payment verified and bill updated', bill, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};








export const seedBills = async (req, res) => {
  try {
    const userId = req.user.id;
   

    const userType = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);

    const sampleBills = [
      {
        userId,
        userType,
        billId: `OD${Math.floor(Math.random() * 1e8)}`,
        service: 'Waste Bin Disposal',
        amount: 20000,
        dueDate: new Date('2025-07-21'),
      },
      {
        userId,
        userType,
        billId: `OD${Math.floor(Math.random() * 1e8)}`,
        service: 'Smart Bin Purchase',
        amount: 150000,
        dueDate: new Date('2025-07-25'),
      },
      {
        userId,
        userType,
        billId: `OD${Math.floor(Math.random() * 1e8)}`,
        service: 'Waste Bin Disposal',
        amount: 10000,
        dueDate: new Date('2025-07-30'),
      }
    ];

    await Bill.insertMany(sampleBills);
    res.json({ message: 'Sample bills created', count: sampleBills.length, data: sampleBills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
