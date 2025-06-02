<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div
        class="flex justify-between items-center p-6 border-b border-gray-200"
      >
        <h2 class="text-xl font-semibold text-gray-900">Add Connection</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
      </div>

      <div class="p-6">
        <!-- Search Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Search for users
          </label>
          <input
            v-model="searchTerm"
            @input="debouncedSearch"
            type="text"
            placeholder="Enter name or email..."
            class="input-field w-full"
          />
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="space-y-3 mb-6">
          <h3 class="text-sm font-medium text-gray-700">Search Results</h3>
          <div class="max-h-64 overflow-y-auto">
            <div
              v-for="user in searchResults"
              :key="user.id"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                >
                  <Icon name="heroicons:user" class="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ user.full_name || user.username }}
                  </p>
                  <p class="text-sm text-gray-600">{{ user.email }}</p>
                </div>
              </div>
              <div>
                <button
                  v-if="!user.association_status"
                  @click="selectUser(user)"
                  class="btn-primary text-sm"
                >
                  Connect
                </button>
                <span
                  v-else-if="user.association_status === 'pending'"
                  class="text-sm text-yellow-600 font-medium"
                >
                  Pending
                </span>
                <span
                  v-else-if="user.association_status === 'accepted'"
                  class="text-sm text-green-600 font-medium"
                >
                  Connected
                </span>
                <span v-else class="text-sm text-gray-500 font-medium">
                  {{ user.association_status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="searchTerm && !isLoading" class="text-center py-6">
          <Icon
            name="heroicons:magnifying-glass"
            class="w-12 h-12 text-gray-400 mx-auto mb-3"
          />
          <p class="text-gray-600">No users found for "{{ searchTerm }}"</p>
        </div>

        <!-- Connection Request Form -->
        <div v-if="selectedUser" class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Send connection request to
            {{ selectedUser.full_name || selectedUser.username }}
          </h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Relationship Type
              </label>
              <select v-model="relationshipType" class="input-field w-full">
                <option value="colleague">Colleague</option>
                <option value="friend">Friend</option>
                <option value="family">Family</option>
                <option value="client">Client</option>
                <option value="manager">Manager</option>
                <option value="team_member">Team Member</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                v-model="notes"
                placeholder="Add a personal message..."
                rows="3"
                class="input-field w-full"
              ></textarea>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="sendRequest"
                :disabled="isLoading"
                class="btn-primary flex-1"
              >
                <span v-if="isLoading">Sending...</span>
                <span v-else>Send Request</span>
              </button>
              <button @click="selectedUser = null" class="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center py-6">
          <div
            class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { debounce } from "lodash-es";
import { useUserAssociations } from "~/composables/useUserAssociations";

// Emits
const emit = defineEmits(["close", "request-sent"]);

// Composables
const {
  searchResults,
  isLoading,
  error,
  searchUsers,
  sendRequest: sendRequestFn,
} = useUserAssociations();

// Local state
const searchTerm = ref("");
const selectedUser = ref(null);
const relationshipType = ref("colleague");
const notes = ref("");

// Methods
const debouncedSearch = debounce(async () => {
  if (searchTerm.value.trim()) {
    await searchUsers(searchTerm.value);
  }
}, 300);

const selectUser = (user) => {
  selectedUser.value = user;
};

const sendRequest = async () => {
  if (!selectedUser.value) return;

  try {
    await sendRequestFn(
      selectedUser.value.id,
      relationshipType.value,
      notes.value || undefined
    );
    emit("request-sent");
  } catch (err) {
    // Error will be handled by the parent component
    console.error("Failed to send request:", err);
  }
};

// Watch for search term changes
watch(searchTerm, (newTerm) => {
  if (!newTerm.trim()) {
    selectedUser.value = null;
  }
});
</script>
