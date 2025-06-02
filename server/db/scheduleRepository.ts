/**
 * Schedule repository
 * Handles database operations related to schedules and events
 */
import { getDatabase } from '../db'
import { Database } from 'better-sqlite3'

/**
 * Create a new schedule
 * @param userId - User who owns the schedule
 * @param title - Schedule title
 * @param description - Schedule description
 * @param visibility - Schedule visibility ('private', 'public', 'group')
 * @returns Created schedule object
 */
export function createSchedule(userId: number, title: string, description?: string, visibility: 'private' | 'public' | 'group' = 'private') {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      INSERT INTO schedules (title, description, user_id, visibility)
      VALUES (?, ?, ?, ?)
    `)
    
    const info = stmt.run(title, description || null, userId, visibility)
    
    if (info.lastInsertRowid) {
      return getScheduleById(info.lastInsertRowid as number)
    }
    
    return null
  } catch (error) {
    console.error('Error creating schedule:', error)
    throw error
  }
}

/**
 * Get a schedule by ID
 * @param id - Schedule ID
 * @returns Schedule object or null if not found
 */
export function getScheduleById(id: number) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      SELECT s.*, u.username as owner_username 
      FROM schedules s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `)
    return stmt.get(id) || null
  } catch (error) {
    console.error('Error getting schedule by ID:', error)
    throw error
  }
}

/**
 * Get schedules owned by a user
 * @param userId - User ID
 * @returns Array of schedule objects
 */
export function getSchedulesByUserId(userId: number) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      SELECT * FROM schedules 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
    return stmt.all(userId) || []
  } catch (error) {
    console.error('Error getting schedules by user ID:', error)
    throw error
  }
}

/**
 * Update a schedule
 * @param id - Schedule ID
 * @param updates - Object containing fields to update
 * @param userId - User ID (for authorization)
 * @returns Updated schedule object
 */
export function updateSchedule(id: number, updates: { title?: string; description?: string; visibility?: string }, userId?: number) {
  const db = getDatabase()
  
  try {
    // If userId is provided, verify ownership
    if (userId !== undefined) {
      const schedule = getScheduleById(id)
      
      if (!schedule || schedule.user_id !== userId) {
        throw new Error('Not authorized to update this schedule')
      }
    }
    
    let updateFields = []
    let params = []
    
    if (updates.title !== undefined) {
      updateFields.push('title = ?')
      params.push(updates.title)
    }
    
    if (updates.description !== undefined) {
      updateFields.push('description = ?')
      params.push(updates.description)
    }
    
    if (updates.visibility !== undefined) {
      updateFields.push('visibility = ?')
      params.push(updates.visibility)
    }
    
    if (updateFields.length === 0) {
      return getScheduleById(id)
    }
    
    updateFields.push('updated_at = datetime("now")')
    
    const updateQuery = `UPDATE schedules SET ${updateFields.join(', ')} WHERE id = ?`
    params.push(id)
    
    const stmt = db.prepare(updateQuery)
    stmt.run(...params)
    
    return getScheduleById(id)
  } catch (error) {
    console.error('Error updating schedule:', error)
    throw error
  }
}

/**
 * Delete a schedule
 * @param id - Schedule ID
 * @param userId - User ID (for authorization)
 * @returns True if successful
 */
export function deleteSchedule(id: number, userId?: number) {
  const db = getDatabase()
  
  try {
    // If userId is provided, verify ownership
    if (userId !== undefined) {
      const schedule = getScheduleById(id)
      
      if (!schedule || schedule.user_id !== userId) {
        throw new Error('Not authorized to delete this schedule')
      }
    }
    
    const stmt = db.prepare('DELETE FROM schedules WHERE id = ?')
    const info = stmt.run(id)
    
    return info.changes > 0
  } catch (error) {
    console.error('Error deleting schedule:', error)
    throw error
  }
}

/**
 * Create a new event in a schedule
 * @param scheduleId - Schedule ID
 * @param title - Event title
 * @param startTime - Start time (ISO date string)
 * @param endTime - End time (ISO date string)
 * @param description - Event description
 * @param location - Event location
 * @param isAllDay - Whether the event is all day
 * @param recurrenceRule - iCalendar RRULE string for recurring events
 * @returns Created event object
 */
