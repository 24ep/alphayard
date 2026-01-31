import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  userType: 'Circle' | 'children' | 'seniors';
  subscriptionTier: 'free' | 'premium' | 'elite';
  circleIds: string[];
  isOnboardingComplete: boolean;
  preferences: {
    notifications: boolean;
    locationSharing: boolean;
    popupSettings: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      maxPerDay: number;
      categories: string[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Create slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
    },
    
    // Logout action
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    
    // Update user action
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Set onboarding complete
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isOnboardingComplete = action.payload;
      }
    },
    
    // Clear error action
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  setOnboardingComplete,
  clearError,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors (for use with useSelector)
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;


