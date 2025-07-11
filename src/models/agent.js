import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  country: { type: String, trim: true, default: 'Nigeria' }
}, { _id: false });

const agentSchema = new mongoose.Schema({
  payerId: {
    type: String,
    required: true,
    unique: true,
  },
  agencyName: {
    type: String,
    required: true,
    unique: true,
  },
  businessEmail: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  addresses: {
    type: [addressSchema],
  },
  regNumber: {
    type: String,
    unique: true,
    trim: true
  },
  regCertificate: {
    type: String, 
    
  },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    lowercase: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
  },
  nationality: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default : 'Other'
  },
 idType: {
    type: String,
    enum: ['NIN', 'Drivers_License', 'Voters_Card', 'International_Passport'],
    default: 'NIN'
  },
  idNumber: {
    type: String,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiry: Date,
  loginCode: String,
  loginCodeExpiry: Date,
  profilePicture: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Agent = mongoose.model('Agent', agentSchema);
export default Agent;