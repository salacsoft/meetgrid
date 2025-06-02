/**
 * Authentication service
 * Handles authentication routes for the application
 */
import jwt from 'jsonwebtoken'
import { H3Event } from 'h3'
import { verifyCredentials, createUser, getUserByEmail, getUserByUsername } from '../db/userRepository'

// Secret key for JWT signing - in production, use an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production'
// Token expiration (in seconds)
const TOKEN_EXPIRATION = 60 * 60 * 24 * 7 // 7 days

/**
 * Login handler - authenticates a user and returns a JWT token
 */
export default defineEventHandler(async (event: H3Event) => {
  const { path, method } = event.node.req
  
  // Handle login request
  if (path === '/api/auth/login' && method === 'POST') {
    return await handleLogin(event)
  }
  
  // Handle registration request
  if (path === '/api/auth/register' && method === 'POST') {
    return await handleRegister(event)
  }
  
  // Handle logout request
  if (path === '/api/auth/logout' && method === 'POST') {
    return await handleLogout(event)
  }
  
  // Handle current user request (get the currently logged in user)
  if (path === '/api/auth/me' && method === 'GET') {
    return await handleGetCurrentUser(event)
  }
  
  return { error: 'Route not found' }
})

/**
 * Handle user login
 * @param event - H3 event
 * @returns User information and token if login is successful
 */
async function handleLogin(event: H3Event) {
  try {
    const { usernameOrEmail, password } = await readBody(event)
    
    // Validate input
    if (!usernameOrEmail || !password) {
      return createError({
        statusCode: 400,
        statusMessage: 'Username/email and password are required'
      })
    }
    
    // Verify credentials
    const user = verifyCredentials(usernameOrEmail, password)
    if (!user) {
      return createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }
    
    // Generate token
    const token = generateToken(user)
    
    // Return user info and token
    return {
      success: true,
      user,
      token
    }
  } catch (error) {
    console.error('Login error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'An error occurred during login'
    })
  }
}

/**
 * Handle user registration
 * @param event - H3 event
 * @returns User information and token if registration is successful
 */
async function handleRegister(event: H3Event) {
  try {
    const { username, email, password, fullName, timezone } = await readBody(event)
    
    // Validate input
    if (!username || !email || !password) {
      return createError({
        statusCode: 400,
        statusMessage: 'Username, email, and password are required'
      })
    }
    
    // Check if user already exists
    const existingUser = getUserByUsername(username) || getUserByEmail(email)
    if (existingUser) {
      return createError({
        statusCode: 409,
        statusMessage: 'Username or email already exists'
      })
    }
    
    // Create new user
    const user = createUser(username, email, password, fullName, timezone)
    if (!user) {
      return createError({
        statusCode: 500,
        statusMessage: 'Failed to create user'
      })
    }
    
    // Generate token
    const token = generateToken(user)
    
    // Return user info and token
    return {
      success: true,
      user,
      token
    }
  } catch (error) {
    console.error('Registration error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'An error occurred during registration'
    })
  }
}

/**
 * Handle user logout
 * @param event - H3 event
 * @returns Success message
 */
async function handleLogout(event: H3Event) {
  // In a stateless JWT system, there's no server-side logout
  // The client is responsible for removing the token
  return {
    message: 'Logged out successfully'
  }
}

/**
 * Handle get current user
 * @param event - H3 event
 * @returns Current user information
 */
async function handleGetCurrentUser(event: H3Event) {
  try {
    // Get authorization header
    const token = getTokenFromHeader(event)
    if (!token) {
      return createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }
    
    return { user: decoded.user }
  } catch (error) {
    console.error('Get current user error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'An error occurred'
    })
  }
}

/**
 * Generate JWT token for a user
 * @param user - User object
 * @returns JWT token
 */
function generateToken(user: any) {
  return jwt.sign(
    { user },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  )
}

/**
 * Get token from the Authorization header
 * @param event - H3 event
 * @returns Token or null if not found
 */
function getTokenFromHeader(event: H3Event) {
  // Get authorization header
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  // Extract token
  return authHeader.substring(7)
}
