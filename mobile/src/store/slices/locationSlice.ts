import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export interface CircleMemberLocation {
  userId: string;
  location: Location;
  name: string;
  avatar?: string;
  lastSeen: Date;
}

interface LocationState {
  currentLocation: Location | null;
  circleLocations: CircleMemberLocation[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: LocationState = {
  currentLocation: null,
  circleLocations: [],
  loading: false,
  error: null,
};

// Create slice
const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    // Set current location
    setCurrentLocation: (state, action: PayloadAction<Location | null>) => {
      state.currentLocation = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Set circle locations
    setCircleLocations: (state, action: PayloadAction<CircleMemberLocation[]>) => {
      state.circleLocations = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Update circle member location
    updateCircleMemberLocation: (state, action: PayloadAction<CircleMemberLocation>) => {
      const index = state.circleLocations.findIndex(
        (l) => l.userId === action.payload.userId
      );
      if (index !== -1) {
        state.circleLocations[index] = action.payload;
      } else {
        state.circleLocations.push(action.payload);
      }
    },
    
    // Remove circle member location
    removeCircleMemberLocation: (state, action: PayloadAction<string>) => {
      state.circleLocations = state.circleLocations.filter(
        (l) => l.userId !== action.payload
      );
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
  setCurrentLocation,
  setCircleLocations,
  updateCircleMemberLocation,
  removeCircleMemberLocation,
  setLoading,
  setError,
  clearError,
} = locationSlice.actions;

// Export reducer
export default locationSlice.reducer;


