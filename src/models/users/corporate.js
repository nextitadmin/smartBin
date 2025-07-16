import mongoose from "mongoose";

const corporateSchema = new mongoose.Schema ({
    payerId:{
        type: String,
        required: true,
        unique: true,
    },
    businessName:{
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
    profilePicture: String,
    phoneNumber: String,
       
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Corporate'],
        default: 'Corporate'
    },
    loginCode: String,
    loginCodeExpires: Date,
    resetToken: String,
    resetTokenExpires: Date,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const Corporate = mongoose.model('Corporate', corporateSchema);
export default Corporate;
