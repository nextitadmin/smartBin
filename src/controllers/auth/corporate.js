import bcrypt from "bcryptjs";
import Corporate from "../../models/corporate.js";
import Payer from "../../models/payer.js";
import jwt from "jsonwebtoken";
import mailer from "../../utils/mailer.js"; 

 const JWT_SECRET = process.env.JWT_SECRET;


// Registration
export async function regCorporate(req, res) {
  const { payerId, businessName, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match' });
    }
    const existingCorporate = await Corporate.findOne({ payerId });
    if (existingCorporate) {
      return res.status(409).json({ message: 'business already registered with this payerId' });
    }
    const payer = await Payer.findOne({ payerId });
    if (!payer) {
      return res.status(404).json({ message: 'Invalid payerId' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCorporate = await Corporate.create({
      payerId,
      businessName,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      phoneNumber: payer.phoneNumber,
      password: hashedPassword
    });

    // confirmation email
    await mailer({
      to: payer.email,
      subject: 'Registration Successful',
      text: 'Welcome! Your registration was successful.'
    });

    return res.status(201).json({
      message: 'business registered successfully, confirmation email sent',
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

// Login & send code
export async function loginCorporate(req, res) {
  const { email, password } = req.body;
  try {
    const corporate = await Corporate.findOne({ email });
    if (!corporate) {
      return res.status(404).json({ message: 'business not found' });
    }
    const match = await bcrypt.compare(password, corporate.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    // login code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 min expiry

    corporate.loginCode = code;
    corporate.loginCodeExpires = expires;
    await corporate.save();

    // Send code to email
    await mailer({
      to: email,
      subject: 'Your Login Code',
      text: `Your login code is: ${code}`
    });

    return res.json({ message: 'Login code sent to email.' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error logging in corporate Business',
      error: error.message
    });
  }
}

// Verify login code
export async function verifyLoginCorporate(req, res) {
  const { email, code } = req.body;
  try {
    const corporate = await Corporate.findOne({ email });
    if (
      !corporate ||
      corporate.loginCode !== code ||
      !corporate.loginCodeExpires ||
      Date.now() > corporate.loginCodeExpires
    ) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Clear code after use
    corporate.loginCode = undefined;
    corporate.loginCodeExpires = undefined;
    await corporate.save();

    const token = jwt.sign({ id: corporate._id }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({
      message: 'Login successful',
      token,
      redirect: '/dashboard',
      corporateBusiness: {
        id: corporate._id,
        payerId: corporate.payerId,
        fullName: `${corporate.firstName} ${corporate.lastName}`,
        email: corporate.email,
        businessName: corporate.businessName,
        phoneNumber: corporate.phoneNumber
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error verifying login code',
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
      return res.status(404).json({ message: 'business not found' });
    }
    const token = Math.random().toString(36).substring(2, 15);
    const expires = Date.now() + 15 * 60 * 1000; // 15 min expiry

    // Store token 
    corporate.resetToken = token;
    corporate.resetTokenExpires = expires;
    await corporate.save();

    await mailer({
      to: email,
      subject: 'Password Reset Request',
      text: `Your password reset token is: ${token}`
    });

    return res.json({ message: 'Password reset token sent to email.' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error requesting password reset',
      error: error.message
    });
  }
}

// Reset password
export async function resetPasswordCorporate(req, res) {
  const { email, token, newPassword } = req.body;
  try {
    const corporate = await Corporate.findOne({ email });
    if (
      !corporate ||
      corporate.resetToken !== token ||
      !corporate.resetTokenExpires ||
      Date.now() > corporate.resetTokenExpires
    ) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Clear token after use
    corporate.resetToken = undefined;
    corporate.resetTokenExpires = undefined;
    corporate.password = await bcrypt.hash(newPassword, 10);
    await corporate.save();

    await mailer({
      to: email,
      subject: 'Password Reset Successful',
      text: 'Your password has been reset successfully.'
    });

    return res.json({ message: 'Password reset successful. Confirmation email sent.' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error resetting password',
      error: error.message
    });
  }
}

// Logout
export function logoutCorporate(req, res) {
  res.json({ message: 'Logged out successfully.' });
}


