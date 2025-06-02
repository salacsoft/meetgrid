/**
 * Google OAuth Service
 * Handles Google OAuth authentication flow
 */
import { OAuth2Client } from 'google-auth-library'

export class GoogleOAuthService {
  private oauth2Client: OAuth2Client
  
  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI
    
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI environment variables.')
    }
    
    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri)
  }
  
  /**
   * Get the Google OAuth authorization URL
   * @returns Authorization URL for Google OAuth
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar', // For Google Calendar integration
      'https://www.googleapis.com/auth/calendar.events'
    ]
    
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent screen to get refresh token
      include_granted_scopes: true
    })
  }
  
  /**
   * Exchange authorization code for access token and get user info
   * @param code - Authorization code from Google
   * @returns User information and tokens
   */
  async getTokensAndUserInfo(code: string) {
    try {
      // Exchange code for tokens
      const { tokens } = await this.oauth2Client.getToken(code)
      this.oauth2Client.setCredentials(tokens)
      
      // Get user info
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID
      })
      
      const payload = ticket.getPayload()
      if (!payload) {
        throw new Error('Invalid Google ID token')
      }
      
      return {
        user: {
          googleId: payload.sub,
          email: payload.email,
          fullName: payload.name,
          firstName: payload.given_name,
          lastName: payload.family_name,
          avatar: payload.picture,
          emailVerified: payload.email_verified
        },
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          idToken: tokens.id_token,
          expiryDate: tokens.expiry_date
        }
      }
    } catch (error) {
      console.error('Error exchanging Google OAuth code:', error)
      throw new Error('Failed to authenticate with Google')
    }
  }
  
  /**
   * Refresh access token using refresh token
   * @param refreshToken - Google refresh token
   * @returns New access token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken })
      const { credentials } = await this.oauth2Client.refreshAccessToken()
      return credentials
    } catch (error) {
      console.error('Error refreshing Google access token:', error)
      throw new Error('Failed to refresh Google access token')
    }
  }
  
  /**
   * Verify Google ID token
   * @param idToken - Google ID token
   * @returns Verified payload
   */
  async verifyIdToken(idToken: string) {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      })
      return ticket.getPayload()
    } catch (error) {
      console.error('Error verifying Google ID token:', error)
      throw new Error('Invalid Google ID token')
    }
  }
}

export const googleOAuthService = new GoogleOAuthService()
