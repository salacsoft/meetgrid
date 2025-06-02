/**
 * User repository
 * Handles database operations related to users
 */
import { getDatabase } from '../db'
import bcrypt from 'bcryptjs'

/**
 * Create a new user
 * @param username - Unique username
 * @param email - User's email address
 * @param password - User's password (will be hashed)
 * @param fullName - User's full name
 * @param timezone - User's timezone
 * @returns The created user object (without password)
 */
export function createUser(username: string, email: string, password: string, fullName?: string, timezone: string = 'UTC') {
  const db = getDatabase()
  
  // Hash the password
  const salt = bcrypt.genSaltSync(10)
  const hashedPassword = bcrypt.hashSync(password, salt)
  
  try {
    // Insert the new user
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, full_name, timezone)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const info = stmt.run(username, email, hashedPassword, fullName || null, timezone)
    
    // Get the created user
    if (info.lastInsertRowid) {
      const user = getUserById(info.lastInsertRowid as number)
      return user
    }
    
    return null
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Get a user by ID
 * @param id - User ID
 * @returns User object (without password) or null if not found
 */
export function getUserById(id: number) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare('SELECT id, username, email, full_name, timezone, created_at, updated_at FROM users WHERE id = ?')
    return stmt.get(id) || null
  } catch (error) {
    console.error('Error getting user by ID:', error)
    throw error
  }
}

/**
 * Get a user by username
 * @param username - Username to search for
 * @returns User object (without password) or null if not found
 */
export function getUserByUsername(username: string) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare('SELECT id, username, email, full_name, timezone, created_at, updated_at FROM users WHERE username = ?')
    return stmt.get(username) || null
  } catch (error) {
    console.error('Error getting user by username:', error)
    throw error
  }
}

/**
 * Get a user by email
 * @param email - Email to search for
 * @returns User object (without password) or null if not found
 */
export function getUserByEmail(email: string) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare('SELECT id, username, email, full_name, timezone, created_at, updated_at FROM users WHERE email = ?')
    return stmt.get(email) || null
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

/**
 * Verify a user's credentials
 * @param usernameOrEmail - Username or email
 * @param password - Password to verify
 * @returns User object (without password) if credentials are valid, null otherwise
 */
export function verifyCredentials(usernameOrEmail: string, password: string) {
  const db = getDatabase()
  
  try {
    // Look up user by username or email
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?')
    const user = stmt.get(usernameOrEmail, usernameOrEmail)
    
    if (!user) {
      return null
    }
    
    // Verify password
    const passwordValid = bcrypt.compareSync(password, user.password)
    if (!passwordValid) {
      return null
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error('Error verifying credentials:', error)
    throw error
  }
}

/**
 * Update a user's profile
 * @param id - User ID
 * @param updates - Object containing fields to update
 * @returns Updated user object (without password)
 */
export function updateUser(id: number, updates: { fullName?: string; timezone?: string; email?: string }) {
  const db = getDatabase()
  
  try {
    let updateFields = []
    let params = []
    
    if (updates.fullName !== undefined) {
      updateFields.push('full_name = ?')
      params.push(updates.fullName)
    }
    
    if (updates.timezone !== undefined) {
      updateFields.push('timezone = ?')
      params.push(updates.timezone)
    }
    
    if (updates.email !== undefined) {
      updateFields.push('email = ?')
      params.push(updates.email)
    }
    
    if (updateFields.length === 0) {
      return getUserById(id)
    }
    
    updateFields.push('updated_at = datetime("now")')
    
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`
    params.push(id)
    
    const stmt = db.prepare(updateQuery)
    stmt.run(...params)
    
    return getUserById(id)
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Update a user's password
 * @param id - User ID
 * @param newPassword - New password
 * @returns True if successful
 */
export function updatePassword(id: number, newPassword: string) {
  const db = getDatabase()
  
  try {
    // Hash the new password
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(newPassword, salt)
    
    const stmt = db.prepare(`
      UPDATE users 
      SET password = ?, updated_at = datetime('now') 
      WHERE id = ?
    `)
    
    const info = stmt.run(hashedPassword, id)
    return info.changes > 0
  } catch (error) {
    console.error('Error updating password:', error)
    throw error
  }
}

/**
 * Create or update a user from OAuth provider (Google)
 * @param oauthData - OAuth user data from Google
 * @returns The created or updated user object
 */
export function createOrUpdateOAuthUser(oauthData: {
  googleId: string
  email: string
  fullName?: string
  firstName?: string
  lastName?: string
  avatar?: string
  emailVerified?: boolean
}) {
  const db = getDatabase()
  
  try {
    // Check if user already exists by Google ID
    let user = getUserByGoogleId(oauthData.googleId)
    
    if (user) {
      // Update existing user with fresh data
      const updateData = {
        fullName: oauthData.fullName,
        email: oauthData.email,
        avatar: oauthData.avatar,
        emailVerified: oauthData.emailVerified
      }
      
      return updateOAuthUser(user.id, updateData)
    }
    
    // Check if user exists by email (for account linking)
    user = getUserByEmail(oauthData.email)
    
    if (user) {
      // Link Google account to existing email-based account
      return linkGoogleAccount(user.id, oauthData.googleId, oauthData.avatar)
    }
    
    // Create new OAuth user
    const username = generateUsernameFromEmail(oauthData.email)
    
    const stmt = db.prepare(`
      INSERT INTO users (username, email, full_name, google_id, avatar, email_verified, timezone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    const info = stmt.run(
      username,
      oauthData.email,
      oauthData.fullName || null,
      oauthData.googleId,
      oauthData.avatar || null,
      oauthData.emailVerified ? 1 : 0,
      'UTC'
    )
    
    if (info.lastInsertRowid) {
      return getUserById(info.lastInsertRowid as number)
    }
    
    return null
  } catch (error) {
    console.error('Error creating/updating OAuth user:', error)
    throw error
  }
}

/**
 * Get a user by Google ID
 * @param googleId - Google ID to search for
 * @returns User object or null if not found
 */
export function getUserByGoogleId(googleId: string) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare('SELECT id, username, email, full_name, google_id, avatar, email_verified, timezone, created_at, updated_at FROM users WHERE google_id = ?')
    return stmt.get(googleId) || null
  } catch (error) {
    console.error('Error getting user by Google ID:', error)
    throw error
  }
}

