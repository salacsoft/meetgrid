/**
 * User login API endpoint
 * POST /api/auth/login
 */
import { verifyCredentials } from '../../db/userRepository'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production'

export default defineEventHandler(async (event) => {
  // Only handle POST requests
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  try {
    const { usernameOrEmail, password } = await readBody(event)
    
    // Validate input
    if (!usernameOrEmail || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username/email and password are required'
      })
    }
    
    // Verify credentials
    const user = verifyCredentials(usernameOrEmail, password)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Return user info and token
    return {
      success: true,
      user,
      token
    }
  } catch (error) {
    console.error('Login error:', error)
    
    // If it's already a handled error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, return a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during login'
    })
  }
})
