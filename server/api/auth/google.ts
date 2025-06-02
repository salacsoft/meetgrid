/**
 * Google OAuth API endpoints
 * Handles Google OAuth authentication flow
 */
import jwt from 'jsonwebtoken'
import { H3Event } from 'h3'
import { googleOAuthService } from '../../services/googleOAuth'
import { createOrUpdateOAuthUser } from '../../db/userRepository'

// JWT secret from environment or fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production'
const TOKEN_EXPIRATION = 60 * 60 * 24 * 7 // 7 days
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

export default defineEventHandler(async (event: H3Event) => {
  const { path, method } = event.node.req
  
  // Handle Google OAuth initiation
  if (path === '/api/auth/google' && method === 'GET') {
    return await handleGoogleAuth(event)
  }
  
  // Handle Google OAuth callback
  if (path === '/api/auth/google/callback' && method === 'GET') {
    return await handleGoogleCallback(event)
  }
  
  return createError({
    statusCode: 404,
    statusMessage: 'OAuth route not found'
  })
})

/**
 * Initiate Google OAuth flow
 * Redirects user to Google's authorization page
 */
async function handleGoogleAuth(event: H3Event) {
  try {
    const authUrl = googleOAuthService.getAuthUrl()
    
    // Redirect to Google OAuth
    return sendRedirect(event, authUrl)
  } catch (error) {
    console.error('Google OAuth initiation error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to initiate Google authentication'
    })
  }
}

/**
 * Handle Google OAuth callback
 * Processes the authorization code and creates/logs in user
 */
async function handleGoogleCallback(event: H3Event) {
  try {
    const query = getQuery(event)
    const code = query.code as string
    const error = query.error as string
    
    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error)
      return sendRedirect(event, `${BASE_URL}/auth/login?error=oauth_denied`)
    }
    
    if (!code) {
      return sendRedirect(event, `${BASE_URL}/auth/login?error=missing_code`)
    }
    
    // Exchange code for tokens and get user info
    const { user: googleUser, tokens } = await googleOAuthService.getTokensAndUserInfo(code)
    
    // Create or update user in database
    const user = createOrUpdateOAuthUser({
      googleId: googleUser.googleId,
      email: googleUser.email!,
      fullName: googleUser.fullName,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      avatar: googleUser.avatar,
      emailVerified: googleUser.emailVerified
    })
    
    if (!user) {
      return sendRedirect(event, `${BASE_URL}/auth/login?error=user_creation_failed`)
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        user: {
          ...user,
          googleTokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiryDate: tokens.expiryDate
          }
        }
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    )
    
    // Store token in secure cookie and redirect to success page
    setCookie(event, 'auth_token', token, {
      httpOnly: false, // Set to false so client can access it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRATION
    })
    
    // Redirect to main app with success
    return sendRedirect(event, `${BASE_URL}/?auth=success`)
    
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return sendRedirect(event, `${BASE_URL}/auth/login?error=oauth_failed`)
  }
}
