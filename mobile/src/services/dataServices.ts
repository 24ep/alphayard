// Data Services - Real implementations replacing mock data
export { socialService } from './social/SocialService';
export { familyStatusService } from './family/FamilyStatusService';
export { appointmentService } from './appointments/AppointmentService';
export { shoppingListService } from './shopping/ShoppingListService';
export { recentlyUsedService } from './apps/RecentlyUsedService';
export { locationDataService } from './location/LocationDataService';
export { widgetService } from './widgets/WidgetService';

// Re-export types
export type { SocialPostFilters, CreateSocialPostRequest, UpdateSocialPostRequest } from './social/SocialService';
export type { FamilyStatusFilters, FamilyStatusUpdate, FamilyLocationUpdate } from './family/FamilyStatusService';
export type { AppointmentFilters, CreateAppointmentRequest, UpdateAppointmentRequest } from './appointments/AppointmentService';
export type { ShoppingListFilters, CreateShoppingItemRequest, UpdateShoppingItemRequest } from './shopping/ShoppingListService';
export type { RecentlyUsedFilters, AppUsageRecord } from './apps/RecentlyUsedService';
export type { LocationFilters, LocationUpdate, LocationHistory } from './location/LocationDataService';
export type { WidgetFilters, WidgetConfiguration } from './widgets/WidgetService';
