import express from 'express';
import { registerUser } from '../controller/userController.js';

const authRouter = express.Router();
authRouter.get('/', (req, res) => {
  console.log('root');
  res.send('Root Page');
});
authRouter.post('/login', (req, res) => {
  res.send('Login Page');
});
authRouter.post('/register', registerUser);
authRouter.get('/logout', (req, res) => {
  res.send('Logout Page');
});
authRouter.post('/forgot-password', (req, res) => {
  res.send('Forgot Password Page');
});
authRouter.post('/reset-password', (req, res) => {
  res.send('Reset Password Page');
});
authRouter.get('/profile', (req, res) => {
  res.send('User Profile Page');
});
authRouter.put('/update-profile', (req, res) => {
  res.send('Update Profile Page');
});
authRouter.delete('/delete-account', (req, res) => {
  res.send('Delete Account Page');
});
export default authRouter;
