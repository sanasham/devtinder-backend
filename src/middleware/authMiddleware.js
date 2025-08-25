// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';

export const authenticateToken = async (req, res, next) => {
  const header = req.headers.authorization;
  const cookieToken = req.cookies?.accessToken;
  const token =
    cookieToken ||
    (header && header.startsWith('Bearer ') && header.split(' ')[1]);

  if (!token) return res.status(401).json({ message: 'Access token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    // if (user.refreshTokenExpiresAt < new Date()) {
    //   return res.status(401).json({ message: 'Refresh token expired' });
    // }
    if (user.refreshTokenHash == null) {
      return res
        .status(401)
        .json({ message: 'User logged out, please login again' });
    }
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
