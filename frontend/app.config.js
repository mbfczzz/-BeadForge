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
      "expo-font",
      [
        "expo-image-picker",
        {
          photosPermission: "允许 BeadForge 访问你的相册，用于选择和裁切头像。"
        }
      ],
      // 测试环境 API 是 http://，Android 9+ release 包默认禁明文，必须显式打开
      // 上 HTTPS 后请收回（或改 networkSecurityConfig 只放行特定域名）
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true
          }
        }
      ]
    ],
    extra: {
      APP_ENV: process.env.APP_ENV || "local",
    },
  },
};
