export default {
  expo: {
    name: "BeadForge",
    slug: "beadforge",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      backgroundColor: "#4b78ff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.beadforge.app"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#4b78ff"
      },
      package: "com.beadforge.app"
    },
    plugins: [
      "expo-asset",
      "expo-font"
    ],
    extra: {
      APP_ENV: process.env.APP_ENV || "local",
    },
  },
};
