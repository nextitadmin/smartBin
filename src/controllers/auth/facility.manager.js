import bcrypt from 'bcryptjs';
import Facility from '../../models/facility.manager.js';
import Payer from '../../models/payer.js';
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET;


export async function regManager(req, res) {
  const { payerId, password, organizationName, confirmPassword} = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match' });
    }
    const existingManager = await Facility.findOne({ payerId });
    if (existingManager) {
      return res.status(409).json({ message: 'Facility manager already registered with this payerId' });
    }
    const payer = await Payer.findOne({ payerId });
    if (!payer) {   
      return res.status(404).json({ message: 'Invalid payerId' });
    }
    const hashedPassword = await bcrypt.hash(password, 10); 
    const newManager = await Facility.create({
      payerId,
      organizationName,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      phoneNumber: payer.phoneNumber,
      password: hashedPassword
    });

    return res.status(201).json({
      message: 'Facility manager registered successfully',
      manager: {
        id: newManager._id,
        payerId: newManager.payerId,
        fullName: `${newManager.firstName} ${newManager.lastName}`,
        email: newManager.email,
        organizationName: newManager.organizationName,
        phoneNumber: newManager.phoneNumber
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error registering facility manager',
      error: error.message
    });
    
  }
}

export async function loginManager(req, res) {
  const { email, password } = req.body;
  try {
    const manager = await Facility.findOne({ email });
    if (!manager) {
      return res.status(404).json({ message: 'Facility manager not found' });
    }
    const isValid = await bcrypt.compare(password, manager.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      {
        id: manager._id,
        payerId: manager.payerId,
        email: manager.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.status(200).json({
      message: 'Login successful',
      token,
      facilityManager: {
        id: manager._id,
        payerId: manager.payerId,
        fullName: `${manager.firstName} ${manager.lastName}`,
        email: manager.email,
        phoneNumber: manager.phoneNumber
      }
    })
  } catch (error) { 
    return res.status(500).json({
      message: 'Error logging in facility manager',
      error: error.message
    });
  }
}