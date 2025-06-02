/**
 * Authentication middleware
 * This middleware verifies JWT tokens for protected routes
 */
import { H3Event } from 'h3'
import jwt from 'jsonwebtoken'

// Secret key for JWT verification - must match the one used for signing
const JWT_SECRET = 'your_jwt_secret_key_change_me_in_production'

/**
 * Verify JWT token from Authorization header
 * @param event - H3 event
 * @returns User information from token if valid
 */
export async function verifyAuth(event: H3Event) {
  // Get token from Authorization header
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  // Extract token
  const token = authHeader.substring(7)
  
  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded.user
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }
}

/**
 * Auth middleware for protected endpoints
 * Adds the authenticated user to the event context
 */
export default defineEventHandler(async (event: H3Event) => {
  // Skip auth for public routes
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/',
    '/auth/login',
    '/auth/register'
  ]
  
  if (publicRoutes.includes(event.path)) {
    return
  }
  
  // Skip auth check for non-API routes
  if (!event.path.startsWith('/api/')) {
    return
  }
  
  try {
    // Verify auth and set user in event context
    const user = await verifyAuth(event)
    event.context.auth = { user }
  } catch (error) {
    return error
  }
})
