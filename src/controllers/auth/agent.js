import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Agent from '../../models/agent.js';
import Payer from '../../models/payer.js';
import { sendConfirmationMail, sendResetEmail, sendLoginCodeEmail } from '../../utils/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET;


// sign up
export async function registerAgent(req, res) {
  try {
    const {
      payerId,
       agencyName,
      password,
      confirmPassword,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

    const existingAgent = await Agent.findOne({ payerId });
    if (existingAgent) {
      return res.status(409).json({ message: 'Agent already registered with this payerId and email' });
    }

    const payer = await Payer.findOne({ payerId });
    if (!payer) {
      return res.status(404).json({ message: 'Invalid payerId' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = await Agent.create({
      payerId,
      agencyName,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      password: hashedPassword
    });

    sendConfirmationMail(newAgent.email, newAgent.firstName);
    return res.status(201).json({
      message: 'Agent registered successfully',
      agent: {
        id:newAgent._id,
        payerId: newAgent.payerId,
        fullName: `${newAgent.firstName} ${newAgent.lastName}`,
        email: newAgent.email,
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error registering agent',
      error: error.message
    });
  }
}



// login

export async function login(req,res){
  console.log('incoming body:', req.body)
  try {
    const { email, password } = req.body;

    const agent = await Agent.findOne({email});
    if(!agent){
      return res.status(401).json({message:"Invalid email or password"})
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if(!isMatch){
      return   res.status(401).json({message:"Invalid email or password"});
    }

    const loginCode = Math.floor(10000 + Math.random() * 90000).toString();
  
    const loginCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    agent.loginCode = loginCode;
    agent.loginCodeExpiry = loginCodeExpiry;
    await agent.save();

    req.session.loginVerificationUserId = agent._id;

    await sendLoginCodeEmail(agent.email, agent.firstName, loginCode);

    return res.status(200).json({
      message: 'A verification code has been sent to your email',

      email: agent.email
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

    const agent = await Agent.findOne({
      _id: userId,
      loginCode,
      loginCodeExpiry: { $gt: Date.now() }
    });

    if (!agent) {
      return res.status(400).json({ message: 'Invalid or expired login code.' });
    }

    req.session.loginVerificationUserId = null;
    agent.loginCode = undefined;
    agent.loginCodeExpiry = undefined;
    await agent.save();

    const token = jwt.sign(
      { id: agent._id, payerId: agent.payerId, email: agent.email, role: 'agent' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const agentResponse = { ...agent.toObject() };
    delete agentResponse.password;
    delete agentResponse.loginCode;
    delete agentResponse.loginCodeExpiry;

    return res.status(200).json({ message: 'Login successful', token, agent: agentResponse });
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying login code', error: error.message });
  }
}

export async function updateProfilePicture(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const agent = await Agent.findById(req.user.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    agent.profilePicture = req.file.path; // URL from Cloudinary
    await agent.save();

    return res.status(200).json({ message: 'Profile picture updated successfully', profilePicture: agent.profilePicture });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile picture', error: error.message });
  }
}

export async function getAgentProfile(req, res) {
  try {
    const agent = await Agent.findById(req.user.id).select('firstName lastName profilePicture');

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    const defaultAvatar = 'https://res.cloudinary.com/demo/image/upload/avatar.png';
    return res.status(200).json({ fullName: `${agent.firstName} ${agent.lastName}`, profilePicture: agent.profilePicture || defaultAvatar });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching agent profile', error: error.message });
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

        const agent = await Agent.findOneAndUpdate(
            { email },
            { $set: { resetToken: resetCode, resetTokenExpiry: resetTokenExpiry } },
            { new: false }
        );

        if (agent) {
            await sendResetEmail(agent.email, agent.firstName, resetCode);
        }

        return res.status(200).json({
            message: 'If an account with that email exists, a password reset code has been sent.',
            email: email
        });
    } catch (error) {
        console.error('Error in requestPasswordReset (agent):', error);
        return res.status(500).json({ message: 'Error requesting password reset', error: error.message });
 }
};


export async function verifyPasswordResetCode(req, res) {
  try {
    const {resetCode } = req.body;

    if (!resetCode) {
      return res.status(400).json({ message: 'Email and reset code are required.' });
    }

    const agent = await Agent.findOne({
      
      resetToken: resetCode,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!agent) {
      return res.status(400).json({ message: 'Invalid email or reset code, or the code has expired.' });
    }

    req.session.passwordResetUserId = agent._id;
  

    return res.status(200).json({ message: 'Code verified successfully. You can now set a new password.' });
  } catch (error) {
    console.error('Error in verifyPasswordResetCode (agent):', error);
    return res.status(500).json({ message: 'Error verifying reset code', error: error.message });
  } 
}

// Reset password
export async function  resetPassword(req, res) {
    try {
        const { newPassword, confirmPassword } = req.body;
        const userId = req.session.passwordResetUserId;
     

        if (!userId ) {
            return res.status(401).json({ message: 'Password reset not authorized or session expired. Please verify your reset code first.' });
        }

        if (!newPassword || newPassword !== confirmPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Passwords do not match or are less than 6 characters.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Agent.updateOne({ _id: userId }, { $set: { password: hashedPassword, resetToken: null, resetTokenExpiry: null } });

        req.session.passwordResetUserId = null;
        req.session.passwordResetUserType = null;

        return res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Error in resetPassword (agent):', error);
        return res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
}



export async function logout(req, res) {
  try {
    req.session = null;
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging out', error: error.message });
  }
}
