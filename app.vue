<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UiNotifications />
  </div>
</template>

<style>
/* Base styles */
html {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
}

body {
  margin: 0;
  line-height: 1.6;
  color: #1a202c;
  background-color: #f8fafc;
}

/* Global focus styles */
*:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

button {
  cursor: pointer;
}
</style>
