<template>
  <div class="fixed top-4 right-4 z-50 w-72">
    <transition-group name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification mb-2 p-4 rounded-lg shadow-lg text-white flex"
        :class="{
          'bg-green-600': notification.type === 'success',
          'bg-red-600': notification.type === 'error',
          'bg-blue-600': notification.type === 'info',
          'bg-yellow-600': notification.type === 'warning',
        }"
      >
        <div class="flex-grow">
          <div class="font-bold">{{ notification.title }}</div>
          <div v-if="notification.message">{{ notification.message }}</div>
        </div>
        <button
          @click="removeNotification(notification.id)"
          class="ml-2 text-white"
        >
          &times;
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useNotifications } from "~/composables/useNotifications";

const { notifications, removeNotification } = useNotifications();
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}
.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
