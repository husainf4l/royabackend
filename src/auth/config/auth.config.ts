export const authConfig = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
    scope: ['email', 'profile'],
  },
  apple: {
    clientID: process.env.APPLE_CLIENT_ID || '',
    teamID: process.env.APPLE_TEAM_ID || '',
    keyID: process.env.APPLE_KEY_ID || '',
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION || '',
    callbackURL: process.env.APPLE_CALLBACK_URL || 'http://localhost:3000/api/auth/apple/callback',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'jwt_dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  livekit: {
    apiKey: process.env.LIVEKIT_API_KEY || '',
    apiSecret: process.env.LIVEKIT_API_SECRET || '',
    host: process.env.LIVEKIT_URL || 'wss://your-livekit-host.cloud'
  },

  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
};
