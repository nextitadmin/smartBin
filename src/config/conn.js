import dotenv from 'dotenv'
import mongoose from "mongoose";

dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'
const dbUri = isProduction ? process.env.DB_URI : process.env.DB_URI

const connectDB = async () => {
    mongoose.set('strictQuery', true)
    try {
        const conn = await mongoose.connect(dbUri, {
            family:4
        });
    } catch (err) {
        throw err
    }
}

export default connectDB
