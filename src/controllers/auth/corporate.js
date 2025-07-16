import bcrypt from "bcryptjs";
import Corporate from "../../models/users/corporate.js";
import Payer from "../../models/users/payer.js";
import jwt from "jsonwebtoken";
import { sendConfirmationMail, sendResetEmail, sendLoginCodeEmail } from '../../utils/mailer.js';

 const JWT_SECRET = process.env.JWT_SECRET;


// Registration
export async function regCorporate(req, res) {
  const { payerId, businessName, password, phoneNumber, confirmPassword } = req.body;
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
      phoneNumber,
      businessName,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      password: hashedPassword
    });

    await sendConfirmationMail(newCorporate.email, newCorporate.firstName);
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



// Login 
export async function  loginCorporate(req, res) {
  const { email, password } = req.body;
  try {
    const business = await Corporate.findOne({ email });
    if (!business) return res.status(404).json({ error: 'business not found' });

    const valid = await bcrypt.compare(password, business.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expires = Date.now() + 10 * 60 * 1000;

    business.loginCode = code;
    business.loginCodeExpires = expires;
    await business.save();

    req.session.loginVerificationUserId = business._id;
    await sendLoginCodeEmail(business.email, business.firstName, code);
    res.json({ 
      message: 'A verification code has been sent to your email.',
      email: business.email
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

    const business = await Corporate.findOne({
      _id: userId,
      loginCode,
      loginCodeExpires: { $gt: Date.now() }
    });

    if (!business) {
      return res.status(400).json({ message: 'Invalid or expired login code.' });
    }

    req.session.loginVerificationUserId = null;
    business.loginCode = undefined;
    business.loginCodeExpires= undefined;
    await business.save();

    const token = jwt.sign(
      { id: business._id, payerId: business.payerId, email: business.email, role: 'Corporate' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const businessResponse = { ...business.toObject() };
    delete businessResponse.password;
    delete businessResponse.loginCode;
    delete businessResponse.loginCodeExpires;

    return res.status(200).json({ message: 'Login successful', token, business: businessResponse });
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying login code', error: error.message });
  }
}

export async function updateProfilePicture(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const business = await Corporate.findById(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Corporate not found' });
    }

    business.profilePicture = req.file.path; 
    await business.save();

    return res.status(200).json({ message: 'Profile picture updated successfully', profilePicture: business.profilePicture });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile picture', error: error.message });
  }
}

export async function getCorporateProfile(req, res) {
  try {
    const business = await Corporate.findById(req.business.id).select('firstName lastName profilePicture');

    if (!business) {
      return res.status(404).json({ message: 'Corporate body not found' });
    }
    const defaultAvatar = 'https://res.cloudinary.com/demo/image/upload/avatar.png';
    return res.status(200).json({ fullName: `${business.firstName} ${business.lastName}`, profilePicture: business.profilePicture || defaultAvatar });
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

        const business = await Corporate.findOneAndUpdate(
            { email },
            { $set: { resetToken: resetCode, resetTokenExpiry: resetTokenExpiry } },
            { new: false }
        );

        if (business) {
            await sendResetEmail(business.email, business.firstName, resetCode);
        }

        return res.status(200).json({
            message: 'If an account with that email exists, a password reset code has been sent.',
            email: email
        });
    } catch (error) {
        console.error('Error in requestPasswordReset (business):', error);
        return res.status(500).json({ message: 'Error requesting password reset', error: error.message });
 }
};


export async function verifyPasswordResetCode(req, res) {
  try {
    const {resetCode } = req.body;

    if (!resetCode) {
      return res.status(400).json({ message: 'Email and reset code are required.' });
    }
    const business = await Corporate.findOne({
      
      resetToken: resetCode,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!business) {
      return res.status(400).json({ message: 'Invalid email or reset code, or the code has expired.' });
    }

    req.session.passwordResetUserId =business._id;
  
    return res.status(200).json({ message: 'Code verified successfully. You can now set a new password.' });
  } catch (error) {
    console.error('Error in verifyPasswordResetCode (business):', error);
    return res.status(500).json({ message: 'Error verifying reset code', error: error.message });
  } 
}


// Reset password
export async function  resetPassword(req, res) {
    try {
        const { newPassword, confirmPassword } = req.body;
        const businessId = req.session.passwordResetUserId;
     

        if (!businessId ) {
            return res.status(401).json({ message: 'Password reset not authorized or session expired. Please verify your reset code first.' });
        }

        if (!newPassword || newPassword !== confirmPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Passwords do not match or are less than 6 characters.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Corporate.updateOne({ _id: businessId }, { $set: { password: hashedPassword, resetToken: null, resetTokenExpiry: null } });

        req.session.passwordResetUserId = null;
        req.session.passwordResetUserType = null;

        return res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Error in resetPassword (agent):', error);
        return res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
}



// Logout (for JWT, just delete token on client)
export function logoutCorporate(req, res) {
  res.json({ message: 'Logged out successfully.' });
}


