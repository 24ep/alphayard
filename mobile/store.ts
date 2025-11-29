import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define initial state
const initialState = {
  auth: {
    user: null,
    isAuthenticated: false,
    loading: false,
  },
  family: {
    members: [],
    currentFamily: null,
    loading: false,
  },
  chat: {
    messages: [],
    conversations: [],
    loading: false,
  },
  location: {
    currentLocation: null,
    familyLocations: [],
    loading: false,
  },
  safety: {
    emergencyContacts: [],
    geofences: [],
    alerts: [],
    loading: false,
  },
};

// Create root reducer
const rootReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case 'auth/login':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload,
          isAuthenticated: true,
          loading: false,
        },
      };
    case 'auth/logout':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: null,
          isAuthenticated: false,
          loading: false,
        },
      };
    case 'family/setMembers':
      return {
        ...state,
        family: {
          ...state.family,
          members: action.payload,
          loading: false,
        },
      };
    case 'chat/setMessages':
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: action.payload,
          loading: false,
        },
      };
    case 'location/setCurrentLocation':
      return {
        ...state,
        location: {
          ...state.location,
          currentLocation: action.payload,
          loading: false,
        },
      };
    case 'safety/setEmergencyContacts':
      return {
        ...state,
        safety: {
          ...state.safety,
          emergencyContacts: action.payload,
          loading: false,
        },
      };
    default:
      return state;
  }
};

// Configure persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'family'], // Only persist auth and family data
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 