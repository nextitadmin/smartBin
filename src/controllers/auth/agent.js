import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Agent from '../../models/agent.js';
import crypto from 'crypto';
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


// request reset
export async function requestPasswordReset (req, res) {
  try {
    const { email } = req.body;
    const agent = await Agent.findOne({ email });

    if (!agent) {
      return res.status(200).json({ message: 'If an account with that email exists, a password reset email has been sent.' });
    }
    const resetCode =Math.floor(10000 + Math.random() * 90000).toString();
    const resetTokenExpiry = new Date( Date.now() + 20 * 60 * 1000);

    agent.resetToken = resetCode;
    agent.resetTokenExpiry = resetTokenExpiry;
    await agent.save();

    sendResetEmail(email, agent.firstName, resetCode);
    return res.status(200).json({ message: 'If an account with that email exists, a password reset email has been sent.' });
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

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const agent = await Agent.findOneAndUpdate(
      { resetToken: token, resetTokenExpiry: { $gt: Date.now() } },
      {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    );

    if (!agent) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}