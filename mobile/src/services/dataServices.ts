// Data Services - Real implementations replacing mock data
export { socialService } from './social/SocialService';
export { familyStatusService } from './family/FamilyStatusService';
export { appointmentService } from './appointments/AppointmentService';
export { shoppingService as shoppingListService } from './shopping/ShoppingService';
export { recentlyUsedService } from './apps/RecentlyUsedService';
export { locationDataService } from './location/LocationDataService';
export { widgetService } from './widgets/WidgetService';
export { countryService } from './misc/CountryService';

// Re-export types
export type { SocialPostFilters, CreateSocialPostRequest, UpdateSocialPostRequest } from './social/SocialService';
export type { Country } from './misc/CountryService';
export type { FamilyStatusFilters, FamilyStatusUpdate, FamilyLocationUpdate } from './family/FamilyStatusService';
export type { AppointmentFilters, CreateAppointmentRequest, UpdateAppointmentRequest } from './appointments/AppointmentService';
// Shopping service types are defined inline in ShoppingService.ts
export type { RecentlyUsedFilters, AppUsageRecord } from './apps/RecentlyUsedService';
export type { LocationFilters, LocationUpdate, LocationHistory } from './location/LocationDataService';
export type { WidgetFilters, WidgetConfiguration } from './widgets/WidgetService';
