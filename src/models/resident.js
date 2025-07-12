import mongoose from 'mongoose';

const residentSchema = new mongoose.Schema({
  payerId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    lowercase: true,
    unique: true,
  },
   profilePicture: String,
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
  lawmaCustomerType: {
    type: String,
    enum: ['Returning', 'New'],
    default: 'Returning'
   
  },
  password: {
    type: String,
    required: true,
  },
  loginCode: String,
  loginCodeExpiry: Date,
  resetToken: String,
  resetTokenExpiry: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});



const Resident = mongoose.model('Resident', residentSchema);
export default Resident;