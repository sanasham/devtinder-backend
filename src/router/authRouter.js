import express from 'express';
import {
  forgotPassword,
  loginUser,
  logoutUser,
  resetPassword,
} from '../controller/authController.js';
import { getUserProfile, registerUser } from '../controller/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const authRouter = express.Router();

authRouter.get('/', (req, res) => res.send('Root Page'));

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
// // authRouter.post('/refresh', refreshAccessToken);
authRouter.post('/logout', authenticateToken, logoutUser); // ⬅️ Changed to POST

authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

// // ✅ User profile routes
authRouter.get('/profile', authenticateToken, getUserProfile);
// authRouter.put('/update-profile', (req, res) => {
//   res.send('Update Profile Page');
// });
// authRouter.delete('/delete-account', (req, res) => {
//   res.send('Delete Account Page');
// });

export default authRouter;
