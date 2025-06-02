<template>
  <div>
    <section
      class="py-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white"
    >
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          Professional Calendar Scheduling
        </h1>
        <p class="text-xl mb-8 max-w-3xl mx-auto">
          Streamline your meetings and appointments with MeetGrid. The
          professional way to manage your calendar with Google Calendar
          integration.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <NuxtLink
            to="/auth/register"
            class="px-8 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started
          </NuxtLink>
          <NuxtLink
            to="/auth/login"
            class="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
          >
            Login
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="py-16 container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Key Features</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="p-6 border border-gray-200 rounded-lg">
          <h3 class="text-xl font-bold mb-3">Personal Schedules</h3>
          <p class="text-gray-600">
            Create and manage your personal schedules with an easy-to-use
            interface. Set up recurring events, reminders, and notifications.
          </p>
        </div>

        <div class="p-6 border border-gray-200 rounded-lg">
          <h3 class="text-xl font-bold mb-3">Group Sharing</h3>
          <p class="text-gray-600">
            Share your schedules with groups of people. Perfect for teams,
            projects, families, or any group that needs to coordinate.
          </p>
        </div>

        <div class="p-6 border border-gray-200 rounded-lg">
          <h3 class="text-xl font-bold mb-3">Real-Time Updates</h3>
          <p class="text-gray-600">
            All changes are updated in real time. Never miss an important
            schedule change again with instant notifications.
          </p>
        </div>
      </div>
    </section>

    <section class="py-16 bg-gray-100">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">How It Works</h2>

        <div class="max-w-3xl mx-auto">
          <ol class="relative border-l border-gray-300">
            <li class="mb-10 ml-6">
              <div
                class="absolute w-6 h-6 bg-blue-600 rounded-full -left-3 flex items-center justify-center"
              >
                <span class="text-white font-bold">1</span>
              </div>
              <h3 class="font-bold text-xl mb-1">Create an Account</h3>
              <p class="text-gray-600">
                Sign up for a free account and set your preferences.
              </p>
            </li>
            <li class="mb-10 ml-6">
              <div
                class="absolute w-6 h-6 bg-blue-600 rounded-full -left-3 flex items-center justify-center"
              >
                <span class="text-white font-bold">2</span>
              </div>
              <h3 class="font-bold text-xl mb-1">Create Your Schedules</h3>
              <p class="text-gray-600">
                Build your personal or work schedules with our intuitive
                interface.
              </p>
            </li>
            <li class="mb-10 ml-6">
              <div
                class="absolute w-6 h-6 bg-blue-600 rounded-full -left-3 flex items-center justify-center"
              >
                <span class="text-white font-bold">3</span>
              </div>
              <h3 class="font-bold text-xl mb-1">Share with Others</h3>
              <p class="text-gray-600">
                Create groups and share your schedules with team members,
                friends, or family.
              </p>
            </li>
            <li class="ml-6">
              <div
                class="absolute w-6 h-6 bg-blue-600 rounded-full -left-3 flex items-center justify-center"
              >
                <span class="text-white font-bold">4</span>
              </div>
              <h3 class="font-bold text-xl mb-1">Stay Coordinated</h3>
              <p class="text-gray-600">
                Receive notifications for changes and updates. Never miss an
                important event.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <section class="py-16 container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-6">Ready to Get Started?</h2>
      <p class="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
        Join MySched today and take control of your scheduling.
      </p>
      <NuxtLink
        to="/auth/register"
        class="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Sign Up Now
      </NuxtLink>
    </section>
  </div>
</template>

<script setup>
// Define route meta for title
definePageMeta({
  title: "Home",
});
</script>
