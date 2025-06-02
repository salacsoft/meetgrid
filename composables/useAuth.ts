/**
 * Authentication composable
 * Handles authentication state and operations
 */
import { ref, reactive, computed } from 'vue'

// Global state - shared across all instances
const globalAuthState = {
  user: ref<any>(null),
  token: ref<string>(''),
  isLoading: ref<boolean>(false),
  error: ref<string | null>(null)
}

export function useAuth() {
  // Use the global state instead of creating new refs
  const { user, token, isLoading, error } = globalAuthState
  
  // Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value)
  
  // Initialize auth state from localStorage or cookies (on client side only)
  const initAuth = async () => {
    if (process.client) {
      // Try to get token from cookie first (for OAuth), then localStorage
      const cookieToken = useCookie('auth-token', { 
        default: () => null,
        httpOnly: false,
        secure: true,
        sameSite: 'strict'
      })
      const storedToken = cookieToken.value || localStorage.getItem('auth-token')
      
      if (storedToken) {
        token.value = storedToken
        
        // Fetch current user with the token
        try {
          const { data } = await useFetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token.value}`
            }
          })
          
          if (data.value && (data.value as any).success && (data.value as any).user) {
            user.value = (data.value as any).user
            
            // Store in localStorage if it came from cookie
            if (cookieToken.value && !localStorage.getItem('auth-token')) {
              localStorage.setItem('auth-token', token.value)
            }
          } else {
            // Invalid token, clear it
            logout()
          }
        } catch (err) {
          console.error('Error fetching user data:', err)
          // Don't call logout here to avoid infinite loops
          user.value = null
          token.value = ''
          if (process.client) {
            localStorage.removeItem('auth-token')
            cookieToken.value = null
          }
        }
      }
    }
  }
  
  // Login user
  const login = async (usernameOrEmail: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: apiError } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: { usernameOrEmail, password }
      })
      
      if (apiError.value) {
        error.value = apiError.value.data?.statusMessage || 'Login failed'
        return false
      }
      
      if (data.value && (data.value as any).token) {
        // Store token and user
        token.value = (data.value as any).token
        user.value = (data.value as any).user
        
        // Save to localStorage (client side only)
        if (process.client) {
          localStorage.setItem('auth-token', token.value)
        }
        
        return true
      } else {
        error.value = 'Invalid response from server'
        return false
      }
    } catch (err) {
      console.error('Login error:', err)
      error.value = 'An error occurred during login'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Register new user
  const register = async (username: string, email: string, password: string, fullName: string = '', timezone: string = 'UTC') => {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: apiError } = await useFetch('/api/auth/register', {
        method: 'POST',
        body: { username, email, password, fullName, timezone }
      })
      
      if (apiError.value) {
        error.value = apiError.value.data?.statusMessage || 'Registration failed'
        return false
      }
      
      if (data.value && (data.value as any).token) {
        // Store token and user
        token.value = (data.value as any).token
        user.value = (data.value as any).user
        
        // Save to localStorage (client side only)
        if (process.client) {
          localStorage.setItem('auth-token', token.value)
        }
        
        return true
      } else {
        error.value = 'Invalid response from server'
        return false
      }
    } catch (err) {
      console.error('Registration error:', err)
      error.value = 'An error occurred during registration'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Logout user
  const logout = async () => {
    try {
      // Call logout API (though JWT is stateless, this is for future extensibility)
      await useFetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear auth state regardless of API success/failure
      user.value = null
      token.value = ''
      
      // Remove from localStorage and cookies
      if (process.client) {
        localStorage.removeItem('auth-token')
        const cookieToken = useCookie('auth-token', { 
          default: () => null,
          httpOnly: false,
          secure: true,
          sameSite: 'strict'
        })
        cookieToken.value = null
      }
      
      // Navigate to login page
      const router = useRouter()
      router.push('/auth/login')
    }
  }
  
  // Google OAuth login
  const loginWithGoogle = () => {
    if (process.client) {
      // Redirect to Google OAuth endpoint
      window.location.href = '/api/auth/google'
    }
  }
  
  // Get authorization header for API requests
  const getAuthHeader = () => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }
  
  // Get current user
  const getUser = () => user.value
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    getAuthHeader,
    getUser,
    initAuth
  }
}
