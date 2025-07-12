import jwt from 'jsonwebtoken';
import Payer from '../models/payer.js';
import Resident from '../models/resident.js';
import Agent from '../models/agent.js';
import Corporate from '../models/corporate.js';
import FacilityManager from '../models/facility.manager.js';


const userModels = { payer: Payer, resident: Resident, agent: Agent, corporate: Corporate, facilityManager: FacilityManager };
const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication invalid, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded.id || !decoded.role) {
            return res.status(401).json({ message: 'Authentication invalid, token is malformed.' });
        }

        const UserModel = userModels[decoded.role];
        if (!UserModel) {
            return res.status(401).json({ message: 'Authentication invalid, unknown user role.' });
        }

        const user = await UserModel.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Authentication invalid, user for this token no longer exists.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authentication invalid, token failed verification' });
    }
};