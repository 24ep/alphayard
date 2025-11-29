#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <UserNotifications/UserNotifications.h>
#import <CoreLocation/CoreLocation.h>
#import <Firebase.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Initialize Firebase
  [FIRApp configure];
  
  // Configure React Native
  self.moduleName = @"Bondarys";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // Request notification permissions
  [self requestNotificationPermissions];
  
  // Configure location services
  [self configureLocationServices];
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

#pragma mark - Push Notifications

- (void)requestNotificationPermissions {
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
    if (granted) {
      dispatch_async(dispatch_get_main_queue(), ^{
        [[UIApplication sharedApplication] registerForRemoteNotifications];
      });
    }
  }];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  // Send device token to your server
  NSString *token = [self hexStringFromData:deviceToken];
  NSLog(@"Device Token: %@", token);
  
  // You can send this token to your React Native app via RCTEventEmitter
  [[NSNotificationCenter defaultCenter] postNotificationName:@"DeviceTokenReceived" 
                                                      object:nil 
                                                    userInfo:@{@"token": token}];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  NSLog(@"Failed to register for remote notifications: %@", error);
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center 
       willPresentNotification:(UNNotification *)notification 
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  // Show notification even when app is in foreground
  completionHandler(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBadge);
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center 
didReceiveNotificationResponse:(UNNotificationResponse *)response 
         withCompletionHandler:(void (^)(void))completionHandler {
  // Handle notification tap
  NSDictionary *userInfo = response.notification.request.content.userInfo;
  NSLog(@"Notification tapped: %@", userInfo);
  
  // Send to React Native
  [[NSNotificationCenter defaultCenter] postNotificationName:@"NotificationTapped" 
                                                      object:nil 
                                                    userInfo:userInfo];
  
  completionHandler();
}

#pragma mark - Location Services

- (void)configureLocationServices {
  CLLocationManager *locationManager = [[CLLocationManager alloc] init];
  
  // Request location permissions
  if ([CLLocationManager authorizationStatus] == kCLAuthorizationStatusNotDetermined) {
    [locationManager requestWhenInUseAuthorization];
    [locationManager requestAlwaysAuthorization];
  }
  
  // Configure for background location updates
  locationManager.allowsBackgroundLocationUpdates = YES;
  locationManager.pausesLocationUpdatesAutomatically = NO;
}

#pragma mark - URL Handling

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

#pragma mark - Background Modes

- (void)applicationDidEnterBackground:(UIApplication *)application {
  // Handle background tasks
  UIBackgroundTaskIdentifier backgroundTask = [application beginBackgroundTaskWithExpirationHandler:^{
    [application endBackgroundTask:backgroundTask];
  }];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
  // Handle foreground tasks
}

#pragma mark - Helper Methods

- (NSString *)hexStringFromData:(NSData *)data {
  const unsigned char *dataBuffer = (const unsigned char *)[data bytes];
  
  if (!dataBuffer) {
    return [NSString string];
  }
  
  NSUInteger dataLength = [data length];
  NSMutableString *hexString = [NSMutableString stringWithCapacity:(dataLength * 2)];
  
  for (int i = 0; i < dataLength; ++i) {
    [hexString appendFormat:@"%02x", (unsigned int)dataBuffer[i]];
  }
  
  return [NSString stringWithString:hexString];
}

@end 