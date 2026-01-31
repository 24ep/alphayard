import emailService from './emailService';
import smsService from './smsService';
import pushService from './pushService';
import storageService from './storageService';
import notificationService from './notificationService';
import analyticsService from './analyticsService';
import databaseService from './databaseService';
import searchService from './searchService';
import backupService from './backupService';
import geofenceService from './geofenceService';
import encryptionService from './encryptionService';
import healthService from './healthService';
import schedulerService from './schedulerService';
import reportingService from './reportingService';
import auditService from './auditService';

export const initializeServices = async () => {
  try {
    console.log('Initializing services...');
    
    await databaseService.connect();
    
    // Some services might have an initialize method
    if (typeof (encryptionService as any).initialize === 'function') {
      await (encryptionService as any).initialize();
    }
    
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Service initialization error:', error);
    throw error;
  }
};

export {
  emailService,
  smsService,
  pushService,
  storageService,
  notificationService,
  analyticsService,
  databaseService,
  searchService,
  backupService,
  geofenceService,
  encryptionService,
  healthService,
  schedulerService,
  reportingService,
  auditService,
};
