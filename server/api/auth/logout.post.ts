/**
 * User logout API endpoint
 * POST /api/auth/logout
 */
export default defineEventHandler(async (event) => {
  // Only handle POST requests
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  try {
    // For JWT-based auth, logout is handled client-side by removing the token
    // But we can still return a success response for consistency
    
    // In the future, if we implement token blacklisting or refresh tokens,
    // we would handle that logic here
    
    return {
      success: true,
      message: 'Logged out successfully'
    }
  } catch (error) {
    console.error('Logout error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during logout'
    })
  }
})
