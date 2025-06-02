<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-primary text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <NuxtLink to="/" class="text-2xl font-bold">MeetGrid</NuxtLink>
        <nav class="flex gap-4">
          <template v-if="isAuthenticated">
            <NuxtLink to="/dashboard" class="hover:underline"
              >Dashboard</NuxtLink
            >
            <NuxtLink to="/schedule" class="hover:underline"
              >My Schedules</NuxtLink
            >
            <NuxtLink to="/groups" class="hover:underline">Groups</NuxtLink>
            <NuxtLink to="/associations" class="hover:underline"
              >Connections</NuxtLink
            >
            <div class="relative group">
              <button class="hover:underline flex items-center">
                Account
                <span class="ml-1">▾</span>
              </button>
              <div
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10"
              >
                <div class="py-1">
                  <NuxtLink
                    to="/profile"
                    class="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Profile Settings
                  </NuxtLink>
                  <button
                    @click="logout"
                    class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login" class="hover:underline">Login</NuxtLink>
            <NuxtLink to="/auth/register" class="hover:underline"
              >Register</NuxtLink
            >
          </template>
        </nav>
      </div>
    </header>

    <main class="flex-grow container mx-auto p-4">
      <slot />
    </main>

    <footer class="bg-gray-100 p-4 text-center text-gray-600">
      <div class="container mx-auto">
        <p>
          &copy; {{ new Date().getFullYear() }} MeetGrid. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuth } from "~/composables/useAuth";

const { isAuthenticated, logout } = useAuth();
</script>
