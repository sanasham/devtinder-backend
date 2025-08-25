// utils/token.js
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  const refreshTokenJti = uuidv4();
  return { accessToken, refreshToken, refreshTokenJti };
};
