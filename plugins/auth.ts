/**
 * Authentication plugin
 * Provides authentication state globally and initializes auth
 */
export default defineNuxtPlugin(async () => {
  // Create auth store from composable
  const auth = useAuth()
  
  // Initialize auth state on client side
  if (process.client) {
    await auth.initAuth()
  }
  
  // Add auth helpers to Nuxt instance
  return {
    provide: {
      auth
    }
  }
})
