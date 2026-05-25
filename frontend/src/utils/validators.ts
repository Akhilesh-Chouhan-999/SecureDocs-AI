import { VALIDATION_RULES } from '../constants/validationRules';

export const validators = {
  isValidEmail: (email: string): boolean => {
    return VALIDATION_RULES.EMAIL.REGEX.test(email);
  },

  isValidPassword: (password: string): boolean => {
    return VALIDATION_RULES.PASSWORD.REGEX.test(password);
  },

  getPasswordStrength: (password: string): number => {
    let score = 0;
    if (password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // Returns 0-5
  },

  isValidCompanyName: (name: string): boolean => {
    return name.length >= VALIDATION_RULES.COMPANY_NAME.MIN_LENGTH && 
           name.length <= VALIDATION_RULES.COMPANY_NAME.MAX_LENGTH;
  }
};
