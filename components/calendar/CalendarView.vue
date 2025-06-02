<template>
  <div class="calendar">
    <!-- Calendar Header -->
    <div class="calendar-header flex justify-between items-center mb-4">
      <div class="flex items-center space-x-4">
        <button
          @click="previousMonth"
          class="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <span class="text-xl">&larr;</span>
        </button>
        <h2 class="text-xl font-bold">{{ formatCurrentMonthYear }}</h2>
        <button
          @click="nextMonth"
          class="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <span class="text-xl">&rarr;</span>
        </button>
      </div>
      <div class="flex space-x-2">
        <button
          @click="setView('month')"
          :class="[
            'px-3 py-1 rounded',
            currentView === 'month'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-200',
          ]"
        >
          Month
        </button>
        <button
          @click="setView('week')"
          :class="[
            'px-3 py-1 rounded',
            currentView === 'week'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-200',
          ]"
        >
          Week
        </button>
        <button
          @click="setView('day')"
          :class="[
            'px-3 py-1 rounded',
            currentView === 'day'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-200',
          ]"
        >
          Day
        </button>
      </div>
    </div>

    <!-- Day of Week Headers -->
    <div class="grid grid-cols-7 gap-1 mb-1">
      <div
        v-for="day in daysOfWeek"
        :key="day"
        class="text-center py-2 font-semibold text-gray-600"
      >
        {{ day }}
      </div>
    </div>

    <!-- Month View -->
    <div v-if="currentView === 'month'" class="grid grid-cols-7 gap-1">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="min-h-[100px] border rounded p-1"
        :class="[
          day.isCurrentMonth ? 'bg-white' : 'bg-gray-100',
          day.isToday ? 'ring-2 ring-blue-500' : '',
        ]"
      >
        <!-- Day Header -->
        <div class="flex justify-between items-center mb-1">
          <span
            :class="[
              'text-sm font-semibold rounded-full h-6 w-6 flex items-center justify-center',
              day.isToday ? 'bg-blue-600 text-white' : 'text-gray-700',
            ]"
          >
            {{ day.dayOfMonth }}
          </span>
          <button
            v-if="day.isCurrentMonth"
            @click="addEvent(day.date)"
            class="text-gray-400 hover:text-blue-600 text-sm"
          >
            +
          </button>
        </div>

        <!-- Events -->
        <div class="space-y-1">
          <div
            v-for="event in getEventsForDay(day.date)"
            :key="event.id"
            class="text-xs p-1 rounded truncate cursor-pointer"
            :style="{ backgroundColor: event.color || '#3B82F6' }"
            @click="selectEvent(event)"
          >
            {{ event.title }}
          </div>
        </div>
      </div>
    </div>

    <!-- Week View Placeholder -->
    <div
      v-else-if="currentView === 'week'"
      class="bg-gray-100 p-4 rounded-lg text-center"
    >
      <p class="text-gray-500">Week view will be implemented soon</p>
    </div>

    <!-- Day View Placeholder -->
    <div
      v-else-if="currentView === 'day'"
      class="bg-gray-100 p-4 rounded-lg text-center"
    >
      <p class="text-gray-500">Day view will be implemented soon</p>
    </div>

    <!-- Event Dialog -->
    <div
      v-if="showEventDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">
            {{ isEditingEvent ? "Edit Event" : "New Event" }}
          </h3>
          <button
            @click="closeEventDialog"
            class="text-gray-500 hover:text-gray-700"
          >
            <span class="text-2xl">&times;</span>
          </button>
        </div>

        <form @submit.prevent="saveEvent">
          <div class="mb-4">
            <label for="eventTitle" class="block text-gray-700 mb-1"
              >Title</label
            >
            <input
              id="eventTitle"
              v-model="currentEvent.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div class="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label for="eventStart" class="block text-gray-700 mb-1"
                >Start</label
              >
              <input
                id="eventStart"
                v-model="currentEvent.start_time"
                type="datetime-local"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label for="eventEnd" class="block text-gray-700 mb-1">End</label>
              <input
                id="eventEnd"
                v-model="currentEvent.end_time"
                type="datetime-local"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div class="mb-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="currentEvent.is_all_day"
                class="mr-2"
              />
              <span>All day event</span>
            </label>
          </div>

          <div class="mb-4">
            <label for="eventLocation" class="block text-gray-700 mb-1"
              >Location (optional)</label
            >
            <input
              id="eventLocation"
              v-model="currentEvent.location"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="mb-6">
            <label for="eventDescription" class="block text-gray-700 mb-1"
              >Description (optional)</label
            >
            <textarea
              id="eventDescription"
              v-model="currentEvent.description"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              rows="3"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              v-if="isEditingEvent"
              type="button"
              @click="deleteEvent"
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              type="button"
              @click="closeEventDialog"
              class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {{ isSubmitting ? "Saving..." : "Save" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Props
const props = defineProps({
  scheduleId: {
    type: [Number, String],
    required: true,
  },
  events: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["event-added", "event-updated", "event-deleted"]);

// State
const currentDate = ref(new Date());
const currentView = ref("month");
const showEventDialog = ref(false);
const isEditingEvent = ref(false);
const isSubmitting = ref(false);
const currentEvent = ref({
  title: "",
  description: "",
  location: "",
  start_time: "",
  end_time: "",
  is_all_day: false,
});

// Calendar days
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  // Get first day of month
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Get last day of month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Get today
  const today = new Date();
  const isToday = (date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Create calendar days array
  const days = [];

  // Add days from previous month
  const daysFromPreviousMonth = firstDayOfWeek;
  const prevMonth = new Date(year, month, 0);
  const prevMonthDays = prevMonth.getDate();

  for (
    let i = prevMonthDays - daysFromPreviousMonth + 1;
    i <= prevMonthDays;
    i++
  ) {
    const date = new Date(year, month - 1, i);
    days.push({
      date,
      dayOfMonth: i,
      isCurrentMonth: false,
      isToday: isToday(date),
    });
  }

  // Add days from current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      dayOfMonth: i,
      isCurrentMonth: true,
      isToday: isToday(date),
    });
  }

  // Add days from next month
  const totalDays = days.length;
  const daysToAdd = 42 - totalDays; // Always show 6 weeks (42 days)

  for (let i = 1; i <= daysToAdd; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      dayOfMonth: i,
      isCurrentMonth: false,
      isToday: isToday(date),
    });
  }

  return days;
});

