/**
 * User associations API endpoints
 * Handles HTTP requests for user connections and relationship management
 */
import jwt from 'jsonwebtoken'
import { 
  sendAssociationRequest,
  acceptAssociationRequest,
  rejectAssociation,
  getUserAssociations,
  getPendingRequests,
  searchUsersToAssociate,
  updateAssociation
} from '../db/userAssociationsRepository'

/**
 * Get current user's associations
 */
export default defineEventHandler(async (event) => {
  try {
    // Handle different HTTP methods
    const method = getMethod(event)
    
    // Get auth token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, useRuntimeConfig().jwtSecret) as any
    const userId = decoded.userId
    
    if (method === 'GET') {
      const query = getQuery(event)
      
      // If searching for users
      if (query.search) {
        const searchTerm = query.search as string
        const users = searchUsersToAssociate(userId, searchTerm)
        return { users }
      }
      
      // If getting pending requests
      if (query.pending === 'true') {
        const requests = getPendingRequests(userId)
        return { requests }
      }
      
      // Get user's associations
      const status = query.status as any
      const associations = getUserAssociations(userId, status)
      return { associations }
    }
    
    if (method === 'POST') {
      const body = await readBody(event)
      
      // Send association request
      if (body.action === 'request') {
        const { toUserId, relationshipType, notes } = body
        
        if (!toUserId) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Target user ID is required'
          })
        }
        
        const association = sendAssociationRequest(userId, toUserId, relationshipType, notes)
        
        if (!association) {
          throw createError({
            statusCode: 409,
            statusMessage: 'Association already exists'
          })
        }
        
        return { association, message: 'Association request sent successfully' }
      }
      
      // Accept association request
      if (body.action === 'accept') {
        const { associationId } = body
        
        if (!associationId) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Association ID is required'
          })
        }
        
        const association = acceptAssociationRequest(associationId, userId)
        
        if (!association) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Association request not found or not authorized'
          })
        }
        
        return { association, message: 'Association accepted successfully' }
      }
      
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid action'
      })
    }
    
    if (method === 'PUT') {
      const body = await readBody(event)
      const { associationId, relationshipType, notes } = body
      
      if (!associationId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Association ID is required'
        })
      }
      
      const association = updateAssociation(associationId, userId, {
        relationship_type: relationshipType,
        notes
      })
      
      if (!association) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Association not found or not authorized'
        })
      }
      
      return { association, message: 'Association updated successfully' }
    }
    
    if (method === 'DELETE') {
      const query = getQuery(event)
      const associationId = query.id as string
      
      if (!associationId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Association ID is required'
        })
      }
      
      const success = rejectAssociation(parseInt(associationId), userId)
      
      if (!success) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Association not found or not authorized'
        })
      }
      
      return { message: 'Association removed successfully' }
    }
    
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  } catch (error: any) {
    console.error('User associations API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
