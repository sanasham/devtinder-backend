// controller/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateTokens } from '../utils/tokenGenerator.js';

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken, refreshTokenJti } = generateTokens(
      user._id
    );
    user.refreshTokenHash = refreshToken;
    user.refreshTokenExpiresAt = refreshToken.expiresIn;
    user.refreshTokenJti = refreshTokenJti;
    await user.save();

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const accessTokenFromCookie =
      req.cookies.accessToken || req.body.accessToken;
    if (!accessTokenFromCookie) {
      return res.status(401).json({ message: 'accessToken token missing' });
    }

    const decoded = jwt.verify(accessTokenFromCookie, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user || user.accessToken !== accessTokenFromCookie) {
      return res.status(403).json({ message: 'Invalid accessToken token' });
    }

    const { accessToken, refreshToken: newRefresh } = generateTokens(user._id);
    user.refreshTokenHash = newRefresh;
    await user.save();

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res
        .status(400)
        .json({ message: 'Access token missing and please login again' });
    }
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid access token' });
    }
    if (accessToken) {
      const result = await userModel.updateOne(
        { _id: decoded.id },
        {
          $unset: {
            refreshTokenHash: '',
            refreshTokenExpiresAt: '',
            refreshTokenJti: '',
          },
        }
      );
      if (result.modifiedCount === 0) {
        return res.status(400).json({
          message: 'Logout failed due to No user found with this refresh token',
        });
      }
    }

    // Clear cookies
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
});
