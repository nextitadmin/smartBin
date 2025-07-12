import express from 'express';
import cookieSession from 'cookie-session';
import connectDB from './src/config/conn.js';
import cors from 'cors';
import flash from 'connect-flash';
const app = express();
import  payerRoute from './src/routes/payer.js'
import agentRoute from './src/routes/agent.js';
import residentRoute from './src/routes/resident.js';
import corporateRoute from './src/routes/corporate.js';
import facilityRoute from './src/routes/facility.manager.js';
import corporate from './src/routes/corporate.js';
import walletRoute from './src/routes/bills/wallet.js';

const PORT = process.env.PORT || 5000;


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
app.use ('/api/corporate',corporateRoute)
app.use ('/api/facility', facilityRoute);
app.use ('/api/corporate', corporate);
app.use ('/api/wallet', walletRoute);


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


// Start server and connect to the database
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log('Invalid database connection...', error);
  });