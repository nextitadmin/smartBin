import express from 'express';
import cookieSession from 'cookie-session';
import connectDB from './src/config/conn.js';
import cors from 'cors';
import flash from 'connect-flash';
const app = express();
import  payerRoute from './src/routes/payer.js'
import agentRoute from './src/routes/agent.js';
import residentRoute from './src/routes/resident.js'
import facilityRoute from './src/routes/facility.manager.js';
import corporateRoutes from './src/routes/corporate.js';
const PORT = process.env.PORT || 5000;

//DBConn
connectDB();

// Middleware
app.use(express.urlencoded({extended: true}))
app.use(cors());
app.use(express.json());

//session
app.use(cookieSession({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    maxAge: 24 * 60 * 60 * 1000,
    cookie: {
        secure: true
    }
}))


// Routes
app.use ('/api/payers',payerRoute)
app.use ('/api/agent',agentRoute)
app.use ('/api/resident',residentRoute)
app.use ('/api/facility', facilityRoute);
app.use ('/api/corporate', corporateRoutes);

// Default route
app.get('/', (req, res) => {
    res.json({ message : 'Welcome to the SmartBin API!' });
});

// api
app.get('/api/status', (req, res) => {
    res.json({ status: 'SmartBin server is running.' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(process.env.PORT || PORT, () => {
    console.log(`serving on http://localhost:${PORT}`)
})