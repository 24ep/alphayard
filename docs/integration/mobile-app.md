# Native Mobile App Integration Guide

Native applications on iOS and Android should use the system browser for authentication to ensure security and trust.

## Configuration

Register your application as a **Public Client** in the Boundary Admin dashboard.

- **Client ID**: `YOUR_CLIENT_ID`
- **Redirect URI**: `com.your.app:/oauth` (Custom URL Scheme)

## Integration with React Native

We recommend using `react-native-app-auth` for a standard-compliant integration.

```javascript
import { authorize } from 'react-native-app-auth';

const config = {
  issuer: 'https://auth.boundary.com/oauth',
  clientId: 'YOUR_CLIENT_ID',
  redirectUrl: 'com.your.app:/oauth',
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  usePKCE: true,
};

async function login() {
  try {
    const result = await authorize(config);
    // Tokens are returned in result.accessToken, result.idToken, etc.
  } catch (error) {
    console.error(error);
  }
}
```

## App Configuration

### iOS (Info.plist)

Register your custom URL scheme:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.your.app</string>
    </array>
  </dict>
</array>
```

### Android (AndroidManifest.xml)

Add an intent filter to your activity:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="com.your.app" android:path="/oauth" />
</intent-filter>
```
