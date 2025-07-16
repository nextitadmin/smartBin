import  mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; 

const payerSchema = new mongoose.Schema({
  payerId: {
    type: String,
    unique: true,
default: () => `PAYER-${uuidv4().split('-')[0].toUpperCase()}`},

  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  nin: {
    type: String,
    required: true,
    unique: true,
    minlength: 11,
    maxlength: 11,
  },
}, { timestamps: true });

const Payer = mongoose.model('Payer', payerSchema);

export default Payer