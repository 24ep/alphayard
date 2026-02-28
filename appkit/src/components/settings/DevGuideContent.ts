export interface DevGuideSection {
  title: string;
  description: string;
  code: string;
  language: string;
}

export interface DevGuideCategory {
  id: string;
  title: string;
  icon: string;
  sections: DevGuideSection[];
}

export const DEV_GUIDE_CONTENT: DevGuideCategory[] = [
  {
    id: 'web-app',
    title: 'Web Application',
    icon: 'Globe',
    sections: [
      {
        title: 'Authorization Flow',
        description: 'Standard OIDC Authorization Code flow for server-side applications.',
        language: 'javascript',
        code: `// 1. Redirect to Authorization Endpoint
const authUrl = \`\${ISSUER}/oauth/authorize?\` +
  \`client_id=\${CLIENT_ID}&\` +
  \`redirect_uri=\${REDIRECT_URI}&\` +
  \`response_type=code&\` +
  \`scope=openid profile email&\` +
  \`state=\${STATE}\`;

window.location.href = authUrl;

// 2. Exchange Code for Tokens
const response = await fetch('\${ISSUER}/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: AUTH_CODE,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI
  })
});`
      },
      {
        title: 'Token Usage',
        description: 'Access the UserInfo endpoint using the Bearer token.',
        language: 'javascript',
        code: `const userResponse = await fetch('\${ISSUER}/oauth/userinfo', {
  headers: {
    'Authorization': \`Bearer \${ACCESS_TOKEN}\`
  }
});

const user = await userResponse.json();`
      }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Integration',
    icon: 'Server',
    sections: [
      {
        title: 'Node.js (Express)',
        description: 'Complete backend integration with Express.js middleware.',
        language: 'javascript',
        code: `const express = require('express');
const { expressjwt: jwt } = require('express-jwt');
const jwksClient = require('jwks-rsa');

const app = express();

// JWT Verification Middleware
const jwtCheck = jwt({
  secret: jwksClient.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: 'https://appkits.up.railway.app/.well-known/jwks.json'
  }),
  audience: 'https://api.yourapp.com',
  issuer: 'https://appkits.up.railway.app',
  algorithms: ['RS256']
});

// Protected routes
app.use('/api', jwtCheck);

// User profile endpoint
app.get('/api/profile', (req, res) => {
  res.json(req.user);
});

app.listen(3000);`
      },
      {
        title: 'Python (FastAPI)',
        description: 'FastAPI integration with JWT verification.',
        language: 'python',
        code: `from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import requests

app = FastAPI()
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # Verify JWT token
        jwks_url = "https://appkits.up.railway.app/.well-known/jwks.json"
        jwks_response = requests.get(jwks_url)
        jwks = jwks_response.json()
        
        # Decode and verify token
        decoded = jwt.decode(
            credentials.credentials, 
            jwks, 
            algorithms=["RS256"],
            audience="https://api.yourapp.com",
            issuer="https://appkits.up.railway.app"
        )
        return decoded
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/api/profile")
async def profile(current_user: dict = Depends(get_current_user)):
    return current_user`
      },
      {
        title: 'Java (Spring Boot)',
        description: 'Spring Security integration with OAuth2 Resource Server.',
        language: 'java',
        code: `@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/public").permitAll()
                .requestMatchers("/api/**").authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwkSetUri("https://appkits.up.railway.app/.well-known/jwks.json")
                    .issuer("https://appkits.up.railway.app")
                    .audience("https://api.yourapp.com")
                )
            );
    }
}

@RestController
@RequestMapping("/api")
public class ApiController {
    
    @GetMapping("/profile")
    public Map<String, Object> getProfile(@AuthenticationPrincipal Jwt jwt) {
        return jwt.getClaims();
    }
}`
      }
    ]
  },
  {
    id: 'mobile-web',
    title: 'Mobile Web / PWA',
    icon: 'Smartphone',
    sections: [
      {
        title: 'PKCE Authorization',
        description: 'Secure authorization for public clients using Proof Key for Code Exchange (PKCE).',
        language: 'javascript',
        code: `// 1. Generate Verifier and Challenge
const verifier = generateRandomString();
const challenge = await generateCodeChallenge(verifier);

// 2. Redirect with Challenge
const authUrl = \`\${ISSUER}/oauth/authorize?\` +
  \`client_id=\${CLIENT_ID}&\` +
  \`redirect_uri=\${REDIRECT_URI}&\` +
  \`response_type=code&\` +
  \`code_challenge=\${challenge}&\` +
  \`code_challenge_method=S256\`;`
      }
    ]
  },
  {
    id: 'mobile-app',
    title: 'Native Mobile App',
    icon: 'AppWindow',
    sections: [
      {
        title: 'React Native Integration',
        description: 'Using react-native-app-auth for secure native integration.',
        language: 'javascript',
        code: `import { authorize } from 'react-native-app-auth';

const config = {
  issuer: 'https://appkits.up.railway.app',
  clientId: 'YOUR_CLIENT_ID',
  redirectUrl: 'com.appkit.app:/oauth',
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  usePKCE: true,
};

const result = await authorize(config);`
      },
      {
        title: 'Deep Link Configuration',
        description: 'Register your custom URL scheme in iOS (Info.plist) or Android (AndroidManifest.xml).',
        language: 'xml',
        code: `<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="com.appkit.app" android:path="/oauth" />
</intent-filter>`
      }
    ]
  },
  {
    id: 'mfa',
    title: 'Multi-Factor Authentication',
    icon: 'ShieldCheck',
    sections: [
      {
        title: 'Enable MFA for Users',
        description: 'Configure time-based OTP (TOTP) for enhanced security.',
        language: 'javascript',
        code: `// Enable MFA for a user
const enableMFA = async (userId) => {
  const response = await fetch('/api/auth/mfa/enable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  
  const { secret, qrCode } = await response.json();
  
  // Show QR code to user for scanning with authenticator app
  return { secret, qrCode };
};

// Verify MFA setup
const verifyMFA = async (userId, token) => {
  const response = await fetch('/api/auth/mfa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, token })
  });
  
  return response.json();
};`
      },
      {
        title: 'MFA Login Flow',
        description: 'Handle MFA verification during authentication.',
        language: 'javascript',
        code: `const loginWithMFA = async (email, password, mfaToken) => {
  try {
    // Step 1: Normal login
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const { requiresMFA, tempToken } = await loginResponse.json();
    
    if (requiresMFA) {
      // Step 2: Verify MFA token
      const mfaResponse = await fetch('/api/auth/mfa/verify-login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${tempToken}\`
        },
        body: JSON.stringify({ token: mfaToken })
      });
      
      const { accessToken, refreshToken } = await mfaResponse.json();
      return { accessToken, refreshToken };
    }
    
    return loginResponse.json();
  } catch (error) {
    console.error('MFA login failed:', error);
  }
};`
      }
    ]
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    icon: 'Webhook',
    sections: [
      {
        title: 'Register Webhook Endpoint',
        description: 'Create a webhook to receive real-time event notifications.',
        language: 'javascript',
        code: `const response = await fetch('/api/v1/applications/{appId}/webhooks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${MGMT_TOKEN}\`
  },
  body: JSON.stringify({
    url: 'https://api.example.com/webhooks/appkit',
    events: ['user.created', 'user.login', 'user.signup'],
    secret: 'whsec_your_signing_secret'
  })
});

const webhook = await response.json();
// { id: 'wh_123', url: '...', events: [...], status: 'active' }`
      },
      {
        title: 'Verify Webhook Signature',
        description: 'Validate incoming webhook payloads using HMAC-SHA256 signatures.',
        language: 'javascript',
        code: `const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your Express handler:
app.post('/webhooks/appkit', (req, res) => {
  const sig = req.headers['x-appkit-signature'];
  if (!verifyWebhook(JSON.stringify(req.body), sig, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  // Process event...
  res.status(200).send('OK');
});`
      }
    ]
  },
  {
    id: 'activity',
    title: 'Activity Log & Audit',
    icon: 'Activity',
    sections: [
      {
        title: 'Query Activity Log',
        description: 'Fetch admin activity logs for compliance and debugging.',
        language: 'javascript',
        code: `const response = await fetch(
  '/api/v1/applications/{appId}/activity?type=config&limit=50&from=2024-02-01',
  { headers: { 'Authorization': \`Bearer \${MGMT_TOKEN}\` } }
);

const logs = await response.json();
// [{ id, action, user, timestamp, type }]`
      },
      {
        title: 'Export Activity Log',
        description: 'Export logs in CSV or JSON format for compliance reporting.',
        language: 'bash',
        code: `curl "https://auth.app.com/api/v1/applications/{appId}/activity/export?format=csv" \\
  -H "Authorization: Bearer MGMT_TOKEN" \\
  -o audit_log.csv`
      }
    ]
  },
  {
    id: 'communication',
    title: 'Communication',
    icon: 'MessageSquare',
    sections: [
      {
        title: 'Send Transactional Email',
        description: 'Send templated emails via the Communication API.',
        language: 'javascript',
        code: `await fetch('/api/v1/applications/{appId}/communication/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${MGMT_TOKEN}\`
  },
  body: JSON.stringify({
    to: 'user@example.com',
    template: 'welcome-email',
    data: { name: 'John', activationUrl: 'https://...' }
  })
});`
      },
      {
        title: 'Send Push Notification',
        description: 'Deliver push notifications to mobile and web clients.',
        language: 'javascript',
        code: `await fetch('/api/v1/applications/{appId}/communication/push', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${MGMT_TOKEN}\`
  },
  body: JSON.stringify({
    userId: 'usr_123',
    title: 'New message',
    body: 'You have a new notification',
    data: { deepLink: '/messages/123' }
  })
});`
      }
    ]
  },
  {
    id: 'saml',
    title: 'SAML SSO',
    icon: 'Building2',
    sections: [
      {
        title: 'SAML Service Provider Setup',
        description: 'Configure your application as a SAML Service Provider.',
        language: 'xml',
        code: `<!-- SAML Metadata Configuration -->
<EntityDescriptor entityID="https://yourapp.com/saml">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService 
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="https://yourapp.com/saml/acs"
      index="1" />
  </SPSSODescriptor>
</EntityDescriptor>`
      },
      {
        title: 'SAML Authentication Flow',
        description: 'Implement SAML authentication in your application.',
        language: 'javascript',
        code: `const express = require('express');
const { SamlStrategy } = require('passport-saml');
const passport = require('passport');

const samlStrategy = new SamlStrategy({
  entryPoint: 'https://appkits.up.railway.app/oauth/authorize',
  issuer: 'https://yourapp.com/saml',
  callbackUrl: 'https://yourapp.com/saml/acs',
  cert: '-----BEGIN CERTIFICATE-----\n...SAML_CERT...\n-----END CERTIFICATE-----'
}, (profile, done) => {
  return done(null, profile);
});

passport.use(samlStrategy);

// SAML login route
app.get('/auth/saml', passport.authenticate('saml'));

// SAML callback route
app.post('/saml/acs', 
  passport.authenticate('saml', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);`
      }
    ]
  }
];
