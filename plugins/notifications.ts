/**
 * Notifications plugin
 * Makes notification functions available globally
 */
import { defineNuxtPlugin } from '#app'
import { useNotifications } from '~/composables/useNotifications'

export default defineNuxtPlugin(() => {
  // Get notifications instance
  const notifications = useNotifications()
  
  // Provide to the app
  return {
    provide: {
      notify: {
        success: notifications.success,
        error: notifications.error,
        info: notifications.info,
        warning: notifications.warning,
      }
    }
  }
})
