import express from 'express';
import {
  regCorporate,
  loginCorporate,
  verifyLogin,
  requestPasswordReset,
  verifyPasswordResetCode,
  resetPassword,
  getCorporateProfile,
  updateProfilePicture,
  logoutCorporate
} from '../controllers/auth/corporate.js';
import { authMiddleware } from '../../src/middleware/auth.js';
import upload from '../../src/config/multer.js';


const router = express.Router();
router.post('/register', regCorporate);
router.post('/login', loginCorporate);
router.post('/verify-login', verifyLogin);
router.patch('/profile-picture', authMiddleware, upload.single('profilePicture'), updateProfilePicture);;
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-password-reset', verifyPasswordResetCode);
router.get('/profile', getCorporateProfile);
router.post('/reset-password', resetPassword);
router.post('/logout', logoutCorporate);

export default router;
