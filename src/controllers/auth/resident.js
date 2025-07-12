import bcrypt from 'bcryptjs';
import Resident from '../../models/resident.js';
import Payer from '../../models/payer.js';
import jwt from 'jsonwebtoken';
import {sendResetEmail, sendConfirmationMail, sendLoginCodeEmail} from '../../utils/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET;

// register
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

// login
export async function login(req,res){
  console.log('incoming body:', req.body)
  try {
    const { email, password } = req.body;

    const resident = await Resident.findOne({email});
    if(!resident){
      return res.status(401).json({message:"Invalid email or password"})
    }

    const isMatch = await bcrypt.compare(password, resident.password);
    if(!isMatch){
      return   res.status(401).json({message:"Invalid email or password"});
    }

    const loginCode = Math.floor(10000 + Math.random() * 90000).toString();
  
    const loginCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    resident.loginCode = loginCode;
    resident.loginCodeExpiry = loginCodeExpiry;
    await resident.save();

    req.session.loginVerificationUserId = resident._id;

    await sendLoginCodeEmail(resident.email, resident.firstName, loginCode);

    return res.status(200).json({
      message: 'A verification code has been sent to your email',

      email: resident.email
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
}

// verify login
export async function verifyLoginCode(req, res) {
  try {
    const { loginCode } = req.body;

    if (!loginCode) {
      return res.status(400).json({ message: 'Login code is required.' });
    }

    const userId = req.session.loginVerificationUserId;
    if (!userId) {
      return res.status(401).json({ message: 'No login attempt in progress or session expired. Please try logging in again.' });
    }

    const resident = await Resident.findOne({
      _id: userId,
      loginCode,
      loginCodeExpiry: { $gt: Date.now() }
    });

    if (!resident) {
      return res.status(400).json({ message: 'Invalid or expired login code.' });
    }

    req.session.loginVerificationUserId = null;
    resident.loginCode = undefined;
    resident.loginCodeExpiry = undefined;
    await resident.save();

    const token = jwt.sign(
      { id: resident._id, payerId: resident.payerId, email: resident.email, role: 'resident' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const residentResponse = { ...resident.toObject() };
    delete residentResponse.password;
    delete residentResponse.loginCode;
    delete residentResponse.loginCodeExpiry;

    return res.status(200).json({ message: 'Login successful', token, resident: residentResponse });
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying login code', error: error.message });
  }
}


// update profile picture
export async function updateProfilePicture(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const resident = await Resident.findById(req.user.id);
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    resident.profilePicture = req.file.path;
    await resident.save();

    return res.status(200).json({ message: 'Profile picture updated successfully', profilePicture: resident.profilePicture });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile picture', error: error.message });
  }
}




// get profile for onboarding
export async function getResidentProfile(req, res) {
  try {
  
    const resident = await Resident.findById(req.user.id).select('firstName lastName profilePicture');

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
 const defaultAvatar = 'https://res.cloudinary.com/demo/image/upload/avatar.png';
    return res.status(200).json({ fullName: `${resident.firstName} ${resident.lastName}`, profilePicture: resident.profilePicture || defaultAvatar  });
  } catch (error){
      return res.status(500).json({ error: error.message });
  }
}



// request reset
export async function requestPasswordReset (req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    const resetTokenExpiry = new Date(Date.now() + 20 * 60 * 1000);

    const resident = await Resident.findOneAndUpdate(
      { email },
      { $set: { resetToken: resetCode, resetTokenExpiry: resetTokenExpiry } },
      { new: false }
    );

    if (resident) {
      await sendResetEmail(resident.email, resident.firstName, resetCode);
    }

    return res.status(200).json({
      message: 'If an account with that email exists, a password reset code has been sent.',
      email: email
    });
  } catch (error) {
    console.error('Error in requestPasswordReset (resident):', error);
    return res.status(500).json({ message: 'Error requesting password reset', error: error.message});
 }
};



// verify resetcode
export async function verifyPasswordResetCode(req, res) {
  try {
    const { resetCode } = req.body;
    if (!resetCode) {
      return res.status(400).json({ message: 'Please input reset code' });
    }
    const resident = await Resident.findOne({
      resetToken: resetCode,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!resident) {
      return res.status(400).json({ message: 'Invalid reset code, or the code has expired.' });
    }
    req.session.passwordResetUserId = resident._id;
  
    return res.status(200).json({ message: 'Code verified successfully. You can now set a new password.' });
  } catch (error) {
    console.error('Error in verifyPasswordResetCode (resident):', error);
    return res.status(500).json({ message: 'Error verifying reset code', error: error.message });
  } 
}

// Reset password
export async function  resetPassword(req, res) {
    try {
        const { newPassword, confirmPassword } = req.body;
        const userId = req.session.passwordResetUserId;
        const userType = req.session.passwordResetUserType;

        if (!userId || userType !== 'resident') {
            return res.status(401).json({ message: 'Password reset not authorized or session expired. Please verify your reset code first.' });
        }

        if (!newPassword || newPassword !== confirmPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Passwords do not match or are less than 6 characters.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await Resident.updateOne({ _id: userId }, { $set: { password: hashedPassword, resetToken: null, resetTokenExpiry: null } });

        req.session.passwordResetUserId = null;
        req.session.passwordResetUserType = null;

        return res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Error in resetPassword (resident):', error);
        return res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
}


// logout
export async function logout(req, res) {
  try {
    req.session = null;
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging out', error: error.message });
  }
}