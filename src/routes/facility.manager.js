import express from 'express';
import {regManager, loginManager}  from '../../controllers/auth/facility.manager.js';

const router = express.Router();
router.post('/register', regManager);
router.post('/login', loginManager);

export default router;