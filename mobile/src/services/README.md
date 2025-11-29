# Data Services Implementation

This document outlines the implementation of real data services to replace mock data throughout the mobile application.

## Overview

We have successfully replaced all mock data with actual service implementations that integrate with a REST API backend. The implementation includes:

1. **Data Services**: Real service classes that handle API communication
2. **API Integration**: Structured API endpoints for all data types
3. **Error Handling**: Comprehensive error handling with retry logic
4. **Loading States**: Proper loading and refresh states
5. **Type Safety**: Full TypeScript support with proper interfaces

## Services Implemented

### 1. Social Service (`SocialService.ts`)
- **Purpose**: Manages social posts, comments, and interactions
- **API Endpoints**: `/social/posts`, `/social/comments`, `/social/trending-tags`
- **Features**: Create, read, update, delete posts; like/comment/share functionality

### 2. Family Status Service (`FamilyStatusService.ts`)
- **Purpose**: Tracks family member status, location, and health metrics
- **API Endpoints**: `/family/status/members`, `/family/status/locations`
- **Features**: Real-time status updates, location tracking, health monitoring

### 3. Appointment Service (`AppointmentService.ts`)
- **Purpose**: Manages family appointments and events
- **API Endpoints**: `/appointments`, `/appointments/reminders`
- **Features**: Create/edit appointments, reminders, calendar integration

### 4. Shopping List Service (`ShoppingListService.ts`)
- **Purpose**: Manages family shopping lists and items
- **API Endpoints**: `/shopping/items`, `/shopping/categories`
- **Features**: Item management, categories, completion tracking

### 5. Recently Used Apps Service (`RecentlyUsedService.ts`)
- **Purpose**: Tracks app usage and provides recommendations
- **API Endpoints**: `/apps/recently-used`, `/apps/usage`
- **Features**: Usage tracking, recommendations, analytics

### 6. Location Data Service (`LocationDataService.ts`)
- **Purpose**: Manages location data and geofencing
- **API Endpoints**: `/locations`, `/locations/geofences`
- **Features**: Location updates, geofencing, proximity alerts

### 7. Widget Service (`WidgetService.ts`)
- **Purpose**: Manages widget configurations and data
- **API Endpoints**: `/widgets/types`, `/widgets/configuration`
- **Features**: Widget management, customization, data fetching

## Error Handling

### Error Handler (`errorHandling.ts`)
- **Network Error Detection**: Identifies connection issues
- **Server Error Handling**: Manages 5xx server errors
- **Client Error Handling**: Handles 4xx validation errors
- **Retry Logic**: Automatic retry with exponential backoff
- **User-Friendly Messages**: Converts technical errors to user messages

### Data Service Hook (`useDataService.ts`)
- **Loading States**: Manages loading, error, and data states
- **Refresh Control**: Pull-to-refresh functionality
- **Pagination**: Built-in pagination support
- **Dependency Management**: Automatic refetching on dependency changes

## Usage Examples

### Basic Service Usage
```typescript
import { socialService } from '../services/dataServices';

// Fetch social posts
const posts = await socialService.getPosts({
  familyId: 'family-123',
  limit: 20
});

// Create a new post
const newPost = await socialService.createPost({
  content: 'Hello family!',
  familyId: 'family-123',
  tags: ['update']
});
```

### Using Data Service Hook
```typescript
import { useDataServiceWithRefresh } from '../hooks/useDataService';
import { socialService } from '../services/dataServices';

const MyComponent = ({ familyId }) => {
  const {
    data: posts = [],
    error,
    loading,
    refreshing,
    onRefresh
  } = useDataServiceWithRefresh(
    () => socialService.getPosts({ familyId, limit: 20 }),
    { dependencies: [familyId] }
  );

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {posts.map(post => <PostItem key={post.id} post={post} />)}
    </ScrollView>
  );
};
```

## API Integration

All services use the centralized API client (`apiClient.ts`) which provides:
- **Authentication**: Automatic token management
- **Request/Response Interceptors**: Error handling and logging
- **Base URL Configuration**: Environment-specific endpoints
- **Timeout Management**: Request timeout handling

## Testing

### Manual Testing Checklist

1. **Network Connectivity**
   - [ ] Test with good internet connection
   - [ ] Test with poor/slow connection
   - [ ] Test with no internet connection
   - [ ] Verify error messages are user-friendly

2. **Data Loading**
   - [ ] Verify loading states appear correctly
   - [ ] Test pull-to-refresh functionality
   - [ ] Verify data updates when dependencies change
   - [ ] Test empty state handling

3. **Error Scenarios**
   - [ ] Test server errors (500, 503)
   - [ ] Test client errors (400, 401, 403, 404)
   - [ ] Test network timeouts
   - [ ] Verify retry functionality

4. **Data Operations**
   - [ ] Test CRUD operations for each service
   - [ ] Verify optimistic updates
   - [ ] Test data validation
   - [ ] Verify proper error handling for failed operations

### Unit Testing

Each service should have unit tests covering:
- Successful API calls
- Error handling scenarios
- Data transformation
- Edge cases (empty responses, malformed data)

### Integration Testing

Test the complete flow:
1. User action triggers service call
2. Service makes API request
3. Response is processed and transformed
4. UI updates with new data
5. Error states are handled appropriately

## Migration Notes

### Removed Mock Data
The following mock constants have been removed from `constants/home.ts`:
- `MOCK_SOCIAL_POSTS`
- `MOCK_FAMILY_STATUS_CARDS`
- `MOCK_FAMILY_STATUS_MEMBERS`
- `MOCK_APPOINTMENTS`
- `MOCK_SHOPPING_LIST`
- `MOCK_RECENTLY_USED`
- `MOCK_LOCATIONS`
- `MOCK_WIDGET_TYPES`

### Updated Components
- `SocialTab.tsx`: Now uses `socialService` with proper error handling
- Other components: Ready to be updated to use respective services

## Next Steps

1. **Backend Implementation**: Implement the corresponding API endpoints
2. **Component Updates**: Update remaining components to use new services
3. **Testing**: Add comprehensive unit and integration tests
4. **Performance**: Implement caching and optimization
5. **Real-time Updates**: Add WebSocket support for live data updates

## Configuration

### Environment Variables
```typescript
// API Configuration
API_BASE_URL: 'https://api.yourapp.com'
API_TIMEOUT: 10000
API_RETRY_ATTEMPTS: 3
API_RETRY_DELAY: 1000
```

### Service Configuration
Each service can be configured with:
- Custom retry logic
- Fallback data
- Cache settings
- Request/response transformations
