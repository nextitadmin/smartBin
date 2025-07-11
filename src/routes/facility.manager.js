import express from 'express';
import {
  regManager,
  loginManager,
  verifyLogin,
  requestPasswordReset,
  resetPassword,
  logoutManager
} from '../../controllers/auth/facility.manager.js';

const router = express.Router();
router.post('/register', regManager);
router.post('/login', loginManager);
router.post('/verify-login', verifyLogin);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/logout', logoutManager);

export default router;