# Auth Screens Refactored Structure

This directory contains the refactored authentication screens that have been split into multiple files for better maintainability and organization.

## File Structure

```
mobile/src/screens/auth/
├── LoginScreen.tsx              # Main LoginScreen component (refactored)
├── LoginScreenOriginal.tsx      # Original LoginScreen (backup)
├── types.ts                     # TypeScript interfaces and types
├── styles.ts                    # All styles extracted from original component
├── components/                  # Extracted components
│   ├── index.ts                # Component exports
│   ├── LoginForm.tsx           # Login form with email/password inputs
│   ├── SSOLoginSection.tsx     # Social login buttons section
│   ├── LoginHeader.tsx         # Welcome header with logo
│   └── LoginFooter.tsx         # Sign up link footer
├── hooks/                      # Custom hooks
│   ├── index.ts               # Hook exports
│   └── useLoginScreen.ts      # Main state management hook
└── README.md                  # This file
```

## Components

### LoginForm
- Handles email and password input fields
- Form validation and error display
- Sign in button with loading states
- Forgot password link
- Development bypass button (dev only)

### SSOLoginSection
- Social login buttons (Google, Facebook, Apple)
- Divider with "OR" text
- Loading states for SSO authentication

### LoginHeader
- Animated logo display
- Welcome message
- Subtitle text

### LoginFooter
- Sign up link for new users
- Clean, centered layout

## Hooks

### useLoginScreen
- Centralized state management for the LoginScreen
- Form validation logic
- Authentication handlers
- Animation management
- Error handling and toast notifications

## Benefits of Refactoring

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be used in other auth screens
3. **Testability**: Individual components can be tested in isolation
4. **Readability**: Code is organized and easier to understand
5. **Performance**: Better code splitting and optimization opportunities

## Usage

The refactored LoginScreen maintains the same API and functionality as the original, but with improved code organization. All existing features are preserved:

- Email/password authentication
- Social login (Google, Facebook, Apple)
- Form validation
- Error handling
- Loading states
- Development bypass
- Animations and transitions

## Migration Notes

- Original LoginScreen is preserved as `LoginScreenOriginal.tsx`
- All imports and exports are maintained
- No breaking changes to the component API
- Styles are extracted but maintain the same structure
- NativeBase components are still used for consistent UI

## Related Files

- `ForgotPasswordScreen.tsx` - Password reset functionality
- `SignupScreen.tsx` - User registration
- `SSOLoginScreen.tsx` - Dedicated SSO login screen
- `RegisterScreen.tsx` - User registration alternative
