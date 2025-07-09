import express from 'express';
const router = express.Router();
import   {createPayer,getPayer}  from '../controllers/payer.js';

// POST /api/payers
router.post('/create', createPayer);
router.get('/:payerId', getPayer);

export default router