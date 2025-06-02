<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">My Schedules</h1>

    <div class="mb-6">
      <button
        @click="isCreatingSchedule = true"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create New Schedule
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <p class="text-lg text-gray-600">Loading schedules...</p>
    </div>

    <div
      v-else-if="schedules.length === 0"
      class="text-center py-8 border rounded-lg bg-gray-50"
    >
      <p class="text-lg text-gray-600 mb-4">
        You don't have any schedules yet.
      </p>
      <button
        @click="isCreatingSchedule = true"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Your First Schedule
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="schedule in schedules"
        :key="schedule.id"
        class="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
        @click="selectSchedule(schedule)"
      >
        <h3 class="text-xl font-bold mb-2">{{ schedule.title }}</h3>
        <p class="text-gray-600 mb-4">
          {{ schedule.description || "No description" }}
        </p>
        <div class="flex justify-between items-center text-sm text-gray-500">
          <span>{{ formatVisibility(schedule.visibility) }}</span>
          <span>{{ formatDate(schedule.updated_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Create Schedule Dialog -->
    <div
      v-if="isCreatingSchedule"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Create New Schedule</h2>

        <form @submit.prevent="createNewSchedule">
          <div class="mb-4">
            <label for="title" class="block text-gray-700 mb-1">Title</label>
            <input
              id="title"
              v-model="newSchedule.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div class="mb-4">
            <label for="description" class="block text-gray-700 mb-1"
              >Description (optional)</label
            >
            <textarea
              id="description"
              v-model="newSchedule.description"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              rows="3"
            ></textarea>
          </div>

          <div class="mb-6">
            <label for="visibility" class="block text-gray-700 mb-1"
              >Visibility</label
            >
            <select
              id="visibility"
              v-model="newSchedule.visibility"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="private">Private (Only you)</option>
              <option value="public">Public (Anyone with link)</option>
              <option value="group">Groups (Selected groups only)</option>
            </select>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="isCreatingSchedule = false"
              class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Creating..." : "Create" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Schedule Dialog -->
    <div
      v-if="selectedSchedule"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">{{ selectedSchedule.title }}</h2>
          <button
            @click="selectedSchedule = null"
            class="text-gray-500 hover:text-gray-700"
          >
            <span class="text-2xl">&times;</span>
          </button>
        </div>

        <p class="text-gray-600 mb-6">
          {{ selectedSchedule.description || "No description" }}
        </p>

        <!-- Placeholder for calendar component -->
        <div
          class="bg-gray-100 p-4 rounded-lg mb-6 min-h-[400px] flex items-center justify-center"
        >
          <p class="text-gray-500">
            Calendar component will be implemented here
          </p>
        </div>

        <div class="flex justify-between">
          <button
            @click="editSchedule(selectedSchedule)"
            class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Edit Schedule
          </button>

          <button
            @click="deleteSchedulePrompt(selectedSchedule)"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Schedule
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="scheduleToDelete"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Confirm Delete</h2>

        <p class="mb-6">
          Are you sure you want to delete the schedule "{{
            scheduleToDelete.title
          }}"? This action cannot be undone.
        </p>

        <div class="flex justify-end space-x-3">
          <button
            @click="scheduleToDelete = null"
            class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            @click="confirmDeleteSchedule"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            :disabled="isDeletingSchedule"
          >
            {{ isDeletingSchedule ? "Deleting..." : "Delete" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useNotifications } from "~/composables/useNotifications";

// Define route meta for title and middleware
definePageMeta({
  title: "My Schedules",
  middleware: ["auth"],
});

const { getAuthHeader } = useAuth();
const { success, error: showError } = useNotifications();

// State
const schedules = ref([]);
const isLoading = ref(true);
const isCreatingSchedule = ref(false);
const isSubmitting = ref(false);
const selectedSchedule = ref(null);
const scheduleToDelete = ref(null);
const isDeletingSchedule = ref(false);

const newSchedule = reactive({
  title: "",
  description: "",
  visibility: "private",
});

// Fetch user schedules
async function fetchSchedules() {
  isLoading.value = true;

  try {
    const { data } = await useFetch("/api/schedules", {
      headers: getAuthHeader(),
    });

    if (data.value) {
      schedules.value = data.value;
    }
  } catch (error) {
    console.error("Error fetching schedules:", error);
  } finally {
    isLoading.value = false;
  }
}

// Create new schedule
async function createNewSchedule() {
  if (!newSchedule.title) return;

  isSubmitting.value = true;

  try {
    const { data, error } = await useFetch("/api/schedules", {
      method: "POST",
      headers: getAuthHeader(),
      body: newSchedule,
    });

    if (error.value) {
      console.error("Error creating schedule:", error.value);
      showError(
        "Schedule Creation Failed",
        "There was a problem creating your schedule."
      );
      return;
    }

    if (data.value) {
      schedules.value.unshift(data.value);
      isCreatingSchedule.value = false;

      // Show notification
      success(
        "Schedule Created",
        `"${data.value.title}" has been created successfully.`
      );

      // Reset form
      newSchedule.title = "";
      newSchedule.description = "";
      newSchedule.visibility = "private";
    }
  } catch (err) {
    console.error("Error creating schedule:", err);
  } finally {
    isSubmitting.value = false;
  }
}

// Select schedule to view
function selectSchedule(schedule) {
  selectedSchedule.value = schedule;
}

// Edit schedule
function editSchedule(schedule) {
  // This will be implemented in the future
  console.log("Edit schedule:", schedule);
}

// Delete schedule prompt
function deleteSchedulePrompt(schedule) {
  scheduleToDelete.value = schedule;
  selectedSchedule.value = null;
}

// Confirm delete schedule
async function confirmDeleteSchedule() {
  if (!scheduleToDelete.value) return;

  isDeletingSchedule.value = true;

  try {
    const { error } = await useFetch(
      `/api/schedules/${scheduleToDelete.value.id}`,
      {
        method: "DELETE",
        headers: getAuthHeader(),
      }
    );

    if (error.value) {
      console.error("Error deleting schedule:", error.value);
      return;
    }

    // Remove from list
    const deletedTitle = scheduleToDelete.value.title;
    schedules.value = schedules.value.filter(
      (s) => s.id !== scheduleToDelete.value.id
    );
    scheduleToDelete.value = null;

    // Show notification
    success(
      "Schedule Deleted",
      `"${deletedTitle}" has been deleted successfully.`
    );
  } catch (err) {
    console.error("Error deleting schedule:", err);
  } finally {
    isDeletingSchedule.value = false;
  }
}

// Format visibility for display
function formatVisibility(visibility) {
  const formats = {
    private: "Private",
    public: "Public",
    group: "Shared with Groups",
  };

  return formats[visibility] || visibility;
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Fetch schedules on component mount
onMounted(() => {
  fetchSchedules();
});
</script>
