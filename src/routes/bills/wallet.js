import express from 'express';
import { getWallet, topUpWallet } from '../../controllers/bills/wallet.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/',authMiddleware, getWallet);
router.post('/topup',authMiddleware, topUpWallet);

export default router;