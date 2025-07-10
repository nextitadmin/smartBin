import bcrypt from "bcryptjs";
import Corporate from "../../models/corporate.js";
import Payer from "../../models/payer.js";
import jwt from "jsonwebtoken";
import Payer from "../../models/payer.js";

const JWT_SECRET = process.env.JWT_SECRET;

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
    return res.status(201).json({
      message: 'business registered successfully',
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

export async function loginCorporate(req, res) {
  const { email, password } = req.body;
  try {
    const corporate = await Corporate.find({ email });
    if (!corporate) {
      return res.status(404).json({ message: 'business not found' });
    }   
    const match = await bcrypt.compare(password, corporate.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ id: corporate._id }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({
        message: 'Login successful',
        token,
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
        message: 'Error logging in corporate Business',
        error: error.message
      });
    }
}


