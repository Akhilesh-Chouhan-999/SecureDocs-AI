/**
 * Redux Toolkit slice for Authentication.
 * Placeholder for future Redux migration.
 */
export const authSlice = {
  name: 'auth',
  initialState: {
    user: null,
    token: null,
  },
  reducers: {
    login: (state: any, action: any) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state: any) => {
      state.user = null;
      state.token = null;
    }
  }
};