// Format current month and year
const formatCurrentMonthYear = computed(() => {
  const options = { month: "long", year: "numeric" };
  return currentDate.value.toLocaleDateString(undefined, options);
});

// Days of week
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Navigate to previous month
function previousMonth() {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  currentDate.value = new Date(year, month - 1, 1);
}

// Navigate to next month
function nextMonth() {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  currentDate.value = new Date(year, month + 1, 1);
}

// Set calendar view
function setView(view) {
  currentView.value = view;
}

// Get events for a specific day
function getEventsForDay(date) {
  // Filter events that occur on this date
  return props.events.filter((event) => {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);

    // Check if the date is between event start and end dates
    return (
      date.getFullYear() >= eventStart.getFullYear() &&
      date.getMonth() >= eventStart.getMonth() &&
      date.getDate() >= eventStart.getDate() &&
      date.getFullYear() <= eventEnd.getFullYear() &&
      date.getMonth() <= eventEnd.getMonth() &&
      date.getDate() <= eventEnd.getDate()
    );
  });
}

// Add new event
function addEvent(date) {
  // Format date string for datetime-local input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}T12:00`;

  // Reset event form with default values
  currentEvent.value = {
    title: "",
    description: "",
    location: "",
    start_time: dateString,
    end_time: `${year}-${month}-${day}T13:00`,
    is_all_day: false,
    schedule_id: props.scheduleId,
  };

  isEditingEvent.value = false;
  showEventDialog.value = true;
}

// Select an event to edit
function selectEvent(event) {
  // Format datetime values for datetime-local input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  // Clone the event to prevent modifying original
  currentEvent.value = {
    ...event,
    start_time: formatDateForInput(event.start_time),
    end_time: formatDateForInput(event.end_time),
  };

  isEditingEvent.value = true;
  showEventDialog.value = true;
}

// Save an event (add or update)
function saveEvent() {
  isSubmitting.value = true;

  try {
    if (isEditingEvent.value) {
      emit("event-updated", currentEvent.value);
    } else {
      emit("event-added", currentEvent.value);
    }

    // Close dialog
    closeEventDialog();
  } catch (error) {
    console.error("Error saving event:", error);
  } finally {
    isSubmitting.value = false;
  }
}

// Delete an event
function deleteEvent() {
  if (confirm("Are you sure you want to delete this event?")) {
    emit("event-deleted", currentEvent.value);
    closeEventDialog();
  }
}

// Close the event dialog
function closeEventDialog() {
  showEventDialog.value = false;
  currentEvent.value = {
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
    is_all_day: false,
  };
}
</script>
