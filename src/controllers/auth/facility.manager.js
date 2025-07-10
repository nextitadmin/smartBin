import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import Facility from '../../models/facility.manager.js';
import Payer from '../../models/payer.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(to, subject, text) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
}

// Registration endpoint
export async function regManager(req, res) {
  const { payerId, email, password, organizationName, confirmPassword, firstName, lastName, phoneNumber } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

    let existingManager;
    if (payerId) {
      existingManager = await Facility.findOne({ payerId });
    } else if (email) {
      existingManager = await Facility.findOne({ email });
    }
    if (existingManager) {
      return res.status(409).json({ message: 'Facility manager already registered with this identifier' });
    }

    let managerData = {};
    if (payerId) {
      const payer = await Payer.findOne({ payerId });
      if (!payer) {
        return res.status(404).json({ message: 'Invalid payerId' });
      }
      managerData = {
        payerId,
        organizationName,
        firstName: payer.firstName,
        lastName: payer.lastName,
        email: payer.email,
        phoneNumber: payer.phoneNumber
      };
    } else if (email) {
      managerData = {
        email,
        organizationName,
        firstName,
        lastName,
        phoneNumber
      };
    } else {
      return res.status(400).json({ message: 'Either payerId or email is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newManager = await Facility.create({
      ...managerData,
      password: hashedPassword
    });

    // Send registration confirmation email
    await sendEmail(
      newManager.email,
      'Registration Successful',
      `Hello ${newManager.firstName},\n\nYour registration was successful.`
    );

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

// Login endpoint - sends login code to email
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

    // Generate login code
    const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
    manager.loginCode = loginCode;
    manager.loginCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await manager.save();

    // Send login code to email
    await sendEmail(
      manager.email,
      'Your Login Code',
      `Hello ${manager.firstName},\n\nYour login code is: ${loginCode}\n\nIt expires in 10 minutes.`
    );

    return res.status(200).json({
      message: 'Login code sent to your email. Please verify to continue.',
      email: manager.email
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error during login',
      error: error.message
    });
  }
}

// Verify login endpoint
export async function verifyLogin(req, res) {
  const { email, code } = req.body;
  try {
    const manager = await Facility.findOne({ email });
    if (!manager || manager.loginCode !== code || manager.loginCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired login code' });
    }

    // Clear login code after successful verification
    manager.loginCode = undefined;
    manager.loginCodeExpires = undefined;
    await manager.save();

    // Generate JWT
    const token = jwt.sign(
      {
        id: manager._id,
        payerId: manager.payerId,
        email: manager.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Dashboard data
    const dashboard = {
      welcome: `Welcome, ${manager.firstName}!`,
      stats: {
        facilitiesManaged: 3,
        lastLogin: new Date()
      }
    };

    return res.status(200).json({
      message: 'Login verified. Redirecting to dashboard.',
      token,
      facilityManager: {
        id: manager._id,
        payerId: manager.payerId,
        fullName: `${manager.firstName} ${manager.lastName}`,
        email: manager.email,
        phoneNumber: manager.phoneNumber
      },
      dashboard
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error verifying login',
      error: error.message
    });
  }
}

// Request password reset endpoint
export async function requestPasswordReset(req, res) {
  const { email } = req.body;
  try {
    const manager = await Facility.findOne({ email });
    if (!manager) {
      return res.status(404).json({ message: 'Facility manager not found' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    manager.resetPasswordToken = resetToken;
    manager.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await manager.save();

    // Send password reset email
    await sendEmail(
      manager.email,
      'Password Reset Request',
      `Hello ${manager.firstName},\n\nUse this token to reset your password: ${resetToken}\n\nThis token expires in 1 hour.`
    );

    return res.status(200).json({
      message: 'Password reset token generated and sent to email'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error requesting password reset',
      error: error.message
    });
  }
}

// Reset password endpoint
export async function resetPassword(req, res) {
  const { resetToken, newPassword, confirmPassword } = req.body;
  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const manager = await Facility.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!manager) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    manager.password = await bcrypt.hash(newPassword, 10);
    manager.resetPasswordToken = undefined;
    manager.resetPasswordExpires = undefined;
    await manager.save();

    // Send confirmation email
    await sendEmail(
      manager.email,
      'Password Reset Successful',
      `Hello ${manager.firstName},\n\nYour password has been reset successfully.`
    );

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error resetting password',
      error: error.message
    });
  }
}

// Logout endpoint
export function logoutManager(req, res) {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      return res.status(200).json({ message: 'Logout successful. Session cleared.' });
    });
  } else {
    return res.status(200).json({ message: 'No session found. Already logged out.' });
  }
}