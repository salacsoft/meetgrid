/**
 * SQLite database connection and schema setup
 * This module provides the database connection and initializes the schema
 */
import Database from 'better-sqlite3'
import { join } from 'path'
import fs from 'fs'

// Database file path - stored in the server directory
const DB_PATH = join(process.cwd(), 'server', 'data', 'mysched.sqlite')
let db: any = null

/**
 * Initialize the database connection and create tables if they don't exist
 */
export function initializeDatabase() {
  // Create data directory if it doesn't exist
  const dataDir = join(process.cwd(), 'server', 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // Create and initialize database
  db = new Database(DB_PATH)
  
  // Enable foreign keys for referential integrity
  db.pragma('foreign_keys = ON')
  
  // Create tables if they don't exist
  createTables()
  
  console.log('Database initialized successfully')
  return db
}

/**
 * Create database tables if they don't exist
 */
function createTables() {
  // Users table - for authentication and user information
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT, -- Made nullable for OAuth users
      full_name TEXT,
      google_id TEXT UNIQUE, -- Google OAuth ID
      avatar TEXT, -- Profile picture URL
      email_verified INTEGER DEFAULT 0, -- Boolean 0 or 1
      timezone TEXT DEFAULT 'UTC',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)
  
  // Add OAuth columns to existing users table if they don't exist
  try {
    db.exec(`ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE`)
  } catch (e) {
    // Column already exists, ignore
  }
  
  try {
    db.exec(`ALTER TABLE users ADD COLUMN avatar TEXT`)
  } catch (e) {
    // Column already exists, ignore
  }
  
  try {
    db.exec(`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0`)
  } catch (e) {
    // Column already exists, ignore
  }
  
  // Make password nullable for OAuth users
  // Note: SQLite doesn't support ALTER COLUMN, so we'll handle this in the application logic
  
  // Groups table - for managing schedule sharing groups
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)
  
  // Group_members table - for managing group membership
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
      joined_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(group_id, user_id)
    )
  `)
  
  // Schedules table - for storing schedule information
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      user_id INTEGER NOT NULL,
      visibility TEXT DEFAULT 'private', -- 'private', 'public', 'group'
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)
  
  // Events table - for storing events in schedules
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      start_time TEXT NOT NULL, -- ISO date format
      end_time TEXT NOT NULL, -- ISO date format
      is_all_day INTEGER DEFAULT 0, -- Boolean 0 or 1
      recurrence_rule TEXT, -- iCalendar RRULE format for recurring events
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
    )
  `)
  
  // Schedule_shares table - for tracking which schedules are shared with which groups
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedule_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      shared_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      UNIQUE(schedule_id, group_id)
    )
  `)
  
  // Notifications table - for storing user notifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL, -- 'event_change', 'group_invite', etc.
      related_id INTEGER, -- Optional id of related entity (event, group, etc.)
      read INTEGER DEFAULT 0, -- Boolean 0 or 1
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)
  
  // Reminders table - for storing event reminders
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      reminder_time TEXT NOT NULL, -- ISO date format
      delivered INTEGER DEFAULT 0, -- Boolean 0 or 1
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)
  
  // User preferences table - for storing user-specific preferences
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      preference_key TEXT NOT NULL,
      preference_value TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, preference_key)
    )
  `)

  // User associations table - for connecting users with each other
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_associations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      associated_user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
      relationship_type TEXT DEFAULT 'colleague', -- 'colleague', 'friend', 'family', 'client', 'manager', 'team_member'
      notes TEXT, -- Optional notes about the relationship
      requested_by INTEGER NOT NULL, -- ID of user who initiated the association
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (associated_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, associated_user_id),
      CHECK (user_id != associated_user_id) -- Users can't associate with themselves
    )
  `)
}

/**
 * Get the database instance (initializing it if necessary)
 */
export function getDatabase() {
  if (!db) {
    return initializeDatabase()
  }
  return db
}

/**
 * Close the database connection
 */
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
    console.log('Database connection closed')
  }
}
