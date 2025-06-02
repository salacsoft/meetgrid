<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
        {{ schedule.title || "Schedule Details" }}
      </h1>
      <NuxtLink
        to="/schedule"
        class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Back to Schedules
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <p class="text-lg text-gray-600">Loading schedule...</p>
    </div>

    <div
      v-else-if="!schedule.id"
      class="text-center py-8 border rounded-lg bg-gray-50"
    >
      <p class="text-lg text-gray-600">
        Schedule not found or you don't have access to view it.
      </p>
    </div>

    <div v-else>
      <div class="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div class="mb-4">
          <span class="text-gray-600">Description:</span>
          <p>{{ schedule.description || "No description provided." }}</p>
        </div>

        <div class="flex justify-between items-center text-sm text-gray-600">
          <div>
            <span class="font-semibold">Owner:</span>
            {{ schedule.owner_username }}
          </div>
          <div>
            <span class="font-semibold">Visibility:</span>
            {{ formatVisibility(schedule.visibility) }}
          </div>
          <div>
            <span class="font-semibold">Last Updated:</span>
            {{ formatDate(schedule.updated_at) }}
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4">
        <CalendarView
          :schedule-id="scheduleId"
          :events="events"
          @event-added="handleEventAdded"
          @event-updated="handleEventUpdated"
          @event-deleted="handleEventDeleted"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "~/composables/useAuth";
import { useNotifications } from "~/composables/useNotifications";
import CalendarView from "~/components/calendar/CalendarView.vue";

// Define route meta for title and middleware
definePageMeta({
  title: "Schedule Details",
  middleware: ["auth"],
});

const route = useRoute();
const { getAuthHeader } = useAuth();
const { success, error: showError } = useNotifications();

// State
const scheduleId = ref(route.params.id);
const schedule = ref({});
const events = ref([]);
const isLoading = ref(true);

// Fetch schedule details
async function fetchSchedule() {
  isLoading.value = true;

  try {
    const { data, error } = await useFetch(
      `/api/schedules/${scheduleId.value}`,
      {
        headers: getAuthHeader(),
      }
    );

    if (error.value) {
      console.error("Error fetching schedule:", error.value);
      return;
    }

    if (data.value) {
      schedule.value = data.value;
      await fetchEvents();
    }
  } catch (err) {
    console.error("Error fetching schedule:", err);
  } finally {
    isLoading.value = false;
  }
}

// Fetch events for this schedule
async function fetchEvents() {
  try {
    const { data, error } = await useFetch(
      `/api/schedules/${scheduleId.value}/events`,
      {
        headers: getAuthHeader(),
      }
    );

    if (error.value) {
      console.error("Error fetching events:", error.value);
      return;
    }

    if (data.value) {
      events.value = data.value;
    }
  } catch (err) {
    console.error("Error fetching events:", err);
  }
}

// Handle adding a new event
async function handleEventAdded(event) {
  try {
    const { data, error } = await useFetch(
      `/api/schedules/${scheduleId.value}/events`,
      {
        method: "POST",
        headers: getAuthHeader(),
        body: event,
      }
    );

    if (error.value) {
      console.error("Error adding event:", error.value);
      showError(
        "Failed to Add Event",
        "There was a problem adding your event."
      );
      return;
    }

    if (data.value) {
      events.value.push(data.value);
      success("Event Added", "New event has been added to the schedule.");
    }
  } catch (err) {
    console.error("Error adding event:", err);
  }
}

// Handle updating an event
async function handleEventUpdated(event) {
  try {
    const { data, error } = await useFetch(`/api/events/${event.id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: event,
    });

    if (error.value) {
      console.error("Error updating event:", error.value);
      return;
    }

    if (data.value) {
      // Update event in the list
      const index = events.value.findIndex((e) => e.id === event.id);
      if (index !== -1) {
        events.value[index] = data.value;
        success("Event Updated", "The event has been updated successfully.");
      }
    }
  } catch (err) {
    console.error("Error updating event:", err);
  }
}

// Handle deleting an event
async function handleEventDeleted(event) {
  try {
    const { error } = await useFetch(`/api/events/${event.id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (error.value) {
      console.error("Error deleting event:", error.value);
      return;
    }

    // Remove event from the list
    events.value = events.value.filter((e) => e.id !== event.id);
    success("Event Deleted", "The event has been removed from the schedule.");
  } catch (err) {
    console.error("Error deleting event:", err);
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

// Fetch schedule on component mount
onMounted(() => {
  fetchSchedule();
});
</script>
