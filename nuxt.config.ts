// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils'
  ],

  tailwindcss: {
    configPath: './tailwind.config.js'
  },

  css: ['~/assets/css/main-minimal.css'],
  
  app: {
    head: {
      title: 'MeetGrid - Professional Calendar Scheduling',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Professional calendar scheduling app with Google Calendar integration. Plan, schedule, and organize your meetings efficiently.' },
        { name: 'theme-color', content: '#254D70' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/icon-192x192.png' },
        { rel: 'manifest', href: '/manifest.json' }
      ]
    }
  },
  
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production',
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    public: {
      apiBaseUrl: process.env.API_BASE_URL || '',
      googleClientId: process.env.GOOGLE_CLIENT_ID
    }
  },

  // Static Site Generation for Capacitor
  nitro: {
    preset: 'static',
    prerender: {
      failOnError: false
    }
  }
})