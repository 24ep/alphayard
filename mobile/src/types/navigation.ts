export type RootStackParamList = {
  // Auth screens
  Register: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  SSOLogin: undefined;
  
  // Main app
  MainApp: undefined;
  
  // Legal screens
  Terms: undefined;
  Privacy: undefined;
  About: undefined;
  
  // Main screens
  Notifications: undefined;
  AttentionDetail: undefined;
  UserProfile: undefined;
  AssignedTasks: undefined;
  
  // Chat screens
  FamilyGroupChat: undefined;
  IndividualChat: undefined;
  
  // AI screens
  AIAgent: undefined;
  AICapabilities: undefined;
  
  // Safety screens
  Safety: undefined;
  EmergencyContacts: undefined;
  GeofenceSetup: undefined;
  
  // App screens
  Gallery: undefined;
  Storage: undefined;
  Notes: undefined;
  TaskManagement: undefined;
  
  // hourse screens
  FamilyDetail: { familyId?: string };
  

  

  
  // Photo/Album detail screens
  PhotoDetail: { photo: import('../types/gallery').Photo };
  AlbumDetail: { album: import('../types/gallery').Album };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 