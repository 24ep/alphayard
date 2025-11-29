# Theme Application Guide

## Overview
The application now uses a comprehensive theme system with **pastel pink**, **grey gradient**, and **glass morphism** effects.

## Theme Structure

### Colors
```typescript
import { theme } from './theme';

// Pastel Pink Shades
theme.colors.pink.primary     // #FFB6C1 - Main pink
theme.colors.pink.secondary   // #FFC0CB - Secondary pink
theme.colors.pink.light       // #FFE4E1 - Light pink
theme.colors.pink.dark        // #FF69B4 - Dark pink
theme.colors.pink.pastel      // #F8BBD9 - Pastel pink
theme.colors.pink.soft        // #FFE4E6 - Soft pink

// Grey Gradient Shades
theme.colors.grey.primary     // #6B7280 - Main grey
theme.colors.grey.secondary   // #9CA3AF - Secondary grey
theme.colors.grey.light       // #F3F4F6 - Light grey
theme.colors.grey.dark        // #374151 - Dark grey
theme.colors.grey.soft        // #E5E7EB - Soft grey

// Glass Effect Colors
theme.colors.glass.background // rgba(255, 182, 193, 0.1) - Light pink glass
theme.colors.glass.border     // rgba(255, 182, 193, 0.2) - Pink border
theme.colors.glass.shadow     // rgba(107, 114, 128, 0.1) - Grey shadow
theme.colors.glass.backdrop   // rgba(255, 255, 255, 0.8) - White backdrop
```

### Typography
```typescript
// Font Sizes
theme.typography.fontSize.xs    // 12
theme.typography.fontSize.sm    // 14
theme.typography.fontSize.base  // 16
theme.typography.fontSize.lg    // 18
theme.typography.fontSize.xl    // 20
theme.typography.fontSize['2xl'] // 24

// Font Weights
theme.typography.fontWeight.normal   // '400'
theme.typography.fontWeight.medium   // '500'
theme.typography.fontWeight.semibold // '600'
theme.typography.fontWeight.bold     // '700'
```

### Spacing
```typescript
theme.spacing.xs   // 4
theme.spacing.sm   // 8
theme.spacing.md   // 16
theme.spacing.lg   // 24
theme.spacing.xl   // 32
```

### Border Radius
```typescript
theme.borderRadius.sm   // 8
theme.borderRadius.md   // 12
theme.borderRadius.lg   // 16
theme.borderRadius.xl   // 20
theme.borderRadius.full // 9999
```

### Shadows
```typescript
theme.shadows.sm    // Small shadow
theme.shadows.md    // Medium shadow
theme.shadows.lg    // Large shadow
theme.shadows.glass // Glass effect shadow
```

## Glass Morphism Styles

### Pre-built Glass Components
```typescript
import { glassStyles } from './theme';

// Glass Card
<View style={glassStyles.glassCard}>

// Glass Button
<TouchableOpacity style={glassStyles.glassButton}>

// Glass Modal
<View style={glassStyles.glassModal}>

// Glass Input
<TextInput style={glassStyles.glassInput}>

// Glass Tab
<TouchableOpacity style={glassStyles.glassTab}>
```

## Common Component Styles

### Pre-built Common Styles
```typescript
import { commonStyles } from './theme';

// Container
<View style={commonStyles.container}>

// Card
<View style={commonStyles.card}>

// Primary Button
<TouchableOpacity style={commonStyles.buttonPrimary}>

// Secondary Button
<TouchableOpacity style={commonStyles.buttonSecondary}>

// Primary Text
<Text style={commonStyles.textPrimary}>

// Secondary Text
<Text style={commonStyles.textSecondary}>

// Input
<TextInput style={commonStyles.input}>
```

## Application Examples

### Card Component
```typescript
const cardStyle = {
  backgroundColor: theme.glass.backdrop,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.md,
  borderWidth: 1,
  borderColor: theme.glass.border,
  ...theme.shadows.md,
};
```

### Button Component
```typescript
const primaryButtonStyle = {
  backgroundColor: theme.colors.pink.primary,
  borderRadius: theme.borderRadius.md,
  paddingVertical: theme.spacing.sm,
  paddingHorizontal: theme.spacing.lg,
  ...theme.shadows.sm,
};

const secondaryButtonStyle = {
  backgroundColor: theme.glass.background,
  borderWidth: 1,
  borderColor: theme.glass.border,
  borderRadius: theme.borderRadius.md,
  paddingVertical: theme.spacing.sm,
  paddingHorizontal: theme.spacing.lg,
  ...theme.shadows.sm,
};
```

### Text Component
```typescript
const primaryTextStyle = {
  color: theme.colors.text.primary,
  fontSize: theme.typography.fontSize.base,
  fontWeight: theme.typography.fontWeight.medium,
};

const secondaryTextStyle = {
  color: theme.colors.text.secondary,
  fontSize: theme.typography.fontSize.sm,
  fontWeight: theme.typography.fontWeight.normal,
};
```

### Modal Component
```typescript
const modalStyle = {
  backgroundColor: theme.glass.backdrop,
  borderRadius: theme.borderRadius.xl,
  padding: theme.spacing.lg,
  borderWidth: 1,
  borderColor: theme.glass.border,
  ...theme.shadows.lg,
};
```

## Migration Guide

### Before (Old Styles)
```typescript
const oldStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};
```

### After (New Theme)
```typescript
const newStyle = {
  backgroundColor: theme.glass.backdrop,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.lg,
  borderWidth: 1,
  borderColor: theme.glass.border,
  ...theme.shadows.md,
};
```

## Key Benefits

1. **Consistency**: All components use the same color palette and spacing
2. **Glass Morphism**: Modern glass effect with transparency and blur
3. **Pastel Pink Theme**: Soft, modern color scheme
4. **Maintainability**: Centralized theme system
5. **Scalability**: Easy to add new components with consistent styling

## Next Steps

1. Apply theme to all existing components
2. Update component libraries to use theme
3. Create theme variants (dark mode, etc.)
4. Add animation styles to theme
5. Create component-specific theme extensions
