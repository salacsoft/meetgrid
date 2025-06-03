<template>
  <div class="fullcalendar-container">
    <FullCalendar ref="fullCalendar" :options="calendarOptions" />

    <!-- Event Details Modal -->
    <div
      v-if="showEventModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">
            Events for {{ selectedDateStr }}
          </h3>
          <button
            @click="closeEventModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div v-if="selectedDateEvents.length > 0" class="space-y-3">
          <div
            v-for="event in selectedDateEvents"
            :key="event.id"
            class="border border-gray-200 rounded-lg p-3"
          >
            <h4 class="font-medium text-gray-800">{{ event.title }}</h4>
            <p class="text-sm text-gray-600">{{ event.time }}</p>
            <p v-if="event.description" class="text-sm text-gray-500 mt-1">
              {{ event.description }}
            </p>
          </div>
        </div>

        <div v-else class="text-center py-4">
          <Icon
            name="heroicons:calendar"
            class="w-12 h-12 text-gray-300 mx-auto mb-2"
          />
          <p class="text-gray-500">No events for this date</p>
        </div>

        <div class="mt-4 flex gap-2">
          <button
            @click="createEventForDate"
            class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Icon name="heroicons:plus" class="w-4 h-4 inline mr-1" />
            Add Event
          </button>
          <button
            @click="closeEventModal"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  initialView: {
    type: String,
    default: "dayGridMonth",
  },
  height: {
    type: [String, Number],
    default: "auto",
  },
});

const emit = defineEmits(["dateClick", "eventClick", "createEvent"]);

// Reactive data
const fullCalendar = ref(null);
const showEventModal = ref(false);
const selectedDate = ref(null);
const selectedDateStr = ref("");
const selectedDateEvents = ref([]);

// Calendar options
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: props.initialView,
  height: props.height,
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  events: props.events,

  // Event handlers
  dateClick: handleDateClick,
  select: handleDateSelect,
  eventClick: handleEventClick,

  // Styling
  themeSystem: "standard",
  eventColor: "#3b82f6",
  // Remove fixed eventTextColor to allow automatic contrast

  // Responsive
  aspectRatio: 1.8,
  contentHeight: "auto",

  // Event display
  displayEventTime: true,
  displayEventEnd: false,

  // Navigation
  navLinks: true,
  navLinkDayClick: "timeGridDay",
  navLinkWeekClick: "timeGridWeek",
}));

// Event handlers
function handleDateClick(info) {
  selectedDate.value = info.date;
  selectedDateStr.value = info.dateStr;

  // Filter events for the selected date
  const dateEvents = props.events
    .filter((event) => {
      const eventDate = new Date(event.start).toISOString().split("T")[0];
      return eventDate === info.dateStr;
    })
    .map((event) => ({
      ...event,
      time: formatEventTime(event),
    }));

  selectedDateEvents.value = dateEvents;
  showEventModal.value = true;

  emit("dateClick", info);
}

function handleDateSelect(info) {
  // Handle date range selection for creating events
  emit("createEvent", {
    start: info.start,
    end: info.end,
    allDay: info.allDay,
  });
}

function handleEventClick(info) {
  emit("eventClick", info.event);
}

function closeEventModal() {
  showEventModal.value = false;
  selectedDate.value = null;
  selectedDateStr.value = "";
  selectedDateEvents.value = [];
}

function createEventForDate() {
  emit("createEvent", {
    start: selectedDate.value,
    end: selectedDate.value,
    allDay: true,
  });
  closeEventModal();
}

function formatEventTime(event) {
  if (event.allDay) {
    return "All day";
  }

  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (end) {
    return `${formatTime(start)} - ${formatTime(end)}`;
  }
  return formatTime(start);
}

// Public methods
const getCalendarApi = () => {
  return fullCalendar.value?.getApi();
};

const refetchEvents = () => {
  getCalendarApi()?.refetchEvents();
};

const gotoDate = (date) => {
  getCalendarApi()?.gotoDate(date);
};

const changeView = (viewName) => {
  getCalendarApi()?.changeView(viewName);
};

defineExpose({
  getCalendarApi,
  refetchEvents,
  gotoDate,
  changeView,
});
</script>

<style scoped>
.fullcalendar-container {
  width: 100%;
}

/* FullCalendar custom styling */
:deep(.fc) {
  font-size: 0.875rem;
}

:deep(.fc-toolbar) {
  margin-bottom: 1rem;
}

:deep(.fc-toolbar-title) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

:deep(.fc-button) {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
}

:deep(.fc-button:hover) {
  background-color: #f9fafb;
}

:deep(.fc-button:focus) {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
}

:deep(.fc-button-primary) {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

:deep(.fc-button-primary:hover) {
  background-color: #2563eb;
}

:deep(.fc-button:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

:deep(.fc-daygrid-day-number) {
  color: #374151;
  font-weight: 500;
}

:deep(.fc-day-today) {
  background-color: #eff6ff;
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  color: #2563eb;
  font-weight: 700;
}

:deep(.fc-event) {
  border: none;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

:deep(.fc-daygrid-event) {
  border: none !important;
  background-color: var(--fc-event-bg-color) !important;
}

:deep(.fc-event-main) {
  color: white !important;
}

:deep(.fc-event-title) {
  font-weight: 500;
  color: white !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

:deep(.fc-event-time) {
  color: white !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

:deep(.fc-daygrid-day:hover) {
  background-color: #f9fafb;
  cursor: pointer;
}

:deep(.fc-col-header-cell) {
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 500;
}

:deep(.fc-scrollgrid) {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}
</style>