export function createEvent(
  scheduleId: number,
  title: string,
  startTime: string,
  endTime: string,
  description?: string,
  location?: string,
  isAllDay: boolean = false,
  recurrenceRule?: string
) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      INSERT INTO events (
        schedule_id, title, description, location,
        start_time, end_time, is_all_day, recurrence_rule
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const info = stmt.run(
      scheduleId,
      title,
      description || null,
      location || null,
      startTime,
      endTime,
      isAllDay ? 1 : 0,
      recurrenceRule || null
    )
    
    if (info.lastInsertRowid) {
      return getEventById(info.lastInsertRowid as number)
    }
    
    return null
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

/**
 * Get an event by ID
 * @param id - Event ID
 * @returns Event object or null if not found
 */
export function getEventById(id: number) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare('SELECT * FROM events WHERE id = ?')
    return stmt.get(id) || null
  } catch (error) {
    console.error('Error getting event by ID:', error)
    throw error
  }
}

/**
 * Get events in a schedule
 * @param scheduleId - Schedule ID
 * @returns Array of event objects
 */
export function getEventsByScheduleId(scheduleId: number) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      SELECT * FROM events 
      WHERE schedule_id = ?
      ORDER BY start_time ASC
    `)
    return stmt.all(scheduleId) || []
  } catch (error) {
    console.error('Error getting events by schedule ID:', error)
    throw error
  }
}

/**
 * Get events in a date range
 * @param scheduleId - Schedule ID
 * @param startDate - Start date (ISO date string)
 * @param endDate - End date (ISO date string)
 * @returns Array of event objects
 */
export function getEventsByDateRange(scheduleId: number, startDate: string, endDate: string) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      SELECT * FROM events 
      WHERE schedule_id = ? AND
            ((start_time >= ? AND start_time <= ?) OR
             (end_time >= ? AND end_time <= ?) OR
             (start_time <= ? AND end_time >= ?))
      ORDER BY start_time ASC
    `)
    
    return stmt.all(
      scheduleId,
      startDate, endDate,
      startDate, endDate,
      startDate, startDate
    ) || []
  } catch (error) {
    console.error('Error getting events by date range:', error)
    throw error
  }
}

/**
 * Update an event
 * @param id - Event ID
 * @param updates - Object containing fields to update
 * @returns Updated event object
 */
export function updateEvent(id: number, updates: {
  title?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  recurrenceRule?: string;
}) {
  const db = getDatabase()
  
  try {
    let updateFields = []
    let params = []
    
    if (updates.title !== undefined) {
      updateFields.push('title = ?')
      params.push(updates.title)
    }
    
    if (updates.description !== undefined) {
      updateFields.push('description = ?')
      params.push(updates.description)
    }
    
    if (updates.location !== undefined) {
      updateFields.push('location = ?')
      params.push(updates.location)
    }
    
    if (updates.startTime !== undefined) {
      updateFields.push('start_time = ?')
      params.push(updates.startTime)
    }
    
    if (updates.endTime !== undefined) {
      updateFields.push('end_time = ?')
      params.push(updates.endTime)
    }
    
    if (updates.isAllDay !== undefined) {
      updateFields.push('is_all_day = ?')
      params.push(updates.isAllDay ? 1 : 0)
    }
    
    if (updates.recurrenceRule !== undefined) {
      updateFields.push('recurrence_rule = ?')
      params.push(updates.recurrenceRule)
    }
    
    if (updateFields.length === 0) {
      return getEventById(id)
    }
    
    updateFields.push('updated_at = datetime("now")')
    
    const updateQuery = `UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`
    params.push(id)
    
    const stmt = db.prepare(updateQuery)
    stmt.run(...params)
    
    return getEventById(id)
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

/**
 * Delete an event
 * @param id - Event ID
 * @returns True if successful
 */
export function deleteEvent(id: number) {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare('DELETE FROM events WHERE id = ?')
    const info = stmt.run(id)
    
    return info.changes > 0
  } catch (error) {
    console.error('Error deleting event:', error)
    throw error
  }
}
