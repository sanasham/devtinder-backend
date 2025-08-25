// controller/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';
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

export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Email and new password are required' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export const changePassword = asyncHandler(async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Current and new passwords are required' });
    }

    const user = await userModel.findById(userEmail);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
export const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Here you would typically generate a password reset token and send it via email
    const {
      accessToken,
      refreshToken: newRefresh,
      refreshTokenJti,
    } = generateTokens(user._id);
    user.refreshTokenHash = newRefresh;
    user.refreshTokenExpiresAt = newRefresh.expiresIn;
    user.refreshTokenJti = refreshTokenJti;
    await user.save();
    const resetUrl = `${
      process.env.FRONTEND_URL
    }/reset-password?token=${accessToken}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your DevTinder account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 15 mins.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>DevTinder Team</p>
      `,
    });
    res.json({ message: 'Password reset link has been sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
