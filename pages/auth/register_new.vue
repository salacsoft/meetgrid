<template>
  <div class="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-custom-lg p-8 border border-cream-200">
      <!-- Header with MeetGrid Branding -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-primary-800 rounded-full flex items-center justify-center">
          <Icon name="material-symbols:calendar-today" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-primary-800 mb-2">Join MeetGrid</h1>
        <p class="text-primary-600">Start organizing your schedule professionally</p>
      </div>

      <!-- Error Messages -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {{ error }}
      </div>

      <div v-if="route.query.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {{ getErrorMessage(route.query.error) }}
      </div>

      <!-- Primary Google OAuth Registration -->
      <div class="mb-6">
        <button
          @click="handleGoogleSignup"
          class="oauth-button"
          :disabled="isLoading"
        >
          <Icon name="logos:google-icon" class="w-5 h-5" />
          <span>Sign up with Google</span>
        </button>
        <p class="text-xs text-primary-500 mt-2 text-center">
          Quick setup with automatic Google Calendar sync
        </p>
      </div>

      <!-- Divider -->
      <div class="divider">
        <span class="divider-text">or</span>
      </div>

      <!-- Traditional Registration Form -->
      <form @submit.prevent="handleEmailRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="fullName" class="form-label">Full Name</label>
            <input
              id="fullName"
              v-model="form.fullName"
              type="text"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            required
          />
          <p class="text-xs text-primary-500 mt-1">
            Password must be at least 8 characters long
          </p>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="form-input"
            required
          />
          <p v-if="passwordsDoNotMatch" class="text-xs text-red-500 mt-1">
            Passwords do not match
          </p>
        </div>

        <div class="flex items-center mb-6">
          <input
            id="agreeTerms"
            v-model="form.agreeTerms"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500 focus:ring-2"
            required
          />
          <label for="agreeTerms" class="ml-2 text-sm text-primary-700">
            I agree to the 
            <a href="#" class="text-primary-600 hover:text-primary-800 underline">Terms of Service</a>
            and 
            <a href="#" class="text-primary-600 hover:text-primary-800 underline">Privacy Policy</a>
          </label>
        </div>

        <button
          type="submit"
          class="btn-primary w-full"
          :disabled="isLoading || !isFormValid"
        >
          <div v-if="isLoading" class="loading-spinner mr-2"></div>
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <!-- Login Link -->
      <div class="text-center mt-6">
        <p class="text-primary-600">
          Already have an account?
          <NuxtLink 
            to="/auth/login" 
            class="text-primary-700 hover:text-primary-800 font-medium underline"
          >
            Sign in
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $auth } = useNuxtApp()
const router = useRouter()
const route = useRoute()

// Form state
const isLoading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// Computed properties
const passwordsDoNotMatch = computed(() => {
  return form.password && form.confirmPassword && form.password !== form.confirmPassword
})

const isFormValid = computed(() => {
  return form.username && 
         form.fullName && 
         form.email && 
         form.password && 
         form.confirmPassword && 
         form.password === form.confirmPassword && 
         form.agreeTerms &&
         form.password.length >= 8
})

// Error message handler
const getErrorMessage = (errorCode) => {
  const messages = {
    'access_denied': 'You cancelled the Google sign-in process.',
    'server_error': 'There was a server error. Please try again.',
    'temporarily_unavailable': 'Google sign-in is temporarily unavailable. Please try again later.',
    'invalid_request': 'Invalid sign-in request. Please try again.',
    'unauthorized_client': 'Google sign-in is not properly configured.',
    'unsupported_response_type': 'Google sign-in configuration error.',
    'invalid_scope': 'Invalid permissions requested.',
    'login_required': 'Please sign in to continue.',
    'interaction_required': 'Additional verification required.',
    'consent_required': 'Please consent to the permissions.',
    'invalid_grant': 'Invalid authorization. Please try signing in again.',
    'invalid_client': 'Google sign-in client error.'
  }
  return messages[errorCode] || 'An error occurred during sign-in. Please try again.'
}

// Google OAuth signup
const handleGoogleSignup = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    // Use the auth composable for Google OAuth
    const { loginWithGoogle } = useAuth()
    await loginWithGoogle()
    
    // Redirect will be handled by the OAuth flow
  } catch (err) {
    console.error('Google signup error:', err)
    error.value = err.message || 'Failed to sign up with Google. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Email registration
const handleEmailRegister = async () => {
  try {
    isLoading.value = true
    error.value = ''

    if (!isFormValid.value) {
      error.value = 'Please fill in all required fields correctly.'
      return
    }

    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        username: form.username,
        fullName: form.fullName,
        email: form.email,
        password: form.password
      }
    })

    if (response.success) {
      // Auto-login after successful registration
      const loginResponse = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          usernameOrEmail: form.username,
          password: form.password
        }
      })

      if (loginResponse.success) {
        // Store token and redirect
        const token = useCookie('auth-token')
        token.value = loginResponse.token
        
        // Update auth state
        if ($auth && $auth.setUser) {
          $auth.setUser(loginResponse.user)
        }

        await router.push('/')
      } else {
        error.value = 'Registration successful! Please sign in.'
        await router.push('/auth/login')
      }
    } else {
      error.value = response.message || 'Registration failed. Please try again.'
    }
  } catch (err) {
    console.error('Registration error:', err)
    if (err.data?.message) {
      error.value = err.data.message
    } else {
      error.value = 'Registration failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

// Meta
definePageMeta({
  layout: false,
  middleware: 'guest'
})

// Head
useHead({
  title: 'Join MeetGrid - Professional Calendar Scheduling',
  meta: [
    { name: 'description', content: 'Create your MeetGrid account and start organizing your schedule professionally with Google Calendar integration.' }
  ]
})
</script>
