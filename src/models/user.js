import bcrypt from 'bcrypt';
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
    },
    refreshTokenHash: { type: String, default: null },
    refreshTokenExpiresAt: { type: Date, default: null },
    refreshTokenJti: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.statics.formatValidationError = function (err) {
  if (err.name === 'ValidationError') {
    const errors = {};

    // Extract each error
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }

    return {
      message: 'Validation failed',
      errors: errors,
      statusCode: 422,
    };
  }

  // For other types of errors
  return {
    message: 'Server error',
    error: err.message,
    statusCode: 500,
  };
};

// // hash password if modified
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
