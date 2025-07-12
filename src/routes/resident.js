import express from 'express';
import { registerResident, login, verifyLoginCode, requestPasswordReset, verifyPasswordResetCode, resetPassword, getResidentProfile, logout, updateProfilePicture } from '../controllers/auth/resident.js'
import { authMiddleware } from '../../src/middleware/auth.js';
import upload from '../../src/config/multer.js';

const router = express.Router();

router.post('/register', registerResident);
router.post('/login',login);
router.post('/verify-login',verifyLoginCode);
router.post('/request-password-reset',requestPasswordReset);
router.post('/verify-password-reset',verifyPasswordResetCode);
router.post('/reset-password',resetPassword);
router.get('/profile', authMiddleware, getResidentProfile);
router.post('/logout', logout);
router.patch('/profile-picture', authMiddleware, upload.single('profilePicture'), updateProfilePicture);


export default router;
