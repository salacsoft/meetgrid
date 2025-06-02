<template>
  <div class="min-h-screen bg-cream-50">
    <!-- Demo Header -->
    <div class="bg-white shadow-sm border-b border-cream-200 p-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center"
            >
              <Icon
                name="material-symbols:calendar-today"
                class="w-6 h-6 text-white"
              />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-primary-800">MeetGrid Demo</h1>
              <p class="text-primary-600 text-sm">
                Professional Calendar Scheduling
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button
              class="bg-cream-200 text-primary-800 px-4 py-2 rounded-lg font-medium hover:bg-cream-300 transition-colors flex items-center space-x-2"
            >
              <Icon name="material-symbols:refresh" class="w-4 h-4" />
              <span>Sync Calendar</span>
            </button>
            <NuxtLink
              to="/auth/register"
              class="bg-primary-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-900 transition-colors"
            >
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Demo Banner -->
    <div
      class="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-4"
    >
      <div class="max-w-6xl mx-auto px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <Icon name="material-symbols:info" class="w-5 h-5" />
            <span class="font-medium"
              >Demo Mode - Experience MeetGrid's features</span
            >
          </div>
          <span class="text-primary-200 text-sm">Sample data shown below</span>
        </div>
      </div>
    </div>

    <!-- Calendar Demo -->
    <div class="max-w-6xl mx-auto p-6">
      <div class="bg-white rounded-xl shadow-lg border border-cream-200 p-8">
        <div class="text-center py-12">
          <Icon
            name="material-symbols:calendar-month"
            class="w-20 h-20 text-primary-600 mx-auto mb-6"
          />
          <h2 class="text-3xl font-bold text-primary-800 mb-4">
            MeetGrid Calendar Demo
          </h2>
          <p class="text-primary-600 max-w-2xl mx-auto mb-8 text-lg">
            Experience professional calendar scheduling with Google Calendar
            integration. Create meetings, manage your schedule, and coordinate
            with your team effortlessly.
          </p>

          <!-- Demo Features -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div class="text-center p-6 bg-cream-50 rounded-xl">
              <Icon
                name="material-symbols:event"
                class="w-16 h-16 text-primary-600 mx-auto mb-4"
              />
              <h3 class="font-bold text-primary-800 mb-3 text-lg">
                Smart Scheduling
              </h3>
              <p class="text-primary-600">
                Intelligent meeting scheduling with conflict detection and
                availability checking
              </p>
            </div>

            <div class="text-center p-6 bg-cream-50 rounded-xl">
              <Icon
                name="material-symbols:group"
                class="w-16 h-16 text-primary-600 mx-auto mb-4"
              />
              <h3 class="font-bold text-primary-800 mb-3 text-lg">
                Team Coordination
              </h3>
              <p class="text-primary-600">
                Seamless collaboration with team members and meeting attendees
              </p>
            </div>

            <div class="text-center p-6 bg-cream-50 rounded-xl">
              <Icon
                name="material-symbols:sync"
                class="w-16 h-16 text-primary-600 mx-auto mb-4"
              />
              <h3 class="font-bold text-primary-800 mb-3 text-lg">
                Google Integration
              </h3>
              <p class="text-primary-600">
                Real-time sync with Google Calendar for seamless workflow
              </p>
            </div>
          </div>

          <!-- Sample Calendar Events -->
          <div class="mt-12 max-w-4xl mx-auto">
            <h3 class="text-xl font-bold text-primary-800 mb-6">
              Today's Schedule Preview
            </h3>
            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div class="font-medium text-blue-900">Team Standup</div>
                    <div class="text-sm text-blue-600">9:00 AM - 9:30 AM</div>
                  </div>
                </div>
                <span
                  class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >Work</span
                >
              </div>

              <div
                class="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div class="font-medium text-green-900">
                      Client Presentation
                    </div>
                    <div class="text-sm text-green-600">2:00 PM - 3:00 PM</div>
                  </div>
                </div>
                <span
                  class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                  >Meeting</span
                >
              </div>

              <div
                class="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <div class="font-medium text-purple-900">
                      Sprint Planning
                    </div>
                    <div class="text-sm text-purple-600">4:00 PM - 5:30 PM</div>
                  </div>
                </div>
                <span
                  class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                  >Planning</span
                >
              </div>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <NuxtLink
              to="/auth/register"
              class="bg-primary-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-900 transition-colors"
            >
              Start Free Trial
            </NuxtLink>
            <NuxtLink
              to="/auth/login"
              class="bg-cream-200 text-primary-800 px-8 py-3 rounded-lg font-semibold hover:bg-cream-300 transition-colors"
            >
              Sign In
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Simple demo page for MeetGrid without complex logic
definePageMeta({
  layout: "default",
});
</script>
