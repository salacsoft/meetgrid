/**
 * User associations repository
 * Handles database operations related to user associations and connections
 */
import { getDatabase } from '../db'

export interface UserAssociation {
  id: number
  user_id: number
  associated_user_id: number
  status: 'pending' | 'accepted' | 'blocked'
  relationship_type: 'colleague' | 'friend' | 'family' | 'client' | 'manager' | 'team_member'
  notes?: string
  requested_by: number
  created_at: string
  updated_at: string
  // Joined user data
  username?: string
  full_name?: string
  email?: string
  avatar?: string
}

/**
 * Send an association request to another user
 * @param fromUserId - ID of user sending the request
 * @param toUserId - ID of user receiving the request
 * @param relationshipType - Type of relationship
 * @param notes - Optional notes about the relationship
 * @returns The created association or null if already exists
 */
export function sendAssociationRequest(
  fromUserId: number, 
  toUserId: number, 
  relationshipType: UserAssociation['relationship_type'] = 'colleague',
  notes?: string
): UserAssociation | null {
  const db = getDatabase()
  
  try {
    // Check if association already exists
    const existing = db.prepare(`
      SELECT * FROM user_associations 
      WHERE (user_id = ? AND associated_user_id = ?) 
         OR (user_id = ? AND associated_user_id = ?)
    `).get(fromUserId, toUserId, toUserId, fromUserId)
    
    if (existing) {
      return null // Association already exists
    }
    
    // Create the association request
    const stmt = db.prepare(`
      INSERT INTO user_associations (user_id, associated_user_id, status, relationship_type, notes, requested_by)
      VALUES (?, ?, 'pending', ?, ?, ?)
    `)
    
    const info = stmt.run(fromUserId, toUserId, relationshipType, notes || null, fromUserId)
    
    if (info.lastInsertRowid) {
      return getAssociationById(info.lastInsertRowid as number)
    }
    
    return null
  } catch (error) {
    console.error('Error sending association request:', error)
    throw error
  }
}

/**
 * Accept an association request
 * @param associationId - ID of the association to accept
 * @param userId - ID of user accepting (must be the target user)
 * @returns Updated association or null if not found/not authorized
 */
export function acceptAssociationRequest(associationId: number, userId: number): UserAssociation | null {
  const db = getDatabase()
  
  try {
    // Verify the user is authorized to accept this request
    const association = db.prepare(`
      SELECT * FROM user_associations 
      WHERE id = ? AND associated_user_id = ? AND status = 'pending'
    `).get(associationId, userId)
    
    if (!association) {
      return null
    }
    
    // Update status to accepted
    const stmt = db.prepare(`
      UPDATE user_associations 
      SET status = 'accepted', updated_at = datetime('now')
      WHERE id = ?
    `)
    
    stmt.run(associationId)
    
    // Create the reverse association for bidirectional relationship
    const reverseStmt = db.prepare(`
      INSERT INTO user_associations (user_id, associated_user_id, status, relationship_type, notes, requested_by)
      VALUES (?, ?, 'accepted', ?, ?, ?)
    `)
    
    reverseStmt.run(
      association.associated_user_id, 
      association.user_id, 
      association.relationship_type,
      association.notes,
      association.requested_by
    )
    
    return getAssociationById(associationId)
  } catch (error) {
    console.error('Error accepting association request:', error)
    throw error
  }
}

/**
 * Reject or remove an association
 * @param associationId - ID of the association
 * @param userId - ID of user performing the action
 * @returns True if successful, false otherwise
 */
export function rejectAssociation(associationId: number, userId: number): boolean {
  const db = getDatabase()
  
  try {
    // Verify the user is authorized (either sender or receiver)
    const association = db.prepare(`
      SELECT * FROM user_associations 
      WHERE id = ? AND (user_id = ? OR associated_user_id = ?)
    `).get(associationId, userId, userId)
    
    if (!association) {
      return false
    }
    
    // Delete the association and any reverse association
    const deleteStmt = db.prepare('DELETE FROM user_associations WHERE id = ?')
    deleteStmt.run(associationId)
    
    // Delete reverse association if it exists
    const reverseDeleteStmt = db.prepare(`
      DELETE FROM user_associations 
      WHERE user_id = ? AND associated_user_id = ? AND requested_by = ?
    `)
    
    reverseDeleteStmt.run(association.associated_user_id, association.user_id, association.requested_by)
    
    return true
  } catch (error) {
    console.error('Error rejecting association:', error)
    throw error
  }
}

