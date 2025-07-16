import express from 'express';
import { getWallet, initiateTopUp, verifyTopUpTransaction  } from '../../controllers/bills/wallet.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/',authMiddleware, getWallet);
router.post('/initiate-topup',authMiddleware, initiateTopUp);
router.get('/verify',authMiddleware, verifyTopUpTransaction );




export default router;