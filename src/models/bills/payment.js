import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true, 
        unique: true 
    },    
    transactId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    service: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    payMethod: {
        type: String,
        enum: ['Alat By Wema', 'Bank Transfer'],
        default: 'Alat By Wema'
    },
    status: {
        type: String,
        enum: ['Successful', 'Failed', 'Pending'],
        default: 'Pending'
    },
    description: {
        type: String,
        required: true
    }
})

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;