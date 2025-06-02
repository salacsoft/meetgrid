/**
 * Events API endpoints
 * Handles CRUD operations for events
 */
import { H3Event } from 'h3'
import { verifyAuth } from '../middleware/auth'
import { getScheduleById } from '../db/scheduleRepository'
import {
  createEvent,
  getEventsByScheduleId,
  getEventById,
  updateEvent,
  deleteEvent
} from '../db/scheduleRepository'

export default defineEventHandler(async (event: H3Event) => {
  // Get the path and method
  const { path, method } = event.node.req
  
  try {
    // Verify authentication for all event endpoints
    const user = await verifyAuth(event)
    
    // Get events for a schedule
    const scheduleEventsMatch = path.match(/^\/api\/schedules\/(\d+)\/events$/)
    if (scheduleEventsMatch && method === 'GET') {
      const scheduleId = parseInt(scheduleEventsMatch[1])
      return await handleGetEvents(event, scheduleId, user.id)
    }
    
    // Create event in a schedule
    if (scheduleEventsMatch && method === 'POST') {
      const scheduleId = parseInt(scheduleEventsMatch[1])
      return await handleCreateEvent(event, scheduleId, user.id)
    }
    
    // Get event by ID
    const eventIdMatch = path.match(/^\/api\/events\/(\d+)$/)
    if (eventIdMatch && method === 'GET') {
      const eventId = parseInt(eventIdMatch[1])
      return await handleGetEvent(event, eventId, user.id)
    }
    
    // Update event
    if (eventIdMatch && method === 'PUT') {
      const eventId = parseInt(eventIdMatch[1])
      return await handleUpdateEvent(event, eventId, user.id)
    }
    
    // Delete event
    if (eventIdMatch && method === 'DELETE') {
      const eventId = parseInt(eventIdMatch[1])
      return await handleDeleteEvent(event, eventId, user.id)
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
    console.error('Events API error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

/**
 * Handle get events for a schedule
 */
async function handleGetEvents(event: H3Event, scheduleId: number, userId: number) {
  try {
    // Check if user has access to this schedule
    const schedule = getScheduleById(scheduleId)
    
    if (!schedule) {
      return createError({
        statusCode: 404,
        statusMessage: 'Schedule not found'
      })
    }
    
    if (schedule.user_id !== userId) {
      // TODO: Check if schedule is shared with user's groups
      return createError({
        statusCode: 403,
        statusMessage: 'You do not have access to this schedule'
      })
    }
    
    // Get events
    const events = getEventsByScheduleId(scheduleId)
    return events
  } catch (error) {
    console.error('Error getting events:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch events'
    })
  }
}

/**
 * Handle create event
 */
async function handleCreateEvent(event: H3Event, scheduleId: number, userId: number) {
  try {
    // Check if user has access to this schedule
    const schedule = getScheduleById(scheduleId)
    
    if (!schedule) {
      return createError({
        statusCode: 404,
        statusMessage: 'Schedule not found'
      })
    }
    
    if (schedule.user_id !== userId) {
      // TODO: Check if schedule is shared with user's groups with write permissions
      return createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to add events to this schedule'
      })
    }
    
    // Get event data
    const { 
      title, 
      description, 
      location,
      start_time, 
      end_time, 
      is_all_day,
      recurrence_rule
    } = await readBody(event)
    
    // Validate input
    if (!title || !start_time || !end_time) {
      return createError({
        statusCode: 400,
        statusMessage: 'Title, start time, and end time are required'
      })
    }
    
    // Create event
    const newEvent = createEvent(
      scheduleId,
      title,
      start_time,
      end_time,
      description,
      location,
      is_all_day === true || is_all_day === 1,
      recurrence_rule
    )
    
    return newEvent
  } catch (error) {
    console.error('Error creating event:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to create event'
    })
  }
}

/**
 * Handle get event by ID
 */
async function handleGetEvent(event: H3Event, eventId: number, userId: number) {
  try {
    // Get event
    const eventData = getEventById(eventId)
    
    if (!eventData) {
      return createError({
        statusCode: 404,
        statusMessage: 'Event not found'
      })
    }
    
    // Check if user has access to this event's schedule
    const schedule = getScheduleById(eventData.schedule_id)
    
    if (schedule.user_id !== userId) {
      // TODO: Check if schedule is shared with user's groups
      return createError({
        statusCode: 403,
        statusMessage: 'You do not have access to this event'
      })
    }
    
    return eventData
  } catch (error) {
    console.error('Error getting event:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch event'
    })
  }
}

/**
 * Handle update event
 */
async function handleUpdateEvent(event: H3Event, eventId: number, userId: number) {
  try {
    // Get current event
    const currentEvent = getEventById(eventId)
    
    if (!currentEvent) {
      return createError({
        statusCode: 404,
        statusMessage: 'Event not found'
      })
    }
    
    // Check if user has access to this event's schedule
    const schedule = getScheduleById(currentEvent.schedule_id)
    
    if (schedule.user_id !== userId) {
      // TODO: Check if schedule is shared with user's groups with write permissions
      return createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to update this event'
      })
    }
    
    // Get event data
    const { 
      title, 
      description, 
      location,
      start_time, 
      end_time, 
      is_all_day,
      recurrence_rule
    } = await readBody(event)
    
    // Update event
    const updatedEvent = updateEvent(
      eventId,
      title,
      start_time,
      end_time,
      description,
      location,
      is_all_day === true || is_all_day === 1,
      recurrence_rule
    )
    
    return updatedEvent
  } catch (error) {
    console.error('Error updating event:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to update event'
    })
  }
}

/**
 * Handle delete event
 */
async function handleDeleteEvent(event: H3Event, eventId: number, userId: number) {
  try {
    // Get current event
    const currentEvent = getEventById(eventId)
    
    if (!currentEvent) {
      return createError({
        statusCode: 404,
        statusMessage: 'Event not found'
      })
    }
    
    // Check if user has access to this event's schedule
    const schedule = getScheduleById(currentEvent.schedule_id)
    
    if (schedule.user_id !== userId) {
      // TODO: Check if schedule is shared with user's groups with write permissions
      return createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to delete this event'
      })
    }
    
    // Delete event
    const success = deleteEvent(eventId)
    
    if (!success) {
      return createError({
        statusCode: 500,
        statusMessage: 'Failed to delete event'
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting event:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to delete event'
    })
  }
}
