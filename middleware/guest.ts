/**
 * Guest middleware
 * Redirects authenticated users away from guest-only pages
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware in server-side rendering
  if (process.server) return
  
  const { isAuthenticated } = useAuth()
  
  // If user is authenticated, redirect to main app
  if (isAuthenticated.value) {
    return navigateTo('/')
  }
})
