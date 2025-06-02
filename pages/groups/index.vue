<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">My Groups</h1>

    <div class="mb-6">
      <button
        @click="isCreatingGroup = true"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create New Group
      </button>
    </div>

    <div class="bg-white border rounded-lg p-8 text-center">
      <p class="text-lg text-gray-600 mb-4">
        Group management features are coming soon!
      </p>
      <p class="text-gray-600">
        You'll be able to create groups, add members, and share your schedules
        with them. Stay tuned for updates.
      </p>
    </div>

    <!-- Create Group Dialog Placeholder -->
    <div
      v-if="isCreatingGroup"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Create New Group</h2>

        <p class="mb-6 text-gray-600">
          Group creation is coming soon. This feature is not yet available.
        </p>

        <div class="flex justify-end">
          <button
            @click="isCreatingGroup = false"
            class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Define route meta for title and middleware
definePageMeta({
  title: "My Groups",
  middleware: ["auth"],
});

// State
const isCreatingGroup = ref(false);
</script>
