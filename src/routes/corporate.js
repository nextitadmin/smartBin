import express from 'express';
import { regCorporate, loginCorporate} from '../controllers/auth/corporate.js';
const router = express.Router();


router.post('/register', regCorporate);
router.post('/login', loginCorporate);

export default router;
