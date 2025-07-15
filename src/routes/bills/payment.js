import express from "express";
import {getPayment, getReceipt, createPayment} from '../../controllers/bills/payment.js'
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

router.get('/', authMiddleware, getPayment);
router.post('/pay', authMiddleware, createPayment);
router.get('/', authMiddleware, getReceipt);

export default router;
