import bcrypt from 'bcryptjs';
import Resident from '../models/resident.js';
import Payer from '../models/payer.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {sendResetEmail, sendConfirmationMail} from '../utils/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET;


export async function registerResident(req, res) {
  try {
    const {
      payerId,
      password,
      confirmPassword,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

    const existingResident = await Resident.findOne({ payerId });
    if (existingResident) {
      return res.status(409).json({ message: 'Resident already registered with this payerId' });
    }

    const payer = await Payer.findOne({ payerId });
    if (!payer) {
      return res.status(404).json({ message: 'Invalid payerId' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newResident = await Resident.create({
      payerId,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      password: hashedPassword
    });

    sendConfirmationMail(newResident.email, newResident.firstName);

    return res.status(201).json({
      message: 'Resident registered successfully',
      resident: {
        id: newResident._id,
        payerId: newResident.payerId,
        fullName: `${newResident.firstName} ${newResident.lastName}`,
        email: newResident.email,
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error registering resident',
      error: error.message
    });
  }
}




export async function login (req,res){
  console.log('incoming body:', req.body)
  
  try {
    const { email, password} = req.body;

    const resident = await Resident.findOne({email});
    if(!resident){
      return res.status(404).json({message:"Invalid email or password"})
    }

    const isMatch = await bcrypt.compare(password, resident.password);
    if(!isMatch){
      return   res.status(401).json({message:"Invalid email or password"});
    }
    const token = jwt.sign(
      {
        id:resident._id,
        payerId:resident.payerId,
        email:resident.email
      },
 JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.status(200).json  ({
      message: 'Login successful',
      token,
      resident: {
        id: resident._id,
        payerId: resident.payerId,
        fullName:` ${resident.firstName} ${resident.lastName}`,
        email: resident.email,
     
      }
    } )
  } catch (error) {
    return res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
}


export async function requestPasswordReset (req, res) {
  try {
    const { email } = req.body;
    const resident = await Resident.findOne({ email });

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry =new Date( Date.now() + 20*60*1000); 
    resident.resetToken = resetToken;
    resident.resetTokenExpiry = resetTokenExpiry;
    await resident.save();
    // Send reset email
    sendResetEmail(email, resident.firstName, resetToken);
    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    return res.status(500).json({ error: error.message});
 }
};


// Reset password
export async function  resetPassword(req, res) {
try {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match or are not provided.' });
  }

  // Optional: Add a password strength requirement
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  const resident = await Resident.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
  if (!resident) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  resident.password = hashedPassword;
  resident.resetToken = null;
  resident.resetTokenExpiry = null;
  await resident.save();

  return res.status(200).json({ message: 'Password reset successful' });
} catch (error) {
  return res.status(500).json({ error: error.message });
}
}