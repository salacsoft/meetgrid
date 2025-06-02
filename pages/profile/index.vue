<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Account Settings</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Sidebar / Navigation -->
      <div class="card">
        <div class="flex items-center mb-6">
          <div
            class="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center text-coffee-700 text-2xl font-bold mr-4"
          >
            {{ userInitials }}
          </div>
          <div>
            <h2 class="text-xl font-semibold">
              {{ user?.full_name || user?.username }}
            </h2>
            <p class="text-espresso-600">{{ user?.email }}</p>
          </div>
        </div>

        <nav>
          <button
            @click="activeTab = 'profile'"
            class="w-full text-left py-2 px-3 rounded mb-1"
            :class="
              activeTab === 'profile'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            "
          >
            Profile Information
          </button>
          <button
            @click="activeTab = 'password'"
            class="w-full text-left py-2 px-3 rounded mb-1"
            :class="
              activeTab === 'password'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            "
          >
            Change Password
          </button>
          <button
            @click="activeTab = 'preferences'"
            class="w-full text-left py-2 px-3 rounded mb-1"
            :class="
              activeTab === 'preferences'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            "
          >
            Preferences
          </button>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="card md:col-span-2">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'">
          <h2 class="text-xl font-bold mb-4">Profile Information</h2>

          <div v-if="updateSuccess" class="alert alert-success">
            Profile updated successfully!
          </div>

          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <input
                id="username"
                v-model="profileForm.username"
                type="text"
                class="form-input"
                disabled
              />
              <p class="text-xs text-gray-500 mt-1">
                Username cannot be changed
              </p>
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email Address</label>
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="fullName" class="form-label">Full Name</label>
              <input
                id="fullName"
                v-model="profileForm.fullName"
                type="text"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="timezone" class="form-label">Timezone</label>
              <select
                id="timezone"
                v-model="profileForm.timezone"
                class="form-input"
              >
                <option v-for="tz in timezones" :key="tz" :value="tz">
                  {{ tz }}
                </option>
              </select>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Saving..." : "Save Changes" }}
            </button>
          </form>
        </div>

        <!-- Password Tab -->
        <div v-else-if="activeTab === 'password'">
          <h2 class="text-xl font-bold mb-4">Change Password</h2>

          <div v-if="passwordError" class="alert alert-error">
            {{ passwordError }}
          </div>

          <div v-if="passwordSuccess" class="alert alert-success">
            Password updated successfully!
          </div>

          <form @submit.prevent="updatePassword">
            <div class="form-group">
              <label for="currentPassword" class="form-label"
                >Current Password</label
              >
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="newPassword" class="form-label">New Password</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                class="form-input"
                required
                minlength="8"
              />
              <p class="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <div class="form-group">
              <label for="confirmPassword" class="form-label"
                >Confirm New Password</label
              >
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                class="form-input"
                required
              />
              <p v-if="passwordsDoNotMatch" class="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting || passwordsDoNotMatch"
            >
              {{ isSubmitting ? "Updating..." : "Update Password" }}
            </button>
          </form>
        </div>

        <!-- Preferences Tab -->
        <div v-else-if="activeTab === 'preferences'">
          <h2 class="text-xl font-bold mb-4">Preferences</h2>

          <div v-if="preferencesSuccess" class="alert alert-success">
            Preferences updated successfully!
          </div>

          <form @submit.prevent="updatePreferences">
            <div class="form-group">
              <label class="form-label">Default Calendar View</label>
              <div class="flex gap-3 mt-1">
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="preferencesForm.defaultCalendarView"
                    value="month"
                    class="mr-2"
                  />
                  Month
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="preferencesForm.defaultCalendarView"
                    value="week"
                    class="mr-2"
                  />
                  Week
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="preferencesForm.defaultCalendarView"
                    value="day"
                    class="mr-2"
                  />
                  Day
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notifications</label>
              <div class="mt-1">
                <label class="flex items-center mb-2">
                  <input
                    type="checkbox"
                    v-model="preferencesForm.emailNotifications"
                    class="mr-2"
                  />
                  Email notifications for schedule changes
                </label>
                <label class="flex items-center mb-2">
                  <input
                    type="checkbox"
                    v-model="preferencesForm.reminderNotifications"
                    class="mr-2"
                  />
                  Email reminders for upcoming events
                </label>
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Saving..." : "Save Preferences" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useNotifications } from "~/composables/useNotifications";

// Define route meta for title and middleware
definePageMeta({
  title: "Account Settings",
  middleware: ["auth"],
});

const { getUser, getAuthHeader } = useAuth();
const { success, error: showError } = useNotifications();

