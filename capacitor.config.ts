import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'meetgrid.app',
  appName: 'MeetGrid',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    // For development testing - comment out for production builds
    url: 'http://localhost:3003',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#EFE4D2",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#254D70"
    },
    StatusBar: {
      backgroundColor: "#254D70",
      style: "dark"
    }
  }
};

export default config;
