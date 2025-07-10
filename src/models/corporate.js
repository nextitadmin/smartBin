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
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    loginCode: { type: String },
    loginCodeExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const Corporate = mongoose.model('Corporate', corporateSchema);
export default Corporate;
