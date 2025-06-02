/**
 * Notifications composable
 * Provides a simple toast notification system
 */
import { ref } from 'vue'

// Create a reactive array of notifications with a unique ID generator
const notifications = ref([])
let nextId = 1

export function useNotifications() {
  /**
   * Add a notification
   * @param {Object} notification - Notification object
   * @param {string} notification.type - Type of notification ('success', 'error', 'info', 'warning')
   * @param {string} notification.title - Title of the notification
   * @param {string} notification.message - Message of the notification (optional)
   * @param {number} notification.timeout - Time in ms before auto-dismissing (default: 5000, 0 for no auto-dismiss)
   * @returns {number} The ID of the added notification
   */
  function addNotification({ type = 'info', title, message = '', timeout = 5000 }) {
    const id = nextId++
    const notification = { id, type, title, message }
    
    notifications.value.push(notification)
    
    // Auto-dismiss after timeout (if timeout > 0)
    if (timeout > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, timeout)
    }
    
    return id
  }
  
  /**
   * Remove a notification by ID
   * @param {number} id - ID of the notification to remove
   */
  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  /**
   * Clear all notifications
   */
  function clearNotifications() {
    notifications.value = []
  }
  
  /**
   * Shorthand for success notification
   */
  function success(title, message = '', timeout = 5000) {
    return addNotification({ type: 'success', title, message, timeout })
  }
  
  /**
   * Shorthand for error notification
   */
  function error(title, message = '', timeout = 8000) {
    return addNotification({ type: 'error', title, message, timeout })
  }
  
  /**
   * Shorthand for info notification
   */
  function info(title, message = '', timeout = 5000) {
    return addNotification({ type: 'info', title, message, timeout })
  }
  
  /**
   * Shorthand for warning notification
   */
  function warning(title, message = '', timeout = 7000) {
    return addNotification({ type: 'warning', title, message, timeout })
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    info,
    warning
  }
}
