import Facility from '../../models/facility.manager.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Payer from '../../models/payer.js';
import { sendConfirmationMail, sendResetEmail, sendLoginCodeEmail } from '../../utils/mailer.js';
const JWT_SECRET = process.env.JWT_SECRET;

const codes = {}; 
// Registration
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

    // Send confirmation email
    await sendConfirmationMail(payer.email);

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

// Login & send code
export async function loginManager(req, res) {
  const { email, password } = req.body;
  try {
    const user = await Facility.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate login code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 min expiry

    // Store code
    user.loginCode = code;
    user.loginCodeExpires = expires;
    await user.save();

    // Send code to email
    await sendLoginCodeEmail(email, code);

    res.json({ message: 'Login code sent to email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Verify login code
export async function verifyLogin(req, res) {
  try {
    const { email, code } = req.body;
    const user = await Facility.findOne({ email });
    if (
      !user ||
      user.loginCode !== code ||
      !user.loginCodeExpires ||
      Date.now() > user.loginCodeExpires
    ) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Clear code after use
    user.loginCode = undefined;
    user.loginCodeExpires = undefined;
    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token, redirect: '/dashboard' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Request password reset
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    const user = await Facility.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = Math.random().toString(36).substring(2, 15);
    codes[email] = { token, expires: Date.now() + 15 * 60 * 1000 }; // 15 min expiry

    await sendResetEmail(email, token);

    res.json({ message: 'Password reset token sent to email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Reset password
export async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body;
    const record = codes[email];
    if (!record || record.token !== token || Date.now() > record.expires) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    delete codes[email];

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Facility.updateOne({ email }, { password: hashedPassword });

    await mailer({
      to: email,
      subject: 'Password Reset Successful',
      text: 'Your password has been reset successfully.'
    });

    res.json({ message: 'Password reset successful. Confirmation email sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Logout (for JWT, just delete token on client)
export function logoutManager(req, res) {
  res.json({ message: 'Logged out successfully.' });
}