import { regManager, loginManager } from '../controllers/auth/facility.manager.js';
import express from 'express';

const router = express.Router();
router.post('/register', regManager);
router.post('/login', loginManager);

export default router;