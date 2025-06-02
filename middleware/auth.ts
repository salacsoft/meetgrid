/**
 * Authentication middleware
 * Redirects users based on their authentication status
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware in server-side rendering
  if (process.server) return
  
  const { isAuthenticated } = useAuth()
  
  // Define routes that require authentication
  const authRequiredRoutes = ['/schedule', '/groups', '/dashboard', '/profile', '/associations']
  
  // Define routes that should be redirected when already authenticated
  const guestOnlyRoutes = ['/auth/login', '/auth/register']
  
  // Check if the route requires authentication
  const requiresAuth = authRequiredRoutes.some(route => to.path.startsWith(route))
  
  // Check if the route is for guests only
  const isGuestOnly = guestOnlyRoutes.includes(to.path)
  
  // Redirect if not authenticated and trying to access protected route
  if (requiresAuth && !isAuthenticated.value) {
    return navigateTo('/auth/login')
  }
  
  // Redirect if authenticated and trying to access guest-only route
  if (isGuestOnly && isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})
