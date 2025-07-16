import axios from 'axios';
import Transaction from '../models/bills/transaction.js';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = process.env.ALAT_BASE_URL;
const CLIENT_ID = process.env.ALAT_CLIENT_ID;
const CLIENT_SECRET = process.env.ALAT_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiry = null;

const generateTransactionID = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `#OD${timestamp}${random}`;
};

// export const getAlatAccessToken = async () => {
//   if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
//     return cachedToken;
//   }

//   const response = await axios.post(`${BASE_URL}/api/token`, {
//     client_id: CLIENT_ID,
//     client_secret: CLIENT_SECRET
//   });

//   cachedToken = response.data.access_token;
//   tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
//   return cachedToken;
// };


// mock
export const getAlatAccessToken = async () => {
  return 'mock-alatpay-token';
};


// mock
export const initiateAlatTransaction = async (user, amount, service, channel) => {
  const transactionReference = `alat_${uuidv4()}`;
  const transactionID = generateTransactionID();

  const mockPaymentUrl = `https://yourapp.com/mock-verify?reference=${transactionReference}`;

  const transaction = new Transaction({
    userId: user._id,
    userType: user.role,
    amount,
    service,
    channel,
    paymentMethod: 'Alat By Wema',
    transactionReference,
    transactionID,
    description: `Payment for ${service}`,
  });

  await transaction.save();

  return {
    authorization: {
      reference: transactionReference,
      payment_url: mockPaymentUrl
    },
    transactionReference,
    transactionID
  };
};

// mock verification
export const verifyAlatTransaction = async (reference) => {
  try {
    const cleanReference = String(reference).trim();
    console.log('Verifying transaction with reference:', cleanReference);

    const transaction = await Transaction.findOne({ transactionReference: cleanReference });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.status = 'successful';
    transaction.action = 'paid';
    transaction.completedAt = new Date();
    transaction.gatewayResponse = {
      status: 'successful',
      reference: cleanReference,
      message: 'Mock AlatPay payment verified'
    };

    await transaction.save();

    return transaction;
  } catch (err) {
    console.error('Error verifying transaction:', err.message);
    throw err;
  }
};


