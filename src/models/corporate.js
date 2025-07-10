import mongoose from "mongoose";

const corporateSchema = new mongoose.Schema ({
    payerId:{
        type: String,
        required: trrue,
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const Corporate = mongoose.model('Corporate', corporateSchema);
export default Corporate;
