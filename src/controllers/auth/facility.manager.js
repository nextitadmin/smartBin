import Facility from '../../models/facility.manager.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Payer from '../../models/payer.js';
import { sendConfirmationMail, sendResetEmail, sendLoginCodeEmail } from '../../utils/mailer.js';
const JWT_SECRET = process.env.JWT_SECRET;

// Registration
export async function regManager(req, res) {
  const { payerId, password, organizationName, phoneNumber, confirmPassword} = req.body;
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
      phoneNumber,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      password: hashedPassword
    });

    // Send confirmation email
    await sendConfirmationMail(newManager.email, newManager.firstName);
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
    const manager = await Facility.findOne({ email });
    if (!manager) return res.status(404).json({ error: 'manager not found' });

    const valid = await bcrypt.compare(password, manager.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expires = Date.now() + 10 * 60 * 1000;

    manager.loginCode = code;
    manager.loginCodeExpires = expires;
    await manager.save();

    req.session.loginVerificationUserId = manager._id;
    await sendLoginCodeEmail(manager.email, manager.firstName, code);
    res.json({ 
      message: 'A verification code has been sent to your email.', 
      email: manager.email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



// verify login
export async function verifyLogin(req, res) {
  try {
    const { loginCode } = req.body;

    if (!loginCode) {
      return res.status(400).json({ message: 'Login code is required.' });
    }

    const userId = req.session.loginVerificationUserId;
    if (!userId) {
      return res.status(401).json({ message: 'No login attempt in progress or session expired. Please try logging in again.' });
    }

    const manager= await Facility.findOne({
      _id: userId,
      loginCode,
      loginCodeExpires: { $gt: Date.now() }
    });

    if (!manager) {
      return res.status(400).json({ message: 'Invalid or expired login code.' });
    }

    req.session.loginVerificationUserId = null;
    manager.loginCode = undefined;
    manager.loginCodeExpires= undefined;
    await manager.save();

    const token = jwt.sign(
      { id: manager._id, payerId: manager.payerId, email: manager.email, role: 'facility manager' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const managerResponse = { ...manager.toObject() };
    delete managerResponse.password;
    delete managerResponse.loginCode;
    delete managerResponse.loginCodeExpires;

    return res.status(200).json({ message: 'Login successful', token, manager: managerResponse });
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying login code', error: error.message });
  }
}

export async function updateProfilePicture(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const manager = await Facility.findById(req.user.id);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    manager.profilePicture = req.file.path; // URL from Cloudinary
    await manager.save();

    return res.status(200).json({ message: 'Profile picture updated successfully', profilePicture: manager.profilePicture });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile picture', error: error.message });
  }
}

export async function getManagerProfile(req, res) {
  try {
    const manager = await Facility.findById(req.user.id).select('firstName lastName profilePicture');

    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    const defaultAvatar = 'https://res.cloudinary.com/demo/image/upload/avatar.png';
    return res.status(200).json({ fullName: `${manager.firstName} ${manager.lastName}`, profilePicture: manager.profilePicture || defaultAvatar });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching agent profile', error: error.message });
  }
}


// Request password reset
export async function requestPasswordReset (req, res) {
    try {
        const { email } = req.body;  
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
        const resetTokenExpiry = new Date(Date.now() + 20 * 60 * 1000);

        const manager = await Facility.findOneAndUpdate(
            { email },
            { $set: { resetToken: resetCode, resetTokenExpiry: resetTokenExpiry } },
            { new: false }
        );

        if (manager) {
            await sendResetEmail(manager.email, manager.firstName, resetCode);
        }

        return res.status(200).json({
            message: 'If an account with that email exists, a password reset code has been sent.',
            email: email
        });
    } catch (error) {
        console.error('Error in requestPasswordReset (manager):', error);
        return res.status(500).json({ message: 'Error requesting password reset', error: error.message });
 }
};


export async function verifyPasswordResetCode(req, res) {
  try {
    const {resetCode } = req.body;

    if (!resetCode) {
      return res.status(400).json({ message: 'Email and reset code are required.' });
    }
    const manager = await Facility.findOne({
      
      resetToken: resetCode,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!manager) {
      return res.status(400).json({ message: 'Invalid email or reset code, or the code has expired.' });
    }

    req.session.passwordResetUserId =manager._id;
  
    return res.status(200).json({ message: 'Code verified successfully. You can now set a new password.' });
  } catch (error) {
    console.error('Error in verifyPasswordResetCode (manager):', error);
    return res.status(500).json({ message: 'Error verifying reset code', error: error.message });
  } 
}


// Reset password
export async function  resetPassword(req, res) {
    try {
        const { newPassword, confirmPassword } = req.body;
        const managerId = req.session.passwordResetUserId;
     

        if (!managerId ) {
            return res.status(401).json({ message: 'Password reset not authorized or session expired. Please verify your reset code first.' });
        }

        if (!newPassword || newPassword !== confirmPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Passwords do not match or are less than 6 characters.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Facility.updateOne({ _id: managerId }, { $set: { password: hashedPassword, resetToken: null, resetTokenExpiry: null } });

        req.session.passwordResetUserId = null;
        req.session.passwordResetUserType = null;

        return res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Error in resetPassword (manager):', error);
        return res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
}



// Logout (for JWT, just delete token on client)
export function logoutManager(req, res) {
  res.json({ message: 'Logged out successfully.' });
}