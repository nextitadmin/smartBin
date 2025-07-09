import express from 'express';
import { registerResident,login} from '../controllers/resident.js'

const router = express.Router();

router.post('/register', registerResident);
router.post('/login',login);

export default router;





