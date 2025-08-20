import express from 'express';

import dotenv from 'dotenv';
import connectDB from './config/database.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/admin', (req, res, next) => {
  console.log('Admin route accessed');
  const token = 'xyz123'; // Simulated token
  if (token !== 'xyz123') {
    return res.status(403).send('Forbidden');
  } else if (token === 'xyz123') {
    console.log('Token is valid');
  } else {
    return res.status(401).send('Unauthorized');
  }

  next();
});
app.get('/admin/getAllData', (req, res) => {
  res.send('Admin Dashboard');
});
app.get('/admin/deletedUser', (req, res) => {
  res.send('Hello, World!');
});
app.get('/user', (req, res) => {
  console.log('User route accessed');
  res.send('Hello, User Garu!');
});
connectDB()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });
