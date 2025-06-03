<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        Welcome back, {{ user?.fullName || user?.username }}!
      </h1>
      <p class="text-gray-600">
        Here's your schedule overview for today and upcoming events.
      </p>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar Section -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-800">
              Interactive Calendar
            </h2>
            <div class="flex gap-2">
              <button
                @click="createNewEvent"
                class="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <Icon name="heroicons:plus" class="w-4 h-4 inline mr-1" />
                New Event
              </button>
            </div>
          </div>

          <!-- FullCalendar Component -->
          <FullCalendarComponent
            ref="fullCalendarRef"
            :events="calendarEvents"
            :height="500"
            @dateClick="handleDateClick"
            @eventClick="handleEventClick"
            @createEvent="handleCreateEvent"
          />
        </div>
      </div>

      <!-- Events and Quick Actions -->
      <div class="space-y-6">
        <!-- Today's Events -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Today's Events
          </h2>

          <div v-if="todaysEvents.length === 0" class="text-center py-8">
            <Icon
              name="material-symbols:event-available"
              class="w-12 h-12 text-gray-300 mx-auto mb-2"
            />
            <p class="text-gray-500">No events today</p>
            <p class="text-sm text-gray-400">Enjoy your free time!</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="event in todaysEvents"
              :key="event.id"
              class="rounded-lg p-3 text-white"
              :style="{ backgroundColor: event.color || '#3b82f6' }"
            >
              <div>
                <h3 class="font-medium">
                  {{ event.title }}
                </h3>
                <p class="text-sm opacity-90">
                  {{ formatEventTime(event.startTime) }}
                  <span v-if="event.endTime">
                    - {{ formatEventTime(event.endTime) }}
                  </span>
                </p>
                <p v-if="event.location" class="text-xs opacity-80 mt-1">
                  📍 {{ event.location }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Events -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Upcoming Events
          </h2>

          <div v-if="upcomingEvents.length === 0" class="text-center py-4">
            <p class="text-gray-500">No upcoming events</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="event in upcomingEvents.slice(0, 5)"
              :key="event.id"
              class="border-l-4 border-blue-400 pl-3 py-2"
            >
              <h3 class="font-medium text-gray-800 text-sm">
                {{ event.title }}
              </h3>
              <p class="text-xs text-gray-600">
                {{ formatEventDate(event.startTime) }}
              </p>
            </div>

            <NuxtLink
              v-if="upcomingEvents.length > 5"
              to="/schedule"
              class="block text-center text-gray-600 hover:text-gray-800 text-sm font-medium mt-3"
            >
              View {{ upcomingEvents.length - 5 }} more events →
            </NuxtLink>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>

          <div class="space-y-3">
            <NuxtLink
              to="/associations"
              class="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Icon
                name="material-symbols:people"
                class="w-5 h-5 text-gray-600 mr-3"
              />
              <span class="text-gray-700 font-medium">Manage Connections</span>
            </NuxtLink>

            <NuxtLink
              to="/groups"
              class="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Icon
                name="material-symbols:group"
                class="w-5 h-5 text-gray-600 mr-3"
              />
              <span class="text-gray-700 font-medium">View Groups</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Modal -->
    <EventModal
      :show="showEventModal"
      :initialData="eventModalData"
      :editingEvent="editingEvent"
      @close="closeEventModal"
      @save="saveEvent"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAuth } from "~/composables/useAuth";
import FullCalendarComponent from "~/components/calendar/FullCalendarComponent.vue";
import EventModal from "~/components/calendar/EventModal.vue";

// Meta
definePageMeta({
  middleware: "auth",
  title: "Dashboard - MeetGrid",
});

// Auth
const { user } = useAuth();

// FullCalendar refs and state
const fullCalendarRef = ref(null);
const showEventModal = ref(false);
const eventModalData = ref(null);
const editingEvent = ref(null);

// Calendar events data (will be populated from API calls)
const calendarEvents = ref([]);

// Mock events data for today's events sidebar (derived from calendar events)
const todaysEvents = computed(() => {
  const today = new Date().toISOString().split("T")[0];
  return calendarEvents.value
    .filter((event) => event.start.startsWith(today))
    .map((event) => ({
      id: event.id,
      title: event.title,
      startTime: new Date(event.start).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      endTime: event.end
        ? new Date(event.end).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : null,
      color: event.backgroundColor,
      location: event.extendedProps?.location,
    }));
});

const upcomingEvents = computed(() => {
  const today = new Date().toISOString().split("T")[0];
  return calendarEvents.value
    .filter((event) => event.start > today + "T23:59:59")
    .map((event) => ({
      id: event.id,
      title: event.title,
      startTime: new Date(event.start),
    }))
    .sort((a, b) => a.startTime - b.startTime);
});

// Event handlers for FullCalendar
const handleDateClick = (info) => {
  console.log("Date clicked:", info.dateStr);
  // The FullCalendar component already handles showing events for the clicked date
};

const handleEventClick = (event) => {
  console.log("Event clicked:", event);
  editingEvent.value = event;
  eventModalData.value = null;
  showEventModal.value = true;
};

const handleCreateEvent = (eventInfo) => {
  console.log("Create event for:", eventInfo);
  editingEvent.value = null;
  eventModalData.value = eventInfo;
  showEventModal.value = true;
};

const createNewEvent = () => {
  editingEvent.value = null;
  eventModalData.value = {
    start: new Date(),
    end: new Date(),
    allDay: false,
  };
  showEventModal.value = true;
};

const closeEventModal = () => {
  showEventModal.value = false;
  eventModalData.value = null;
  editingEvent.value = null;
};

const saveEvent = (eventData) => {
  console.log("Saving event:", eventData);

  if (editingEvent.value) {
    // Update existing event
    const index = calendarEvents.value.findIndex(
      (e) => e.id === editingEvent.value.id
    );
    if (index !== -1) {
      calendarEvents.value[index] = {
        ...eventData,
        backgroundColor: eventData.color,
        extendedProps: {
          description: eventData.description,
          location: eventData.location,
          attendees: eventData.attendees,
        },
      };
    }
  } else {
    // Create new event
    const newEvent = {
      id: String(Date.now()), // Simple ID generation
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      allDay: eventData.allDay,
      backgroundColor: eventData.color,
      extendedProps: {
        description: eventData.description,
        location: eventData.location,
        attendees: eventData.attendees,
      },
    };
    calendarEvents.value.push(newEvent);
  }

  // Refresh the calendar
  nextTick(() => {
    fullCalendarRef.value?.refetchEvents();
  });

  closeEventModal();
};

// Utility functions
const formatEventTime = (time) => {
  if (typeof time === "string") {
    return time;
  }
  return time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatEventDate = (date) => {
  if (typeof date === "string") {
    return date;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
};

// Head
useHead({
  title: "Dashboard - MeetGrid",
  meta: [
    {
      name: "description",
      content:
        "Your personal dashboard with interactive calendar and upcoming events.",
    },
  ],
});
</script>
