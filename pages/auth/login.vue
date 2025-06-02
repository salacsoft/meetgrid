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
        <h1 class="text-3xl font-bold text-primary-800 mb-2">
          Welcome to MeetGrid
        </h1>
        <p class="text-primary-600">
          Professional calendar scheduling made simple
        </p>
      </div>

      <!-- Error/Success Messages -->
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

      <div
        v-if="route.query.auth === 'success'"
        class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
      >
        Successfully authenticated with Google! Redirecting...
      </div>

      <!-- Traditional Email/Password Login -->
      <form @submit.prevent="handleEmailLogin" class="space-y-4">
        <div>
          <label
            for="usernameOrEmail"
            class="block text-primary-700 font-medium mb-2"
          >
            Username or Email
          </label>
          <input
            id="usernameOrEmail"
            v-model="form.usernameOrEmail"
            type="text"
            class="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all duration-200"
            placeholder="Enter your username or email"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-primary-700 font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all duration-200"
            placeholder="Enter your password"
            required
          />
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="form.rememberMe"
              class="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <span class="ml-2 text-primary-600 text-sm">Remember me</span>
          </label>

          <NuxtLink
            to="/auth/forgot-password"
            class="text-primary-600 hover:text-primary-800 text-sm font-medium hover:underline"
          >
            Forgot password?
          </NuxtLink>
        </div>

        <button
          type="submit"
          class="w-full border bg-primary-600 text-cream-100 py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-200 font-semibold"
          :disabled="isLoading"
        >
          <Icon
            v-if="isLoading"
            name="eos-icons:loading"
            class="w-5 h-5 animate-spin mr-2"
          />
          {{ isLoading ? "Signing in..." : "Sign In" }}
        </button>
      </form>

      <!-- Divider -->
      <div class="flex items-center mb-6 mt-6">
        <div class="flex-1 border-t border-primary-200"></div>
        <span class="px-4 text-primary-500 text-sm">or</span>
        <div class="flex-1 border-t border-primary-200"></div>
      </div>

      <!-- Google OAuth Login -->
      <div class="mb-6">
        <button
          @click="handleGoogleLogin"
          class="w-full bg-white border-2 border-primary-200 text-primary-700 py-3 px-4 rounded-lg hover:bg-primary-50 hover:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all duration-200 flex items-center justify-center space-x-3 font-semibold"
          :disabled="isLoading"
        >
          <Icon name="logos:google-icon" class="w-5 h-5" />
          <span>Continue with Google</span>
        </button>
        <p class="text-xs text-primary-500 mt-2 text-center">
          Google Calendar integration (Coming Soon)
        </p>
      </div>

      <!-- Register Link -->
      <div class="mt-8 text-center">
        <p class="text-primary-600">
          New to MeetGrid?
          <NuxtLink
            to="/auth/register"
            class="text-primary-800 font-semibold hover:text-primary-900 hover:underline ml-1"
          >
            Create your account
          </NuxtLink>
        </p>
      </div>

      <!-- Optional: Facebook OAuth (Secondary) -->
      <div class="mt-4 text-center">
        <button
          @click="handleFacebookLogin"
          class="text-primary-500 hover:text-primary-700 text-sm font-medium hover:underline"
          disabled
        >
          Continue with Facebook (Coming Soon)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useRouter, useRoute } from "vue-router";

// Define route meta for title
definePageMeta({
  title: "Sign In - MySched",
  layout: false, // Use a clean layout for auth pages
});

const { login, loginWithGoogle, isLoading, error } = useAuth();
const router = useRouter();
const route = useRoute();

// Form state
const form = reactive({
  usernameOrEmail: "",
  password: "",
  rememberMe: false,
});

// Handle traditional email/password login
const handleEmailLogin = async () => {
  if (await login(form.usernameOrEmail, form.password)) {
    // Navigate to dashboard on success
    router.push("/dashboard");
  }
};

// Handle Google OAuth login (temporarily disabled)
const handleGoogleLogin = () => {
  // TODO: Enable when Google OAuth credentials are configured
  error.value =
    "Google OAuth integration coming soon! Please use your email and password to sign in.";
  // loginWithGoogle();
};

// Handle Facebook OAuth login (placeholder)
const handleFacebookLogin = () => {
  // TODO: Implement Facebook OAuth when needed
  console.log("Facebook OAuth not yet implemented");
};

// Get user-friendly error messages
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    oauth_denied: "Google authentication was cancelled. Please try again.",
    missing_code: "Authentication failed. Please try again.",
    oauth_failed:
      "Authentication failed. Please try again or use email/password.",
    user_creation_failed: "Failed to create your account. Please try again.",
  };

  return errorMessages[errorCode] || "An error occurred during authentication.";
};

// Handle successful OAuth redirect
onMounted(() => {
  if (route.query.auth === "success") {
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  }
});
</script>
