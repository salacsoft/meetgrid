/**
 * User API endpoints
 * Handles user profile updates and preferences
 */
import { H3Event } from 'h3'
import { verifyAuth } from '../middleware/auth'
import { 
  getUserById, 
  updateUser,
  updatePassword as updateUserPassword
} from '../db/userRepository'
import { getDatabase } from '../db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event: H3Event) => {
  // Get the path and method
  const { path, method } = event.node.req
  
  try {
    // Verify authentication for all user endpoints
    const user = await verifyAuth(event)
    
    // Update profile
    if (path === '/api/user/profile' && method === 'PUT') {
      return await handleUpdateProfile(event, user.id)
    }
    
    // Update password
    if (path === '/api/user/password' && method === 'PUT') {
      return await handleUpdatePassword(event, user.id)
    }
    
    // Get preferences
    if (path === '/api/user/preferences' && method === 'GET') {
      return await handleGetPreferences(user.id)
    }
    
    // Update preferences
    if (path === '/api/user/preferences' && method === 'PUT') {
      return await handleUpdatePreferences(event, user.id)
    }
    
    // Route not found
    return createError({
      statusCode: 404,
      statusMessage: 'Route not found'
    })
  } catch (error) {
    // Authentication errors are already handled in verifyAuth
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return error
    }
    
    // Other errors
    console.error('User API error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

/**
 * Handle update profile
 */
async function handleUpdateProfile(event: H3Event, userId: number) {
  try {
    const { email, fullName, timezone } = await readBody(event)
    
    // Validate input
    if (!email) {
      return createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }
    
    // Update user profile
    const updatedUser = updateUser(userId, { 
      email, 
      fullName, 
      timezone 
    })
    
    return updatedUser
  } catch (error) {
    console.error('Error updating profile:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to update profile'
    })
  }
}

/**
 * Handle update password
 */
async function handleUpdatePassword(event: H3Event, userId: number) {
  try {
    const { currentPassword, newPassword } = await readBody(event)
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return createError({
        statusCode: 400,
        statusMessage: 'Current password and new password are required'
      })
    }
    
    if (newPassword.length < 8) {
      return createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 8 characters long'
      })
    }
    
    // Get user to verify current password
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    const user = stmt.get(userId)
    
    if (!user) {
      return createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // Verify current password
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password)
    if (!isPasswordValid) {
      return createError({
        statusCode: 400,
        statusMessage: 'Current password is incorrect'
      })
    }
    
    // Update password
    const success = updateUserPassword(userId, newPassword)
    
    if (!success) {
      return createError({
        statusCode: 500,
        statusMessage: 'Failed to update password'
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error updating password:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to update password'
    })
  }
}

/**
 * Handle update preferences
 * Stores user preferences in the database
 */
async function handleUpdatePreferences(event: H3Event, userId: number) {
  try {
    const preferences = await readBody(event)
    
    // Import here to avoid circular dependencies
    const { setUserPreferences, getAllUserPreferences } = await import('../db/preferencesRepository')
    
    // Store user preferences in database
    const successCount = setUserPreferences(userId, preferences)
    
    if (successCount === 0) {
      return createError({
        statusCode: 500,
        statusMessage: 'Failed to update preferences'
      })
    }
    
    // Get all current preferences to return
    const currentPreferences = getAllUserPreferences(userId)
    
    return { 
      success: true,
      preferencesUpdated: successCount,
      preferences: currentPreferences
    }
  } catch (error) {
    console.error('Error updating preferences:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to update preferences'
    })
  }
}

/**
 * Handle get preferences
 * Retrieves all user preferences from the database
 */
async function handleGetPreferences(userId: number) {
  try {
    // Import here to avoid circular dependencies
    const { getAllUserPreferences } = await import('../db/preferencesRepository')
    
    // Get all preferences for the user
    const preferences = getAllUserPreferences(userId)
    
    return { 
      success: true,
      preferences
    }
  } catch (error) {
    console.error('Error getting preferences:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve preferences'
    })
  }
}
