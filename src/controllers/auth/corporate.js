import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import Corporate from "../../models/corporate.js";
import Payer from "../../models/payer.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

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

// Registration
export async function regCorporate(req, res) {
  const { payerId, businessName, email, password, confirmPassword, firstName, lastName, phoneNumber } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match' });
    }
    let existingCorporate;
    if (payerId) {
      existingCorporate = await Corporate.findOne({ payerId });
    } else if (email) {
      existingCorporate = await Corporate.findOne({ email });
    }
    if (existingCorporate) {
      return res.status(409).json({ message: 'Business already registered with this identifier' });
    }
    let corporateData = {};
    if (payerId) {
      const payer = await Payer.findOne({ payerId });
      if (!payer) {
        return res.status(404).json({ message: 'Invalid payerId' });
      }
      corporateData = {
        payerId,
        businessName,
        firstName: payer.firstName,
        lastName: payer.lastName,
        email: payer.email,
        phoneNumber: payer.phoneNumber
      };
    } else if (email) {
      corporateData = {
        email,
        businessName,
        firstName,
        lastName,
        phoneNumber
      };
    } else {
      return res.status(400).json({ message: 'Either payerId or email is required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCorporate = await Corporate.create({
      ...corporateData,
      password: hashedPassword
    });

    // Send registration confirmation email
    await sendEmail(
      newCorporate.email,
      'Registration Successful',
      `Hello ${newCorporate.firstName},\n\nYour registration was successful.`
    );

    return res.status(201).json({
      message: 'Business registered successfully',
      corporate: {
        id: newCorporate._id,
        payerId: newCorporate.payerId,
        fullName: `${newCorporate.firstName} ${newCorporate.lastName}`,
        email: newCorporate.email,
        businessName: newCorporate.businessName,
        phoneNumber: newCorporate.phoneNumber
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error registering corporate',
      error: error.message
    });
  }
}

// Login -  login code to email
export async function loginCorporate(req, res) {
  const { email, password } = req.body;
  try {
    const corporate = await Corporate.findOne({ email });
    if (!corporate) {
      return res.status(404).json({ message: 'Business not found' });
    }
    const match = await bcrypt.compare(password, corporate.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    // Generating login code
    const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
    corporate.loginCode = loginCode;
    corporate.loginCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await corporate.save();

    // Send login code to email
    await sendEmail(
      corporate.email,
      'Your Login Code',
      `Hello ${corporate.firstName},\n\nYour login code is: ${loginCode}\n\nIt expires in 10 minutes.`
    );

    return res.status(200).json({
      message: 'Login code sent to your email. Please verify to continue.',
      email: corporate.email
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error during login',
      error: error.message
    });
  }
}

// Verify login 
export async function verifyLoginCorporate(req, res) {
  const { email, code } = req.body;
  try {
    const corporate = await Corporate.findOne({ email });
    if (!corporate || corporate.loginCode !== code || corporate.loginCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired login code' });
    }
    // Clear login code after successful verification
    corporate.loginCode = undefined;
    corporate.loginCodeExpires = undefined;
    await corporate.save();

    // Generate JWT
    const token = jwt.sign(
      { id: corporate._id, payerId: corporate.payerId, email: corporate.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Dashboard data
    const dashboard = {
      welcome: `Welcome, ${corporate.firstName}!`,
      stats: {
        businessesManaged: 1,
        lastLogin: new Date()
      }
    };

    return res.status(200).json({
      message: 'Login verified. Redirecting to dashboard.',
      token,
      corporateBusiness: {
        id: corporate._id,
        payerId: corporate.payerId,
        fullName: `${corporate.firstName} ${corporate.lastName}`,
        email: corporate.email,
        businessName: corporate.businessName,
        phoneNumber: corporate.phoneNumber
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

// Request password reset
export async function requestPasswordResetCorporate(req, res) {
  const { email } = req.body;
  try {
    const corporate = await Corporate.findOne({ email });
    if (!corporate) {
      return res.status(404).json({ message: 'Business not found' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    corporate.resetPasswordToken = resetToken;
    corporate.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await corporate.save();

    // password reset email
    await sendEmail(
      corporate.email,
      'Password Reset Request',
      `Hello ${corporate.firstName},\n\nUse this token to reset your password: ${resetToken}\n\nThis token expires in 1 hour.`
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

// Reset password
export async function resetPasswordCorporate(req, res) {
  const { resetToken, newPassword, confirmPassword } = req.body;
  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const corporate = await Corporate.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!corporate) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    corporate.password = await bcrypt.hash(newPassword, 10);
    corporate.resetPasswordToken = undefined;
    corporate.resetPasswordExpires = undefined;
    await corporate.save();

    // Send confirmation email
    await sendEmail(
      corporate.email,
      'Password Reset Successful',
      `Hello ${corporate.firstName},\n\nYour password has been reset successfully.`
    );

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error resetting password',
      error: error.message
    });
  }
}

// Logout
export function logoutCorporate(req, res) {
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


