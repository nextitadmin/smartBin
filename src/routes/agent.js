import express from 'express';
import { registerAgent, login, verifyLoginCode, requestPasswordReset, verifyPasswordResetCode, resetPassword, getAgentProfile, logout, updateProfilePicture } from '../controllers/auth/agent.js';
import { authMiddleware } from '../../src/middleware/auth.js';
import upload from '../../src/config/multer.js';

const router = express.Router();

router.post('/register', registerAgent);
router.post('/login', login);
router.post('/verify-login', verifyLoginCode);
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-password-reset', verifyPasswordResetCode);
router.post('/reset-password', resetPassword);
router.get('/profile', authMiddleware, getAgentProfile);
router.post('/logout', logout);
router.patch('/profile-picture', authMiddleware, upload.single('profilePicture'), updateProfilePicture);

export default router;