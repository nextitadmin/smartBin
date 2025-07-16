import express from 'express';
import {
  getBills,
  payBill,
  seedBills, 
  verifyBillPayment 
} from '../../controllers/bills/bill.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.post('/seed',authMiddleware, seedBills);
router.get('/', authMiddleware, getBills);
router.post('/pay/:billId', authMiddleware, payBill);
router.post('/verify/:reference', authMiddleware, verifyBillPayment );






export default router;