export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (
  password: string,
  email?: string,
  fullName?: string
): PasswordValidationResult => {
  const errors: string[] = [];

  // Minimum length check
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number (0-9)");
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    errors.push("Password must contain at least one special character (! @ # $ % ^ & *)");
  }

  // Repeated characters check (no more than 3 in a row)
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Password cannot have more than 2 repeated characters in a row");
  }

  // Check if password contains email username
  if (email) {
    const emailUsername = email.split('@')[0].toLowerCase();
    if (password.toLowerCase().includes(emailUsername)) {
      errors.push("Password cannot contain your email address");
    }
  }

  // Check if password contains name
  if (fullName) {
    const nameParts = fullName.toLowerCase().split(' ');
    for (const part of nameParts) {
      if (part.length > 2 && password.toLowerCase().includes(part)) {
        errors.push("Password cannot contain your name");
        break;
      }
    }
  }

  // Common passwords check
  const commonPasswords = [
    'password123', 'password1234', '123456789012', 'qwertyuiop12',
    'adminpassword', 'temppassword', 'defaultpassword', 'changepassword',
    'passwordpassword', '123456abcdef', 'abcdef123456', 'welcome12345'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password cannot be a common password");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPasswordStrengthColor = (errors: string[]): string => {
  if (errors.length === 0) return "text-green-600";
  if (errors.length <= 2) return "text-yellow-600";
  return "text-red-600";
};

export const getPasswordStrengthText = (errors: string[]): string => {
  if (errors.length === 0) return "Strong";
  if (errors.length <= 2) return "Medium";
  return "Weak";
};