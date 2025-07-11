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

const router = express.Router();
router.post('/register', regCorporate);
router.post('/login', loginCorporate);
router.post('/verify-login', verifyLogin);
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-password-reset', verifyPasswordResetCode);
router.patch('/profile-picture', updateProfilePicture);
router.get('/profile', getCorporateProfile);
router.post('/reset-password', resetPassword);
router.post('/logout', logoutCorporate);

export default router;