// State
const user = ref(getUser());
const activeTab = ref("profile");
const isSubmitting = ref(false);
const updateSuccess = ref(false);
const passwordError = ref("");
const passwordSuccess = ref(false);
const preferencesSuccess = ref(false);

// Form states
const profileForm = reactive({
  username: user.value?.username || "",
  email: user.value?.email || "",
  fullName: user.value?.full_name || "",
  timezone: user.value?.timezone || "UTC",
});

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const preferencesForm = reactive({
  defaultCalendarView: "month",
  emailNotifications: true,
  reminderNotifications: true,
});

// Computed properties
const userInitials = computed(() => {
  if (user.value?.full_name) {
    return user.value.full_name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  return user.value?.username.substring(0, 2).toUpperCase() || "U";
});

const passwordsDoNotMatch = computed(
  () =>
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    passwordForm.newPassword !== passwordForm.confirmPassword
);

// Methods
const updateProfile = async () => {
  isSubmitting.value = true;
  updateSuccess.value = false;

  try {
    const { data, error } = await useFetch("/api/user/profile", {
      method: "PUT",
      headers: getAuthHeader(),
      body: {
        email: profileForm.email,
        fullName: profileForm.fullName,
        timezone: profileForm.timezone,
      },
    });

    if (error.value) {
      console.error("Error updating profile:", error.value);
      return;
    }

    if (data.value) {
      // Update local user data
      user.value = data.value;
      updateSuccess.value = true;

      // Show notification
      success("Profile Updated", "Your profile has been successfully updated.");

      // Hide success message after 3 seconds
      setTimeout(() => {
        updateSuccess.value = false;
      }, 3000);
    }
  } catch (err) {
    console.error("Error updating profile:", err);
  } finally {
    isSubmitting.value = false;
  }
};

const updatePassword = async () => {
  if (passwordsDoNotMatch.value) return;

  isSubmitting.value = true;
  passwordError.value = "";
  passwordSuccess.value = false;

  try {
    const { data, error } = await useFetch("/api/user/password", {
      method: "PUT",
      headers: getAuthHeader(),
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
    });

    if (error.value) {
      const errorMessage =
        error.value.data?.message || "Failed to update password";
      passwordError.value = errorMessage;
      showError("Password Update Failed", errorMessage);
      return;
    }

    if (data.value && data.value.success) {
      passwordSuccess.value = true;

      // Show notification
      success(
        "Password Updated",
        "Your password has been successfully changed."
      );

      // Reset form
      passwordForm.currentPassword = "";
      passwordForm.newPassword = "";
      passwordForm.confirmPassword = "";

      // Hide success message after 3 seconds
      setTimeout(() => {
        passwordSuccess.value = false;
      }, 3000);
    }
  } catch (err) {
    console.error("Error updating password:", err);
    passwordError.value = "An unexpected error occurred";
  } finally {
    isSubmitting.value = false;
  }
};

const updatePreferences = async () => {
  isSubmitting.value = true;
  preferencesSuccess.value = false;

  try {
    const { data, error } = await useFetch("/api/user/preferences", {
      method: "PUT",
      headers: getAuthHeader(),
      body: preferencesForm,
    });

    if (error.value) {
      console.error("Error updating preferences:", error.value);
      return;
    }

    if (data.value) {
      preferencesSuccess.value = true;

      // Show notification
      success(
        "Preferences Updated",
        "Your preferences have been successfully saved."
      );

      // Hide success message after 3 seconds
      setTimeout(() => {
        preferencesSuccess.value = false;
      }, 3000);
    }
  } catch (err) {
    console.error("Error updating preferences:", err);
  } finally {
    isSubmitting.value = false;
  }
};

// Common timezones list (simplified version)
const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

// Fetch user data and preferences
onMounted(async () => {
  // Fetch user preferences from API
  try {
    const { data, error } = await useFetch("/api/user/preferences", {
      headers: getAuthHeader(),
    });

    if (error.value) {
      console.error("Error loading preferences:", error.value);
      return;
    }

    if (data.value?.preferences) {
      const prefs = data.value.preferences;

      // Update preference form with saved values
      preferencesForm.defaultCalendarView =
        prefs.defaultCalendarView || "month";
      preferencesForm.emailNotifications =
        typeof prefs.emailNotifications !== "undefined"
          ? prefs.emailNotifications
          : true;
      preferencesForm.reminderNotifications =
        typeof prefs.reminderNotifications !== "undefined"
          ? prefs.reminderNotifications
          : true;
    }
  } catch (err) {
    console.error("Error fetching user preferences:", err);
  }
});
</script>
