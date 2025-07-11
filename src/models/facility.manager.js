import mongoose from 'mongoose';

const facilityManagerSchema = new mongoose.Schema({
  payerId: { 
    type: String, 
    required: true ,
    unique: true,
},
  organizationName: { 
    type: String, 
    required: true,
    unique: true,
},
  firstName: { 
    type: String, 
    required: true 
},
  lastName: { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    required: true, 
    lowercase: true,
    unique: true,
},
  phoneNumber: { 
    type: String, 
    required: true
 },
  password: { 
    type: String, 
    required: true 
},
  loginCode: {
    type: String,
    default: null
  },
  loginCodeExpires: {
    type: Date,
    default: null
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Facility = mongoose.model('FacilityManager', facilityManagerSchema);
export default Facility;