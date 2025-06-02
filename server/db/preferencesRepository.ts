/**
 * User preferences repository
 * Handles database operations related to user preferences
 */
import { getDatabase } from '../db'

/**
 * Get a preference value for a user
 * @param userId - User ID
 * @param key - Preference key
 * @param defaultValue - Default value if preference is not found
 * @returns Preference value or the default value if not found
 */
export function getUserPreference(userId: number, key: string, defaultValue: any = null) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      SELECT preference_value FROM user_preferences
      WHERE user_id = ? AND preference_key = ?
    `)
    const result = stmt.get(userId, key)
    
    if (!result) {
      return defaultValue
    }
    
    try {
      // Try to parse as JSON first
      return JSON.parse(result.preference_value)
    } catch {
      // If not JSON, return as is
      return result.preference_value
    }
  } catch (error) {
    console.error('Error getting user preference:', error)
    return defaultValue
  }
}

/**
 * Get all preferences for a user
 * @param userId - User ID
 * @returns Object with all user preferences
 */
export function getAllUserPreferences(userId: number) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      SELECT preference_key, preference_value FROM user_preferences
      WHERE user_id = ?
    `)
    const results = stmt.all(userId)
    
    const preferences: Record<string, any> = {}
    
    for (const row of results) {
      try {
        // Try to parse as JSON first
        preferences[row.preference_key] = JSON.parse(row.preference_value)
      } catch {
        // If not JSON, store as is
        preferences[row.preference_key] = row.preference_value
      }
    }
    
    return preferences
  } catch (error) {
    console.error('Error getting all user preferences:', error)
    return {}
  }
}

/**
 * Set a preference value for a user
 * @param userId - User ID
 * @param key - Preference key
 * @param value - Preference value
 * @returns True if the operation was successful
 */
export function setUserPreference(userId: number, key: string, value: any) {
  const db = getDatabase()
  
  try {
    // Convert objects and arrays to JSON strings
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value
    
    const stmt = db.prepare(`
      INSERT INTO user_preferences (user_id, preference_key, preference_value)
      VALUES (?, ?, ?)
      ON CONFLICT (user_id, preference_key)
      DO UPDATE SET preference_value = ?, updated_at = datetime('now')
    `)
    
    const info = stmt.run(userId, key, valueToStore, valueToStore)
    return info.changes > 0
  } catch (error) {
    console.error('Error setting user preference:', error)
    return false
  }
}

/**
 * Set multiple preferences for a user at once
 * @param userId - User ID
 * @param preferences - Object containing key-value pairs of preferences
 * @returns Number of preferences successfully set
 */
export function setUserPreferences(userId: number, preferences: Record<string, any>) {
  const db = getDatabase()
  let successCount = 0
  
  try {
    const stmt = db.prepare(`
      INSERT INTO user_preferences (user_id, preference_key, preference_value)
      VALUES (?, ?, ?)
      ON CONFLICT (user_id, preference_key)
      DO UPDATE SET preference_value = ?, updated_at = datetime('now')
    `)
    
    // Use a transaction for better performance and atomicity
    const transaction = db.transaction((prefs) => {
      for (const [key, value] of Object.entries(prefs)) {
        const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value
        const info = stmt.run(userId, key, valueToStore, valueToStore)
        if (info.changes > 0) {
          successCount++
        }
      }
      return successCount
    })
    
    return transaction(preferences)
  } catch (error) {
    console.error('Error setting user preferences:', error)
    return successCount
  }
}

/**
 * Delete a preference for a user
 * @param userId - User ID
 * @param key - Preference key
 * @returns True if the operation was successful
 */
export function deleteUserPreference(userId: number, key: string) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      DELETE FROM user_preferences
      WHERE user_id = ? AND preference_key = ?
    `)
    
    const info = stmt.run(userId, key)
    return info.changes > 0
  } catch (error) {
    console.error('Error deleting user preference:', error)
    return false
  }
}

/**
 * Delete all preferences for a user
 * @param userId - User ID
 * @returns Number of preferences deleted
 */
export function deleteAllUserPreferences(userId: number) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      DELETE FROM user_preferences
      WHERE user_id = ?
    `)
    
    const info = stmt.run(userId)
    return info.changes
  } catch (error) {
    console.error('Error deleting all user preferences:', error)
    return 0
  }
}
