/**
 * Database initialization plugin
 * Ensures the database is initialized when the server starts
 */
import { initializeDatabase } from '~/server/db'

export default defineNuxtPlugin(() => {
  // Initialize the database when the server starts
  initializeDatabase()
  console.log('Database initialized successfully')
})
