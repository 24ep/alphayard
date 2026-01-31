# Redux Store Structure

This directory contains the Redux store setup using Redux Toolkit.

## Structure

```
src/store/
├── slices/
│   ├── authSlice.ts          # Authentication state
│   ├── circleSlice.ts        # Circle management state
│   ├── chatSlice.ts          # Chat and messaging state
│   ├── locationSlice.ts      # Location tracking state
│   └── safetySlice.ts        # Safety features state
├── hooks.ts                  # Typed Redux hooks
└── README.md                 # This file
```

## Usage

### Using Typed Hooks

Instead of using plain `useDispatch` and `useSelector`, use the typed hooks:

```typescript
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { loginSuccess, logout } from '@store/slices/authSlice';
import { selectUser, selectIsAuthenticated } from '@store/slices/authSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const handleLogin = () => {
    dispatch(loginSuccess(userData));
  };
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    // Your component JSX
  );
}
```

### Direct Selector Usage

You can also use selectors directly:

```typescript
import { useAppSelector } from '@store/hooks';

function MyComponent() {
  // Direct state access
  const auth = useAppSelector((state) => state.auth);
  const circle = useAppSelector((state) => state.circle);
  
  // Or use exported selectors
  const user = useAppSelector(selectUser);
}
```

## Migration from Context API

Currently, the app uses Context API for state management. To gradually migrate to Redux:

1. **Keep Context API for now** - It's working and doesn't need immediate replacement
2. **Use Redux for new features** - Start using Redux for new state management needs
3. **Gradually migrate** - Move contexts to Redux slices one at a time when convenient

## Available Slices

### Auth Slice (`authSlice.ts`)
- User authentication state
- Login/logout actions
- User profile updates
- Onboarding status

### Circle Slice (`circleSlice.ts`)
- Circle members management
- Current circle selection
- Circle CRUD operations

### Chat Slice (`chatSlice.ts`)
- Messages and conversations
- Active conversation tracking
- Read/unread status

### Location Slice (`locationSlice.ts`)
- Current user location
- Circle member locations
- Location updates

### Safety Slice (`safetySlice.ts`)
- Emergency contacts
- Geofences
- Safety alerts

## Best Practices

1. **Use typed hooks** - Always use `useAppDispatch` and `useAppSelector`
2. **Use selectors** - Create and export selectors for reusable state access
3. **Keep slices focused** - Each slice should manage one domain
4. **Use actions properly** - Dispatch actions, don't mutate state directly
5. **Handle loading/error states** - All slices include loading and error states

## Example: Creating a New Slice

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MyState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: MyState = {
  data: [],
  loading: false,
  error: null,
};

const mySlice = createSlice({
  name: 'myFeature',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<any[]>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setData, setLoading, setError } = mySlice.actions;
export default mySlice.reducer;
```

Then add it to `store.ts`:

```typescript
import myReducer from './src/store/slices/mySlice';

const rootReducer = combineReducers({
  // ... existing reducers
  myFeature: myReducer,
});
```


