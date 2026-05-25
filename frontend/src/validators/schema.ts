// Placeholder for Zod/Yup schemas
export const Schemas = {
  Login: {
    email: 'required|email',
    password: 'required|min:8',
  },
  Register: {
    email: 'required|email',
    password: 'required|min:12|strong',
    company: 'required|min:2',
  },
};
