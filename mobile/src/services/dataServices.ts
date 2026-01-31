// Data Services - Real implementations replacing mock data
export { socialService } from './social/SocialService';
export { circleStatusService } from './circle_status/CircleStatusService';
export { appointmentService } from './appointments/AppointmentService';
export { shoppingService as shoppingListService } from './shopping/ShoppingService';
export { recentlyUsedService } from './apps/RecentlyUsedService';
export { locationDataService } from './location/LocationDataService';
export { widgetService } from './widgets/WidgetService';
export { countryService } from './misc/CountryService';
export { circleTypeService } from './circle/CircleTypeService';

// Re-export types
export type { SocialPostFilters, CreateSocialPostRequest, UpdateSocialPostRequest } from './social/SocialService';
export type { Country } from './misc/CountryService';
export type { CircleStatusFilters, CircleStatusUpdate, CircleLocationUpdate } from './circle_status/CircleStatusService';
export type { AppointmentFilters, CreateAppointmentRequest, UpdateAppointmentRequest } from './appointments/AppointmentService';
// Shopping service types are defined inline in ShoppingService.ts
export type { RecentlyUsedFilters, AppUsageRecord } from './apps/RecentlyUsedService';
export type { LocationFilters, LocationUpdate, LocationHistory } from './location/LocationDataService';
export type { WidgetFilters, WidgetConfiguration } from './widgets/WidgetService';

