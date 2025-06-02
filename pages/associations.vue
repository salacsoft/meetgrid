<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">My Connections</h1>
      <button
        @click="showSearchModal = true"
        class="btn-primary flex items-center gap-2"
      >
        <Icon name="heroicons:plus" class="w-5 h-5" />
        Add Connection
      </button>
    </div>

    <!-- Pending Requests Section -->
    <div v-if="pendingRequests.length > 0" class="mb-8">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2
          class="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2"
        >
          <Icon name="heroicons:clock" class="w-5 h-5" />
          Pending Requests ({{ pendingRequests.length }})
        </h2>
        <div class="space-y-3">
          <div
            v-for="request in pendingRequests"
            :key="request.id"
            class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
              >
                <Icon name="heroicons:user" class="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">
                  {{ getDisplayName(request) }}
                </p>
                <p class="text-sm text-gray-600">
                  Wants to connect as
                  {{ getRelationshipTypeLabel(request.relationship_type) }}
                </p>
                <p v-if="request.notes" class="text-sm text-gray-500 mt-1">
                  "{{ request.notes }}"
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="acceptRequest(request.id)"
                :disabled="isLoading"
                class="btn-primary text-sm"
              >
                Accept
              </button>
              <button
                @click="rejectRequest(request.id)"
                :disabled="isLoading"
                class="btn-secondary text-sm"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Connections by Type -->
    <div class="space-y-8">
      <div
        v-for="(connections, type) in associationsByType"
        :key="type"
        class="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div class="px-6 py-4 border-b border-gray-200">
          <h3
            class="text-lg font-semibold text-gray-900 flex items-center gap-2"
          >
            <Icon :name="getTypeIcon(type)" class="w-5 h-5" />
            {{ getRelationshipTypeLabel(type) }}s
            <span class="text-sm font-normal text-gray-600"
              >({{ connections.length }})</span
            >
          </h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="connection in connections"
              :key="connection.id"
              class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                >
                  <Icon name="heroicons:user" class="w-6 h-6 text-gray-600" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">
                    {{ getDisplayName(connection) }}
                  </p>
                  <p class="text-sm text-gray-600">{{ connection.email }}</p>
                </div>
              </div>

              <div v-if="connection.notes" class="mb-3">
                <p class="text-sm text-gray-600">"{{ connection.notes }}"</p>
              </div>

              <div class="flex justify-between items-center">
                <button
                  @click="
                    selectedConnection = connection;
                    showEditModal = true;
                  "
                  class="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  @click="confirmRemove(connection)"
                  class="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="acceptedAssociations.length === 0 && !isLoading"
      class="text-center py-12"
    >
      <Icon
        name="heroicons:users"
        class="w-16 h-16 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
      <p class="text-gray-600 mb-6">
        Start building your professional network by adding connections.
      </p>
      <button @click="showSearchModal = true" class="btn-primary">
        Add Your First Connection
      </button>
    </div>

    <!-- Search Modal -->
    <UserSearchModal
      v-if="showSearchModal"
      @close="showSearchModal = false"
      @request-sent="onRequestSent"
    />

    <!-- Edit Modal -->
    <EditConnectionModal
      v-if="showEditModal && selectedConnection"
      :connection="selectedConnection"
      @close="
        showEditModal = false;
        selectedConnection = null;
      "
      @updated="onConnectionUpdated"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      ></div>
    </div>

    <!-- Error Message -->
    <UiNotifications />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useUserAssociations } from "~/composables/useUserAssociations";
import { useNotifications } from "~/composables/useNotifications";

// Set page meta
definePageMeta({
  middleware: "auth",
  layout: "default",
});

// Composables
const {
  associations,
  pendingRequests,
  acceptedAssociations,
  associationsByType,
  isLoading,
  error,
  loadAssociations,
  loadPendingRequests,
  acceptRequest: acceptRequestFn,
  removeAssociation,
  getDisplayName,
  getRelationshipTypeLabel,
} = useUserAssociations();

const { addNotification } = useNotifications();

// Local state
const showSearchModal = ref(false);
const showEditModal = ref(false);
const selectedConnection = ref(null);

// Methods
const acceptRequest = async (requestId) => {
  try {
    await acceptRequestFn(requestId);
    addNotification({
      type: "success",
      message: "Connection request accepted!",
    });
    await loadPendingRequests();
    await loadAssociations();
  } catch (err) {
    addNotification({
      type: "error",
      message: "Failed to accept request. Please try again.",
    });
  }
};

const rejectRequest = async (requestId) => {
  try {
    await removeAssociation(requestId);
    addNotification({
      type: "success",
      message: "Connection request declined.",
    });
    await loadPendingRequests();
  } catch (err) {
    addNotification({
      type: "error",
      message: "Failed to decline request. Please try again.",
    });
  }
};

const confirmRemove = (connection) => {
  if (
    confirm(
      `Are you sure you want to remove ${getDisplayName(
        connection
      )} from your connections?`
    )
  ) {
    removeConnection(connection.id);
  }
};

const removeConnection = async (connectionId) => {
  try {
    await removeAssociation(connectionId);
    addNotification({
      type: "success",
      message: "Connection removed successfully.",
    });
    await loadAssociations();
  } catch (err) {
    addNotification({
      type: "error",
      message: "Failed to remove connection. Please try again.",
    });
  }
};

const onRequestSent = () => {
  addNotification({
    type: "success",
    message: "Connection request sent!",
  });
  showSearchModal.value = false;
};

const onConnectionUpdated = () => {
  addNotification({
    type: "success",
    message: "Connection updated successfully!",
  });
  showEditModal.value = false;
  selectedConnection.value = null;
  loadAssociations();
};

const getTypeIcon = (type) => {
  const icons = {
    colleague: "heroicons:briefcase",
    friend: "heroicons:heart",
    family: "heroicons:home",
    client: "heroicons:building-office",
    manager: "heroicons:star",
    team_member: "heroicons:user-group",
  };
  return icons[type] || "heroicons:users";
};

// Watch for errors
watch(error, (newError) => {
  if (newError) {
    addNotification({
      type: "error",
      message: newError,
    });
  }
});

// Load data on mount
onMounted(async () => {
  await Promise.all([loadAssociations(), loadPendingRequests()]);
});
</script>
