import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './DB/DB_Connection.js'
import { app } from './app.js';
const PORT = process.env.PORT || 5000;

connectDB();
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample Route
app.get('/', (req, res) => {
    res.send('Express Server is Running!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});