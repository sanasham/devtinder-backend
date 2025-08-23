import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      lowercase: true, // always store in lowercase
      validate: {
        validator: (value) => validator.isEmail(value),
        message: 'Please provide a valid email address',
      },
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
    },
    gender: {
      type: String,
      validate: {
        validator: (value) =>
          ['male', 'female', 'other'].includes(value.toLowerCase()),
        message: 'Gender data is not valid',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      maxlength: [25, 'Password cannot exceed 25 characters'],
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
