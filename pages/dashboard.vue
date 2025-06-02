<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-primary-800 mb-2">
        Welcome back, {{ user?.fullName || user?.username }}!
      </h1>
      <p class="text-primary-600">
        Here's your schedule overview for today and upcoming events.
      </p>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar Section -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-primary-800">
              Calendar Overview
            </h2>
            <NuxtLink
              to="/schedule"
              class="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View Full Calendar →
            </NuxtLink>
          </div>

          <!-- Mini Calendar -->
          <div class="border border-primary-200 rounded-lg p-4">
            <div class="text-center mb-4">
              <h3 class="text-lg font-medium text-primary-700">
                {{ currentMonth }} {{ currentYear }}
              </h3>
            </div>

            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-1 text-sm">
              <!-- Day headers -->
              <div
                v-for="day in dayHeaders"
                :key="day"
                class="text-center text-primary-500 font-medium p-2"
              >
                {{ day }}
              </div>

              <!-- Calendar days -->
              <div
                v-for="date in calendarDates"
                :key="date.date"
                class="text-center p-2 rounded cursor-pointer transition-colors"
                :class="{
                  'bg-primary-100 text-primary-800 font-semibold': date.isToday,
                  'text-primary-300': !date.isCurrentMonth,
                  'text-primary-700': date.isCurrentMonth && !date.isToday,
                  'bg-primary-50': date.hasEvents,
                  'hover:bg-primary-50': date.isCurrentMonth,
                }"
              >
                {{ date.day }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Events and Quick Actions -->
      <div class="space-y-6">
        <!-- Today's Events -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-primary-800 mb-4">
            Today's Events
          </h2>

          <div v-if="todaysEvents.length === 0" class="text-center py-8">
            <Icon
              name="material-symbols:event-available"
              class="w-12 h-12 text-primary-300 mx-auto mb-2"
            />
            <p class="text-primary-500">No events today</p>
            <p class="text-sm text-primary-400">Enjoy your free time!</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="event in todaysEvents"
              :key="event.id"
              class="border border-primary-200 rounded-lg p-3"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-medium text-primary-800">
                    {{ event.title }}
                  </h3>
                  <p class="text-sm text-primary-600">
                    {{ formatEventTime(event.startTime) }}
                    <span v-if="event.endTime">
                      - {{ formatEventTime(event.endTime) }}
                    </span>
                  </p>
                  <p
                    v-if="event.location"
                    class="text-xs text-primary-500 mt-1"
                  >
                    📍 {{ event.location }}
                  </p>
                </div>
                <div
                  class="w-3 h-3 rounded-full"
                  :class="`bg-${event.color || 'primary'}-400`"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Events -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-primary-800 mb-4">
            Upcoming Events
          </h2>

          <div v-if="upcomingEvents.length === 0" class="text-center py-4">
            <p class="text-primary-500">No upcoming events</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="event in upcomingEvents.slice(0, 5)"
              :key="event.id"
              class="border-l-4 border-primary-400 pl-3 py-2"
            >
              <h3 class="font-medium text-primary-800 text-sm">
                {{ event.title }}
              </h3>
              <p class="text-xs text-primary-600">
                {{ formatEventDate(event.startTime) }}
              </p>
            </div>

            <NuxtLink
              v-if="upcomingEvents.length > 5"
              to="/schedule"
              class="block text-center text-primary-600 hover:text-primary-800 text-sm font-medium mt-3"
            >
              View {{ upcomingEvents.length - 5 }} more events →
            </NuxtLink>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-primary-800 mb-4">
            Quick Actions
          </h2>

          <div class="space-y-3">
            <NuxtLink
              to="/schedule/new"
              class="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Icon
                name="material-symbols:add-circle"
                class="w-5 h-5 text-primary-600 mr-3"
              />
              <span class="text-primary-700 font-medium">Create New Event</span>
            </NuxtLink>

            <NuxtLink
              to="/associations"
              class="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Icon
                name="material-symbols:people"
                class="w-5 h-5 text-primary-600 mr-3"
              />
              <span class="text-primary-700 font-medium"
                >Manage Connections</span
              >
            </NuxtLink>

            <NuxtLink
              to="/groups"
              class="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Icon
                name="material-symbols:group"
                class="w-5 h-5 text-primary-600 mr-3"
              />
              <span class="text-primary-700 font-medium">View Groups</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAuth } from "~/composables/useAuth";

// Meta
definePageMeta({
  middleware: "auth",
  title: "Dashboard - MeetGrid",
});

// Auth
const { user } = useAuth();

// Calendar data
const currentDate = new Date();
const currentMonth = ref(
  currentDate.toLocaleString("default", { month: "long" })
);
const currentYear = ref(currentDate.getFullYear());

const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Mock events data (replace with real data from API later)
const todaysEvents = ref([
  {
    id: 1,
    title: "Team Standup",
    startTime: "09:00",
    endTime: "09:30",
    color: "blue",
    location: "Conference Room A",
  },
  {
    id: 2,
    title: "Client Meeting",
    startTime: "14:00",
    endTime: "15:00",
    color: "green",
    location: "Online",
  },
]);

const upcomingEvents = ref([
  {
    id: 3,
    title: "Project Review",
    startTime: new Date(Date.now() + 86400000), // Tomorrow
  },
  {
    id: 4,
    title: "Weekly Planning",
    startTime: new Date(Date.now() + 172800000), // Day after tomorrow
  },
  {
    id: 5,
    title: "Lunch with Sarah",
    startTime: new Date(Date.now() + 259200000), // 3 days from now
  },
]);

// Calendar generation
const calendarDates = computed(() => {
  const year = currentYear.value;
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const dates = [];
  const today = new Date();

  for (let i = 0; i < 42; i++) {
    // 6 weeks
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    dates.push({
      date: date.toISOString().split("T")[0],
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
      hasEvents: Math.random() > 0.8, // Mock event indicator
    });
  }

  return dates;
});

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
        "Your personal dashboard with calendar overview and upcoming events.",
    },
  ],
});
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-md p-6;
}
</style>
