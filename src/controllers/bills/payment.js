import Payment from "../../models/bills/payment.js";
import crypto from 'crypto'

export async function getPayment (req, res) {
    try {
        if(!req.user || req.user.id) {
            return res.status(401).json({message: 'authentication Error: please log in'})
        }
        const userId = req.user.id;
        const payment = await Payment.findOne({userId}).lean();
        if(!payment) {
            return res.json({
                message: 'payment details',
                data: {amount: 0, services: []}
            });
        }
        res.json({
            message: 'payment retrieved successfully',
            data: {
                transactionId: payment.transactId,
                amount: payment.amount,
                service: payment.service,
                Status: payment.status,
                method: payment.method,
                paymentDate: payment.date,
            }
        })
    } catch (error) {
        console.log("Error getting payment");
        res.status(500).json({
            message: 'Internal server error'
        })
    }
}

export async function createPayment (req,res) {
    const userId = req.user.id;
    const {service, amount, payMethod} = req.body || {};
    try {
        if(!req.user || !req.user.id) {
           return res.status(401).json({message: 'authentication Error: please log in'})
        }
       if(typeof amount !== 'number' || amount < 100) {
        return res.status(400).json({message: 'amount must be above 100'})
       }
       const transactId = crypto.randomBytes(5).toString('hex')
       const payment = await Payment.findOne({userId});
       if(!payment) payment = await Payment.create({ 
        userId, amount: 0})

        payment.amount += amount;
        const newPayment = {
            amount,
            transactId,
            payMethod,
            service,
            data: new Date()
        };
        payment.push(newPayment);
        await payment.save();

        res.json({
            message: 'Payment successful',
            data: {
                transactId,
                amount,
                service,
                payMethod: 'Successful',
                date: new Date()
            },
        })
    } catch (error) {
        console.log('Error creating Payment', error);
        res.status(500).json({ message: 'Internal Server Error'})
    }
}

export async function getReceipt (req, res) {
    if(!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Authentication error: Please log in.' });
    }
    try {
        const userId = req.user.id;
        const receipt = await Payment.findOne({userId})

        if(!receipt) {
            return res.json({message: 'error retrieving receipt',
                data:{
                    receipt: []
                }
            });
        }
       
        res.json({
            message: 'payment receipt',
            data: {
                transactionId: receipt.transactId,
                amount: receipt.amount,
                service: receipt.service,
                Status: receipt.status,
                method: receipt.method,
                paymentDate: receipt.date,
                Description: receipt.description
            }

        })
    } catch (error) {
        console.error('cannot get reciept')
        res.status(500).json({message: 'Internal Server Error'})
    }
}