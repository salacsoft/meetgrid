<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-screen overflow-y-auto"
    >
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold text-gray-800">
          {{ editingEvent ? "Edit Event" : "Create New Event" }}
        </h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="saveEvent" class="space-y-4">
        <!-- Event Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Event Title *
          </label>
          <input
            v-model="eventForm.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter event title"
          />
        </div>

        <!-- Event Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            v-model="eventForm.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter event description"
          ></textarea>
        </div>

        <!-- All Day Toggle -->
        <div class="flex items-center">
          <input
            v-model="eventForm.allDay"
            type="checkbox"
            id="allDay"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="allDay" class="ml-2 block text-sm text-gray-700">
            All day event
          </label>
        </div>

        <!-- Date and Time -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              v-model="eventForm.startDate"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- End Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              v-model="eventForm.endDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Time fields (shown only if not all day) -->
        <div
          v-if="!eventForm.allDay"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <!-- Start Time -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              v-model="eventForm.startTime"
              type="time"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- End Time -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              v-model="eventForm.endTime"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Event Color -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Event Color
          </label>
          <div class="flex gap-2">
            <button
              v-for="color in colorOptions"
              :key="color.value"
              type="button"
              @click="eventForm.color = color.value"
              :class="[
                'w-8 h-8 rounded-full border-2 transition-all',
                eventForm.color === color.value
                  ? 'border-gray-800 scale-110'
                  : 'border-gray-300 hover:border-gray-500',
              ]"
              :style="{ backgroundColor: color.value }"
              :title="color.name"
            ></button>
          </div>
        </div>

        <!-- Location -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            v-model="eventForm.location"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter event location"
          />
        </div>

        <!-- Attendees -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Attendees
          </label>
          <input
            v-model="eventForm.attendees"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter attendee emails (comma separated)"
          />
        </div>

        <!-- Validation Error -->
        <div
          v-if="validationError"
          class="bg-red-50 border border-red-200 rounded-md p-3"
        >
          <div class="flex">
            <Icon
              name="heroicons:exclamation-triangle"
              class="w-5 h-5 text-red-400 mr-2 mt-0.5"
            />
            <p class="text-sm text-red-700">{{ validationError }}</p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon
              v-if="saving"
              name="heroicons:arrow-path"
              class="w-4 h-4 inline mr-1 animate-spin"
            />
            {{
              saving
                ? "Saving..."
                : editingEvent
                ? "Update Event"
                : "Create Event"
            }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: null,
  },
  editingEvent: {
    type: Object,
    default: null,
  },
  existingEvents: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "save"]);

// Color options for events
const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
];

// Form state
const saving = ref(false);
const validationError = ref("");
const eventForm = ref({
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  startTime: "09:00",
  endTime: "10:00",
  allDay: false,
  color: "#3b82f6",
  location: "",
  attendees: "",
});

// Initialize form data
const initializeForm = () => {
  if (props.editingEvent) {
    // Edit mode - populate with existing event data
    const event = props.editingEvent;
    const startDate = new Date(event.start);
    const endDate = event.end ? new Date(event.end) : startDate;

    eventForm.value = {
      title: event.title || "",
      description: event.extendedProps?.description || "",
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      startTime: event.allDay ? "09:00" : startDate.toTimeString().slice(0, 5),
      endTime: event.allDay ? "10:00" : endDate.toTimeString().slice(0, 5),
      allDay: event.allDay || false,
      color: event.backgroundColor || "#3b82f6",
      location: event.extendedProps?.location || "",
      attendees: event.extendedProps?.attendees || "",
    };
  } else if (props.initialData) {
    // Create mode with initial date
    const startDate = new Date(props.initialData.start);
    const endDate = props.initialData.end
      ? new Date(props.initialData.end)
      : startDate;

    eventForm.value = {
      title: "",
      description: "",
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      allDay: props.initialData.allDay || false,
      color: "#3b82f6",
      location: "",
      attendees: "",
    };
  } else {
    // Default form
    const today = new Date();
    eventForm.value = {
      title: "",
      description: "",
      startDate: today.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      allDay: false,
      color: "#3b82f6",
      location: "",
      attendees: "",
    };
  }
};

