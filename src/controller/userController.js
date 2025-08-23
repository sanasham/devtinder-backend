import userModel from '../models/user.js';
import { validateSignUpData } from '../utils/userValidation.js';

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, age, password } = req.body;
    const validate = validateSignUpData(req.body);
    if (!validate.isValid) {
      return res
        .status(422)
        .json({ message: 'Validation failed', errors: validate.errors });
    }

    console.log(validateSignUpData(req.body));
    // Basic validation

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create new user
    const newUser = new userModel({
      firstName,
      lastName,
      email,
      age,
      password,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user by email
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     } // Check password
//     if (user.password !== password) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     } // Successful login
//     res.status(200).json({ message: 'Login successful', user });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
// export const getUserProfile = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Find user by ID
//     const user = await userModel.findById(userId).select('-password');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.status(200).json({ user });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const ALLOWED_UPDATES = [
      'firstName',
      'lastName',
      'age',
      'gender',
      'photoUrl',
    ];
    const isValidOperation = Object.keys(updates).every((update) =>
      ALLOWED_UPDATES.includes(update)
    );
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }

    // Update user by ID
    const updatedUser = await userModel
      .findByIdAndUpdate(userId, updates, { new: true })
      .select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res
      .status(200)
      .json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
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
