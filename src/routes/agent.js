import express from 'express';
import { registerAgent, login, verifyLoginCode, requestPasswordReset, resetPassword } from '../controllers/auth/agent.js';

const router = express.Router();


router.post('/register', registerAgent);
router.post('/login', login);
router.post('/verify-login', verifyLoginCode);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/', resetPassword);

export default router;