/**
 * Get all associations for a user
 * @param userId - User ID
 * @param status - Optional status filter
 * @returns Array of user associations with user details
 */
export function getUserAssociations(userId: number, status?: UserAssociation['status']): UserAssociation[] {
  const db = getDatabase()
  
  try {
    let query = `
      SELECT 
        ua.*,
        u.username,
        u.full_name,
        u.email,
        u.avatar
      FROM user_associations ua
      JOIN users u ON u.id = ua.associated_user_id
      WHERE ua.user_id = ?
    `
    
    const params = [userId]
    
    if (status) {
      query += ' AND ua.status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY ua.created_at DESC'
    
    const stmt = db.prepare(query)
    return stmt.all(...params) || []
  } catch (error) {
    console.error('Error getting user associations:', error)
    throw error
  }
}

/**
 * Get pending association requests for a user
 * @param userId - User ID
 * @returns Array of pending requests sent to this user
 */
export function getPendingRequests(userId: number): UserAssociation[] {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      SELECT 
        ua.*,
        u.username,
        u.full_name,
        u.email,
        u.avatar
      FROM user_associations ua
      JOIN users u ON u.id = ua.user_id
      WHERE ua.associated_user_id = ? AND ua.status = 'pending'
      ORDER BY ua.created_at DESC
    `)
    
    return stmt.all(userId) || []
  } catch (error) {
    console.error('Error getting pending requests:', error)
    throw error
  }
}

/**
 * Search for users to associate with
 * @param currentUserId - Current user's ID (to exclude from results)
 * @param searchTerm - Search term for username, email, or full name
 * @returns Array of users matching the search term
 */
export function searchUsersToAssociate(currentUserId: number, searchTerm: string) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.email,
        u.avatar,
        CASE 
          WHEN ua.id IS NOT NULL THEN ua.status
          ELSE NULL
        END as association_status
      FROM users u
      LEFT JOIN user_associations ua ON (
        (ua.user_id = ? AND ua.associated_user_id = u.id) OR
        (ua.user_id = u.id AND ua.associated_user_id = ?)
      )
      WHERE u.id != ? 
        AND (
          u.username LIKE ? OR 
          u.email LIKE ? OR 
          u.full_name LIKE ?
        )
      ORDER BY u.full_name, u.username
      LIMIT 20
    `)
    
    const searchPattern = `%${searchTerm}%`
    return stmt.all(
      currentUserId, currentUserId, currentUserId,
      searchPattern, searchPattern, searchPattern
    ) || []
  } catch (error) {
    console.error('Error searching users:', error)
    throw error
  }
}

/**
 * Get an association by ID
 * @param id - Association ID
 * @returns Association with user details or null
 */
export function getAssociationById(id: number): UserAssociation | null {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      SELECT 
        ua.*,
        u.username,
        u.full_name,
        u.email,
        u.avatar
      FROM user_associations ua
      JOIN users u ON u.id = ua.associated_user_id
      WHERE ua.id = ?
    `)
    
    return stmt.get(id) || null
  } catch (error) {
    console.error('Error getting association by ID:', error)
    throw error
  }
}

/**
 * Update association relationship type and notes
 * @param associationId - Association ID
 * @param userId - User ID (must be part of the association)
 * @param updates - Fields to update
 * @returns Updated association or null
 */
export function updateAssociation(
  associationId: number, 
  userId: number, 
  updates: { relationship_type?: UserAssociation['relationship_type']; notes?: string }
): UserAssociation | null {
  const db = getDatabase()
  
  try {
    // Verify user is part of this association
    const association = db.prepare(`
      SELECT * FROM user_associations 
      WHERE id = ? AND (user_id = ? OR associated_user_id = ?)
    `).get(associationId, userId, userId)
    
    if (!association) {
      return null
    }
    
    const updateFields = []
    const params = []
    
    if (updates.relationship_type) {
      updateFields.push('relationship_type = ?')
      params.push(updates.relationship_type)
    }
    
    if (updates.notes !== undefined) {
      updateFields.push('notes = ?')
      params.push(updates.notes)
    }
    
    if (updateFields.length === 0) {
      return getAssociationById(associationId)
    }
    
    updateFields.push('updated_at = datetime(\'now\')')
    params.push(associationId)
    
    const stmt = db.prepare(`
      UPDATE user_associations 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `)
    
    stmt.run(...params)
    
    return getAssociationById(associationId)
  } catch (error) {
    console.error('Error updating association:', error)
    throw error
  }
}
