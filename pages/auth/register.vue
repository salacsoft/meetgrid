<template>
  <div
    class="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center p-4"
  >
    <div
      class="max-w-md w-full bg-white rounded-2xl shadow-custom-lg p-8 border border-cream-200"
    >
      <!-- Header with MeetGrid Branding -->
      <div class="text-center mb-8">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-primary-800 rounded-full flex items-center justify-center"
        >
          <Icon
            name="material-symbols:calendar-today"
            class="w-8 h-8 text-white"
          />
        </div>
        <h1 class="text-3xl font-bold text-primary-800 mb-2">Join MeetGrid</h1>
        <p class="text-primary-600">
          Start organizing your schedule professionally
        </p>
      </div>

      <!-- Error Messages -->
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
      >
        {{ error }}
      </div>

      <div
        v-if="route.query.error"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
      >
        {{ getErrorMessage(route.query.error) }}
      </div>

      <!-- Traditional Registration Form -->
      <form @submit.prevent="handleEmailRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              for="username"
              class="block text-primary-700 font-medium mb-2"
              >Username</label
            >
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all duration-200"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label
              for="fullName"
              class="block text-primary-700 font-medium mb-2"
              >Full Name</label
            >
            <input
              id="fullName"
              v-model="form.fullName"
              type="text"
              class="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all duration-200"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div>
          <label for="email" class="block text-primary-700 font-medium mb-2"
            >Email</label
          >
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all duration-200"
            placeholder="Enter your email address"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-primary-700 font-medium mb-2"
            >Password</label
          >
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all duration-200"
            placeholder="Enter your password"
            required
          />
          <p class="text-xs text-primary-500 mt-1">
            Password must be at least 8 characters long
          </p>
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-primary-700 font-medium mb-2"
            >Confirm Password</label
          >
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all duration-200"
            placeholder="Confirm your password"
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
            <a
              href="#"
              class="text-primary-600 hover:text-primary-800 underline"
              >Terms of Service</a
            >
            and
            <a
              href="#"
              class="text-primary-600 hover:text-primary-800 underline"
              >Privacy Policy</a
            >
          </label>
        </div>

        <button
          type="submit"
          class="w-full bg-primary-600 text-cream-100 py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-200 font-semibold"
          :disabled="isLoading || !isFormValid"
        >
          <Icon
            v-if="isLoading"
            name="eos-icons:loading"
            class="w-5 h-5 animate-spin mr-2"
          />
          {{ isLoading ? "Creating Account..." : "Create Account" }}
        </button>
      </form>

      <!-- Divider -->
      <div class="flex items-center mb-6 mt-6">
        <div class="flex-1 border-t border-primary-200"></div>
        <span class="px-4 text-primary-500 text-sm">or</span>
        <div class="flex-1 border-t border-primary-200"></div>
      </div>

      <!-- Google OAuth Option -->
      <div class="mb-6">
        <button
          @click="handleGoogleSignup"
          class="w-full bg-white border-2 border-primary-200 text-primary-700 py-3 px-4 rounded-lg hover:bg-primary-50 hover:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all duration-200 flex items-center justify-center space-x-3 font-semibold"
          :disabled="isLoading"
        >
          <Icon name="logos:google-icon" class="w-5 h-5" />
          <span>Sign up with Google</span>
        </button>
        <p class="text-xs text-primary-500 mt-2 text-center">
          Quick setup with automatic Google Calendar sync (Coming Soon)
        </p>
      </div>

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
const { register, isLoading, error } = useAuth();
const router = useRouter();
const route = useRoute();

// Form state
const form = reactive({
  username: "",
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeTerms: false,
});

// Computed properties
const passwordsDoNotMatch = computed(() => {
  return (
    form.password &&
    form.confirmPassword &&
    form.password !== form.confirmPassword
  );
});

const isFormValid = computed(() => {
  return (
    form.username &&
    form.fullName &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    form.password === form.confirmPassword &&
    form.agreeTerms &&
    form.password.length >= 8
  );
});

// Error message handler
const getErrorMessage = (errorCode) => {
  const messages = {
    access_denied: "You cancelled the Google sign-in process.",
    server_error: "There was a server error. Please try again.",
    temporarily_unavailable:
      "Google sign-in is temporarily unavailable. Please try again later.",
    invalid_request: "Invalid sign-in request. Please try again.",
    unauthorized_client: "Google sign-in is not properly configured.",
    unsupported_response_type: "Google sign-in configuration error.",
    invalid_scope: "Invalid permissions requested.",
    login_required: "Please sign in to continue.",
    interaction_required: "Additional verification required.",
    consent_required: "Please consent to the permissions.",
    invalid_grant: "Invalid authorization. Please try signing in again.",
    invalid_client: "Google sign-in client error.",
  };
  return (
    messages[errorCode] || "An error occurred during sign-in. Please try again."
  );
};

// Google OAuth signup (temporarily disabled)
const handleGoogleSignup = async () => {
  // Temporarily show message that Google OAuth is coming soon
  error.value =
    "Google OAuth integration coming soon! Please use the form above to register.";
};

// Email registration
const handleEmailRegister = async () => {
  if (!isFormValid.value) {
    error.value = "Please fill in all required fields correctly.";
    return;
  }

  const success = await register(
    form.username,
    form.email,
    form.password,
    form.fullName
  );

  if (success) {
    // Navigate to dashboard on success
    router.push("/dashboard");
  }
};

// Meta
definePageMeta({
  layout: false,
  middleware: "guest",
});

// Head
useHead({
  title: "Join MeetGrid - Professional Calendar Scheduling",
  meta: [
    {
      name: "description",
      content:
        "Create your MeetGrid account and start organizing your schedule professionally with Google Calendar integration.",
    },
  ],
});
</script>
