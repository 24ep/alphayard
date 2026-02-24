import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultSSOProviders = [
  {
    providerName: 'google',
    displayName: 'Google',
    type: 'oauth2',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userinfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile'],
    claimsMapping: {
      email: 'email',
      name: 'name',
      firstName: 'given_name',
      lastName: 'family_name',
      avatar: 'picture'
    },
    allowSignup: true,
    requireEmailVerified: true,
    autoLinkByEmail: true,
    iconUrl: 'https://developers.google.com/favicon.ico',
    buttonColor: '#4285f4',
    buttonText: 'Sign in with Google',
    allowedDomains: [],
    defaultRole: 'user',
    isEnabled: false, // Disabled by default until configured
    displayOrder: 1
  },
  {
    providerName: 'microsoft',
    displayName: 'Microsoft',
    type: 'oauth2',
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userinfoUrl: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['openid', 'email', 'profile'],
    claimsMapping: {
      email: 'mail',
      name: 'displayName',
      firstName: 'givenName',
      lastName: 'surname',
      avatar: null
    },
    allowSignup: true,
    requireEmailVerified: true,
    autoLinkByEmail: true,
    iconUrl: 'https://www.microsoft.com/favicon.ico',
    buttonColor: '#0078d4',
    buttonText: 'Sign in with Microsoft',
    allowedDomains: [],
    defaultRole: 'user',
    isEnabled: false,
    displayOrder: 2
  },
  {
    providerName: 'github',
    displayName: 'GitHub',
    type: 'oauth2',
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userinfoUrl: 'https://api.github.com/user',
    scopes: ['user:email'],
    claimsMapping: {
      email: 'email',
      name: 'name',
      firstName: null,
      lastName: null,
      avatar: 'avatar_url'
    },
    allowSignup: true,
    requireEmailVerified: false,
    autoLinkByEmail: false,
    iconUrl: 'https://github.com/favicon.ico',
    buttonColor: '#333333',
    buttonText: 'Sign in with GitHub',
    allowedDomains: [],
    defaultRole: 'developer',
    isEnabled: false,
    displayOrder: 3
  },
  {
    providerName: 'facebook',
    displayName: 'Facebook',
    type: 'oauth2',
    clientId: process.env.FACEBOOK_CLIENT_ID || '',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userinfoUrl: 'https://graph.facebook.com/v18.0/me',
    scopes: ['email', 'public_profile'],
    claimsMapping: {
      email: 'email',
      name: 'name',
      firstName: 'first_name',
      lastName: 'last_name',
      avatar: 'picture.data.url'
    },
    allowSignup: true,
    requireEmailVerified: true,
    autoLinkByEmail: true,
    iconUrl: 'https://www.facebook.com/favicon.ico',
    buttonColor: '#1877f2',
    buttonText: 'Sign in with Facebook',
    allowedDomains: [],
    defaultRole: 'user',
    isEnabled: false,
    displayOrder: 4
  },
  {
    providerName: 'twitter',
    displayName: 'X (Twitter)',
    type: 'oauth2',
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userinfoUrl: 'https://api.twitter.com/2/users/me',
    scopes: ['users.read', 'tweet.read'],
    claimsMapping: {
      email: 'email',
      name: 'name',
      firstName: null,
      lastName: null,
      avatar: 'profile_image_url'
    },
    allowSignup: true,
    requireEmailVerified: false,
    autoLinkByEmail: false,
    iconUrl: 'https://abs.twimg.com/favicons/twitter.ico',
    buttonColor: '#1da1f2',
    buttonText: 'Sign in with X',
    allowedDomains: [],
    defaultRole: 'user',
    isEnabled: false,
    displayOrder: 5
  }
]

async function seedSSOProviders() {
  console.log('🌱 Seeding SSO providers...')
  
  try {
    for (const provider of defaultSSOProviders) {
      const existingProvider = await prisma.oAuthProvider.findFirst({
        where: {
          OR: [
            { providerName: provider.providerName },
            { displayName: provider.displayName }
          ]
        }
      })

      if (!existingProvider) {
        await prisma.oAuthProvider.create({
          data: {
            ...provider,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log(`✅ Created SSO provider: ${provider.displayName}`)
      } else {
        console.log(`⚠️  SSO provider already exists: ${provider.displayName}`)
      }
    }
    
    console.log('🎉 SSO providers seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding SSO providers:', error)
    throw error
  }
}

async function main() {
  await seedSSOProviders()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
