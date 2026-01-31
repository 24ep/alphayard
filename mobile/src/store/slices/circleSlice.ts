import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface CircleMember {
  id: string;
  userId: string;
  circleId: string;
  role: 'parent' | 'child' | 'senior' | 'guardian';
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CircleState {
  members: CircleMember[];
  currentCircle: Circle | null;
  circles: Circle[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: CircleState = {
  members: [],
  currentCircle: null,
  circles: [],
  loading: false,
  error: null,
};

// Create slice
const circleSlice = createSlice({
  name: 'circle',
  initialState,
  reducers: {
    // Set members
    setMembers: (state, action: PayloadAction<CircleMember[]>) => {
      state.members = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Add member
    addMember: (state, action: PayloadAction<CircleMember>) => {
      state.members.push(action.payload);
    },
    
    // Update member
    updateMember: (state, action: PayloadAction<CircleMember>) => {
      const index = state.members.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },
    
    // Remove member
    removeMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter((m) => m.id !== action.payload);
    },
    
    // Set current circle
    setCurrentCircle: (state, action: PayloadAction<Circle | null>) => {
      state.currentCircle = action.payload;
    },
    
    // Set circles
    setCircles: (state, action: PayloadAction<Circle[]>) => {
      state.circles = action.payload;
    },
    
    // Update circle
    updateCircle: (state, action: PayloadAction<Circle>) => {
      if (state.currentCircle?.id === action.payload.id) {
        state.currentCircle = action.payload;
      }
      const index = state.circles.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.circles[index] = action.payload;
      }
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setMembers,
  addMember,
  updateMember,
  removeMember,
  setCurrentCircle,
  setCircles,
  updateCircle,
  setLoading,
  setError,
  clearError,
} = circleSlice.actions;

// Export reducer
export default circleSlice.reducer;

