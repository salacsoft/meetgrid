/**
 * Get current user API endpoint
 * GET /api/auth/me
 */
import { getUserById } from '../../db/userRepository'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production'

export default defineEventHandler(async (event) => {
  // Only handle GET requests
  if (getMethod(event) !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  try {
    // Get authorization header
    const authorization = getHeader(event, 'authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization token required'
      })
    }
    
    const token = authorization.substring(7) // Remove "Bearer " prefix
    
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    if (!decoded.userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    
    // Get user from database
    const user = getUserById(decoded.userId)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    return {
      success: true,
      user
    }
  } catch (error) {
    console.error('Get current user error:', error)
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired'
      })
    }
    
    // If it's already a handled error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, return a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while fetching user data'
    })
  }
})
