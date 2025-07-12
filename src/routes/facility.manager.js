import express from 'express';
import {
  regManager,
  loginManager,
  verifyLogin,
  requestPasswordReset,
  resetPassword,
  logoutManager,
  verifyPasswordResetCode,
  updateProfilePicture,
  getManagerProfile
} from '../controllers/auth/facility.manager.js';
import { authMiddleware } from '../../src/middleware/auth.js';
import upload from '../../src/config/multer.js';


const router = express.Router();
router.post('/register', regManager);
router.post('/login', loginManager);
router.post('/verify-login', verifyLogin);
router.patch('/profile-picture', authMiddleware, upload.single('profilePicture'), updateProfilePicture);
router.get('/profile', authMiddleware, getManagerProfile);
router.post('/request-password-reset', requestPasswordReset); 
router.post('/verify-password-reset', verifyPasswordResetCode);
router.post('/reset-password', resetPassword);
router.post('/logout', logoutManager);

export default router;