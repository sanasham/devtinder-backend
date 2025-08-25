import bcrypt from 'bcrypt';
import userModel from '../models/user.js';
import { validateSignUpData } from '../utils/userValidation.js';

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, age, password } = req.body;
    const validate = validateSignUpData(req.body);

    if (validate.isValid) {
      return res
        .status(422)
        .json({ message: 'Validation failed', errors: validate.errors });
    }

    // Basic validation

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new userModel({
      firstName,
      lastName,
      email,
      age,
      password: hashedPassword,
    });
    console.log(newUser);
    await newUser.save();
    const { password: pwd, ...responseUser } = newUser.toObject();
    res
      .status(201)
      .json({ message: 'User registered successfully', user: responseUser });
  } catch (error) {
    const formattedError = userModel.formatValidationError(error);
    console.log(formattedError);
    const { statusCode, ...newResponse } = formattedError;
    res.status(formattedError.statusCode).json(newResponse);
  }
};
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user by email
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);

//     // Check password
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }
//     const {
//       password: pwd,
//       createdAt,
//       updatedAt,
//       __v,
//       ...responseUser
//     } = user.toObject();
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });

//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production', // Set to true in production
//       sameSite: 'strict',
//       expires: new Date(Date.now() + 60 * 60 * 1000),
//       path: '/', // Available to all routes
//     });
//     // Successful login
//     res.status(200).json({ message: 'Login successful', responseUser });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
export const getUserProfile = async (req, res) => {
  try {
    // const { token } = req.cookies;
    // if (!token) {
    //   return res
    //     .status(401)
    //     .json({ message: 'Unauthorized: No token provided' });
    // }
    // let decoded;
    // try {
    //   decoded = jwt.verify(token, process.env.JWT_SECRET);
    // } catch (err) {
    //   return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    // }
    // const userId = decoded.id;
    // if (!userId) {
    //   return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    // }
    const userId = req.user._id;
    // Find user by ID
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const {
      password,
      refreshTokenHash,
      refreshTokenJti,
      refreshTokenExpiresAt,
      ...userData
    } = user.toObject();
    res.status(200).json({ userData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// export const updateUserProfile = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const updates = req.body;
//     const ALLOWED_UPDATES = [
//       'firstName',
//       'lastName',
//       'age',
//       'gender',
//       'photoUrl',
//     ];
//     const isValidOperation = Object.keys(updates).every((update) =>
//       ALLOWED_UPDATES.includes(update)
//     );
//     if (!isValidOperation) {
//       return res.status(400).json({ message: 'Invalid updates!' });
//     }

//     // Update user by ID
//     const updatedUser = await userModel
//       .findByIdAndUpdate(userId, updates, { new: true })
//       .select('-password');
//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res
//       .status(200)
//       .json({ message: 'Profile updated successfully', user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
// export const deleteUserAccount = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Delete user by ID
//     const deletedUser = await userModel.findByIdAndDelete(userId);
//     if (!deletedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.status(200).json({ message: 'Account deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // Find user by email
//     const user = await userModel.find.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // Here you would typically generate a reset token and send an email
//     res.status(200).json({ message: 'Password reset link sent to email' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
// export const resetPassword = async (req, res) => {
//   try {
//     const { userId, newPassword } = req.body;

//     // Find user by ID and update password
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     user.password = newPassword;
//     await user.save();
//     res.status(200).json({ message: 'Password reset successful' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
