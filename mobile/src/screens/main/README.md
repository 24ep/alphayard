# HomeScreen Refactored Structure

This directory contains the refactored HomeScreen component that has been split into multiple files for better maintainability and organization.

## File Structure

```
mobile/src/screens/main/
├── HomeScreen.tsx              # Main HomeScreen component (refactored)
├── components/                 # Extracted components
│   ├── index.ts               # Component exports
│   ├── CircleMember.tsx       # Circle member avatar component
│   ├── SocialPost.tsx         # Social media post component
│   └── CircleStatusCard.tsx   # Circle status monitoring card
└── README.md                 # This file
```

## Related Files (in other directories)

```
mobile/src/
├── types/home.ts              # TypeScript interfaces and types
├── constants/home.ts          # Constants and data
├── styles/homeStyles.ts       # All styles extracted from original component
├── hooks/useHomeState.ts      # Main state management hook
└── components/home/           # Home-specific components
    ├── HomeHeader.tsx
    ├── CircleMembers.tsx
    ├── HomeTabs.tsx
    ├── AssetCards.tsx
    └── AttentionApps.tsx
```

## Components

### CircleMember
- Renders individual Circle member avatars
- Handles composite avatars for groups
- Manages notification badges
- Handles navigation to chat screens

### SocialPost
- Displays social media posts
- Handles post interactions (like, comment, share)
- Manages report functionality
- Supports media content

### CircleStatusCard
- Shows Circle member health and status information
- Displays heart rate charts
- Shows location and battery status
- Real-time status indicators

## Hooks

### useHomeState
- Centralized state management for the HomeScreen
- Handles all component state and interactions
- Provides handler functions for user actions
- Manages animations and navigation

## Benefits of Refactoring

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be used in other screens
3. **Testability**: Individual components can be tested in isolation
4. **Readability**: Code is organized and easier to understand
5. **Performance**: Better code splitting and optimization opportunities

## Usage

The refactored HomeScreen maintains the same API and functionality as the original, but with improved code organization. All existing features are preserved:

- Circle member management
- Social media posts
- Circle status monitoring
- Customizable tabs and widgets
- Modal interactions
- Navigation handling

## Migration Notes

- Original HomeScreen files have been cleaned up and removed
- All imports and exports are maintained
- No breaking changes to the component API
- Styles are extracted but maintain the same structure
- Code is now organized across multiple directories for better maintainability