// Watch for prop changes
watch(
  [() => props.show, () => props.initialData, () => props.editingEvent],
  () => {
    if (props.show) {
      initializeForm();
    }
  },
  { immediate: true }
);

// Auto-set end date when start date changes
watch(
  () => eventForm.value.startDate,
  (newStartDate) => {
    if (newStartDate && !eventForm.value.endDate) {
      eventForm.value.endDate = newStartDate;
    }
  }
);

// Auto-adjust end time when start time changes
watch(
  () => eventForm.value.startTime,
  (newStartTime) => {
    if (newStartTime && eventForm.value.endTime <= newStartTime) {
      const [hours, minutes] = newStartTime.split(":").map(Number);
      const endTime = new Date();
      endTime.setHours(hours + 1, minutes);
      eventForm.value.endTime = endTime.toTimeString().slice(0, 5);
    }
  }
);

// Methods
const closeModal = () => {
  validationError.value = "";
  emit("close");
};

// Check for overlapping events
const checkEventOverlap = (newEventStart, newEventEnd, excludeId = null) => {
  const newStart = new Date(newEventStart);
  const newEnd = new Date(newEventEnd);

  for (const event of props.existingEvents) {
    // Skip the current event if editing
    if (excludeId && event.id === excludeId) {
      continue;
    }

    const existingStart = new Date(event.start);
    const existingEnd = new Date(event.end || event.start);

    // Check for overlap: events overlap if one starts before the other ends
    const hasOverlap = newStart < existingEnd && newEnd > existingStart;

    if (hasOverlap) {
      return {
        hasOverlap: true,
        conflictingEvent: event,
      };
    }
  }

  return { hasOverlap: false };
};

const saveEvent = async () => {
  if (!eventForm.value.title.trim()) {
    validationError.value = "Event title is required";
    return;
  }

  // Clear previous validation errors
  validationError.value = "";
  saving.value = true;

  try {
    // Prepare event data
    const eventData = {
      title: eventForm.value.title.trim(),
      description: eventForm.value.description.trim(),
      location: eventForm.value.location.trim(),
      attendees: eventForm.value.attendees.trim(),
      color: eventForm.value.color,
      allDay: eventForm.value.allDay,
    };

    // Set start and end dates/times
    if (eventForm.value.allDay) {
      eventData.start = eventForm.value.startDate;
      eventData.end = eventForm.value.endDate || eventForm.value.startDate;
    } else {
      eventData.start = `${eventForm.value.startDate}T${eventForm.value.startTime}`;
      if (eventForm.value.endDate && eventForm.value.endTime) {
        eventData.end = `${eventForm.value.endDate}T${eventForm.value.endTime}`;
      } else {
        // If no end time provided, default to 1 hour later
        const startTime = new Date(
          `${eventForm.value.startDate}T${eventForm.value.startTime}`
        );
        startTime.setHours(startTime.getHours() + 1);
        eventData.end = startTime.toISOString();
      }
    }

    // Validate end time is after start time
    if (new Date(eventData.end) <= new Date(eventData.start)) {
      validationError.value = "End time must be after start time";
      return;
    }

    // Check for overlapping events
    const excludeId = props.editingEvent?.id;
    const overlapCheck = checkEventOverlap(
      eventData.start,
      eventData.end,
      excludeId
    );

    if (overlapCheck.hasOverlap) {
      const conflictEvent = overlapCheck.conflictingEvent;
      const conflictStart = new Date(conflictEvent.start).toLocaleString();
      const conflictEnd = new Date(
        conflictEvent.end || conflictEvent.start
      ).toLocaleString();

      validationError.value = `This event overlaps with "${conflictEvent.title}" (${conflictStart} - ${conflictEnd})`;
      return;
    }

    // Add ID if editing
    if (props.editingEvent) {
      eventData.id = props.editingEvent.id;
    }

    emit("save", eventData);
  } catch (error) {
    console.error("Error saving event:", error);
    validationError.value = "An error occurred while saving the event";
  } finally {
    saving.value = false;
  }
};
</script>
