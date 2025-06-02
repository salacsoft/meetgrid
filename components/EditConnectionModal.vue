<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div
        class="flex justify-between items-center p-6 border-b border-gray-200"
      >
        <h2 class="text-xl font-semibold text-gray-900">Edit Connection</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
      </div>

      <div class="p-6">
        <div class="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <div
            class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
          >
            <Icon name="heroicons:user" class="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ displayName }}</p>
            <p class="text-sm text-gray-600">{{ connection.email }}</p>
          </div>
        </div>

        <form @submit.prevent="updateConnection" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
            </label>
            <select v-model="form.relationshipType" class="input-field w-full">
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
              Notes
            </label>
            <textarea
              v-model="form.notes"
              placeholder="Add notes about this connection..."
              rows="3"
              class="input-field w-full"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="btn-primary flex-1"
            >
              <span v-if="isLoading">Updating...</span>
              <span v-else>Update Connection</span>
            </button>
            <button type="button" @click="$emit('close')" class="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserAssociations } from "~/composables/useUserAssociations";

// Props
const props = defineProps({
  connection: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(["close", "updated"]);

// Composables
const { isLoading, updateAssociation, getDisplayName } = useUserAssociations();

// Local state
const form = ref({
  relationshipType: props.connection.relationship_type || "colleague",
  notes: props.connection.notes || "",
});

// Computed
const displayName = computed(() => getDisplayName(props.connection));

// Methods
const updateConnection = async () => {
  try {
    await updateAssociation(props.connection.id, {
      relationshipType: form.value.relationshipType,
      notes: form.value.notes,
    });
    emit("updated");
  } catch (err) {
    console.error("Failed to update connection:", err);
  }
};

// Initialize form with connection data
onMounted(() => {
  form.value = {
    relationshipType: props.connection.relationship_type || "colleague",
    notes: props.connection.notes || "",
  };
});
</script>
