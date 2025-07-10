import express from 'express';
import { registerResident,login,requestPasswordReset,resetPassword } from '../controllers/auth/resident.js'

const router = express.Router();

router.post('/register', registerResident);
router.post('/login',login);
router.post('/request-resetToken',requestPasswordReset);
router.post('/reset/:token',resetPassword);
export default router;