/**
 * Link Google account to existing user
 * @param userId - Existing user ID
 * @param googleId - Google ID to link
 * @param avatar - Google avatar URL
 * @returns Updated user object
 */
export function linkGoogleAccount(userId: number, googleId: string, avatar?: string) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      UPDATE users 
      SET google_id = ?, avatar = ?, email_verified = 1, updated_at = datetime('now')
      WHERE id = ?
    `)
    
    stmt.run(googleId, avatar || null, userId)
    return getUserById(userId)
  } catch (error) {
    console.error('Error linking Google account:', error)
    throw error
  }
}

/**
 * Update OAuth user data
 * @param userId - User ID
 * @param updates - OAuth data to update
 * @returns Updated user object
 */
export function updateOAuthUser(userId: number, updates: {
  fullName?: string
  email?: string
  avatar?: string
  emailVerified?: boolean
}) {
  const db = getDatabase()
  
  try {
    let updateFields = []
    let params = []
    
    if (updates.fullName !== undefined) {
      updateFields.push('full_name = ?')
      params.push(updates.fullName)
    }
    
    if (updates.email !== undefined) {
      updateFields.push('email = ?')
      params.push(updates.email)
    }
    
    if (updates.avatar !== undefined) {
      updateFields.push('avatar = ?')
      params.push(updates.avatar)
    }
    
    if (updates.emailVerified !== undefined) {
      updateFields.push('email_verified = ?')
      params.push(updates.emailVerified ? 1 : 0)
    }
    
    if (updateFields.length === 0) {
      return getUserById(userId)
    }
    
    updateFields.push('updated_at = datetime("now")')
    
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`
    params.push(userId)
    
    const stmt = db.prepare(updateQuery)
    stmt.run(...params)
    
    return getUserById(userId)
  } catch (error) {
    console.error('Error updating OAuth user:', error)
    throw error
  }
}

/**
 * Generate a unique username from email
 * @param email - Email address
 * @returns Unique username
 */
function generateUsernameFromEmail(email: string): string {
  const db = getDatabase()
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  
  let username = baseUsername
  let counter = 1
  
  // Check if username exists and increment counter if needed
  while (getUserByUsername(username)) {
    username = `${baseUsername}${counter}`
    counter++
  }
  
  return username
}
