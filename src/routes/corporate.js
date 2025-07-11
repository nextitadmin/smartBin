import express from 'express';
import {
  regCorporate,
  loginCorporate,
  verifyLoginCorporate,
  requestPasswordResetCorporate,
  resetPasswordCorporate,
  logoutCorporate
} from '../controllers/auth/corporate.js';

const router = express.Router();

router.post('/register', regCorporate);
router.post('/login', loginCorporate);
router.post('/verify-login', verifyLoginCorporate);
router.post('/request-password-reset', requestPasswordResetCorporate);
router.post('/reset-password', resetPasswordCorporate);
router.post('/logout', logoutCorporate);

export default router;
