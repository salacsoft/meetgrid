/**
 * Schedule API endpoints
 * Handles CRUD operations for schedules
 */
import { H3Event } from 'h3'
import { verifyAuth } from '../middleware/auth'
import { 
  createSchedule, 
  getSchedulesByUserId, 
  getScheduleById, 
  updateSchedule, 
  deleteSchedule 
} from '../db/scheduleRepository'

export default defineEventHandler(async (event: H3Event) => {
  // Get the path and method
  const { path, method } = event.node.req
  
  try {
    // Verify authentication for all schedule endpoints
    const user = await verifyAuth(event)
    
    // List schedules
    if (path === '/api/schedules' && method === 'GET') {
      return await handleGetSchedules(event, user.id)
    }
    
    // Create schedule
    if (path === '/api/schedules' && method === 'POST') {
      return await handleCreateSchedule(event, user.id)
    }
    
    // Get schedule by ID
    const scheduleIdMatch = path.match(/^\/api\/schedules\/(\d+)$/)
    if (scheduleIdMatch && method === 'GET') {
      const scheduleId = parseInt(scheduleIdMatch[1])
      return await handleGetSchedule(event, scheduleId, user.id)
    }
    
    // Update schedule
    if (scheduleIdMatch && method === 'PUT') {
      const scheduleId = parseInt(scheduleIdMatch[1])
      return await handleUpdateSchedule(event, scheduleId, user.id)
    }
    
    // Delete schedule
    if (scheduleIdMatch && method === 'DELETE') {
      const scheduleId = parseInt(scheduleIdMatch[1])
      return await handleDeleteSchedule(event, scheduleId, user.id)
    }
    
    // Route not found
    return createError({
      statusCode: 404,
      statusMessage: 'Route not found'
    })
  } catch (error) {
    // Authentication errors are already handled in verifyAuth
    if (error.statusCode) {
      return error
    }
    
    // Other errors
    console.error('Schedule API error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

/**
 * Handle get schedules for current user
 */
async function handleGetSchedules(event: H3Event, userId: number) {
  try {
    const schedules = getSchedulesByUserId(userId)
    return schedules
  } catch (error) {
    console.error('Error getting schedules:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch schedules'
    })
  }
}

/**
 * Handle create schedule
 */
async function handleCreateSchedule(event: H3Event, userId: number) {
  const { title, description, visibility } = await readBody(event)
  
  // Validate input
  if (!title) {
    return createError({
      statusCode: 400,
      statusMessage: 'Title is required'
    })
  }
  
  try {
    const schedule = createSchedule(userId, title, description, visibility)
    return schedule
  } catch (error) {
    console.error('Error creating schedule:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to create schedule'
    })
  }
}

/**
 * Handle get schedule by ID
 */
async function handleGetSchedule(event: H3Event, scheduleId: number, userId: number) {
  try {
    const schedule = getScheduleById(scheduleId)
    
    if (!schedule) {
      return createError({
        statusCode: 404,
        statusMessage: 'Schedule not found'
      })
    }
    
    // Check if user has access to this schedule
    if (schedule.user_id !== userId) {
      // TODO: Check if schedule is shared with user's groups
      return createError({
        statusCode: 403,
        statusMessage: 'You do not have access to this schedule'
      })
    }
    
    return schedule
  } catch (error) {
    console.error('Error getting schedule:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch schedule'
    })
  }
}

/**
 * Handle update schedule
 */
async function handleUpdateSchedule(event: H3Event, scheduleId: number, userId: number) {
  const { title, description, visibility } = await readBody(event)
  
  try {
    // This will throw an error if user is not authorized to update the schedule
    const schedule = updateSchedule(scheduleId, { title, description, visibility }, userId)
    return schedule
  } catch (error) {
    console.error('Error updating schedule:', error)
    
    if (error.message.includes('Not authorized')) {
      return createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to update this schedule'
      })
    }
    
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to update schedule'
    })
  }
}

/**
 * Handle delete schedule
 */
async function handleDeleteSchedule(event: H3Event, scheduleId: number, userId: number) {
  try {
    const success = deleteSchedule(scheduleId, userId)
    
    if (!success) {
      return createError({
        statusCode: 404,
        statusMessage: 'Schedule not found or already deleted'
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting schedule:', error)
    
    if (error.message.includes('Not authorized')) {
      return createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to delete this schedule'
      })
    }
    
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to delete schedule'
    })
  }
}
