export const validateSignUpData = (data) => {
  const errors = {};

  if (
    !data.firstName ||
    typeof data.firstName !== 'string' ||
    data.firstName.trim() === ''
  ) {
    errors.firstName = 'First name is required and must be a non-empty string.';
  }

  if (
    data.lastName &&
    (typeof data.lastName !== 'string' || data.lastName.trim() === '')
  ) {
    errors.lastName = 'Last name must be a non-empty string if provided.';
  }

  if (
    !data.email ||
    typeof data.email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  ) {
    errors.email = 'A valid email address is required.';
  }

  if (data.age !== undefined) {
    if (typeof data.age !== 'number' || data.age < 0) {
      errors.age = 'Age must be a non-negative number if provided.';
    }
  }
  if (
    !data.password ||
    typeof data.password !== 'string' ||
    data.password.length < 6 ||
    data.password.length > 25
  ) {
    errors.password =
      'Password is required and must be between 6 and 25 characters.';
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
