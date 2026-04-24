const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const isWindows = process.platform === "win32";
const doctorMode = process.argv.includes("--doctor");
const passthroughArgs = process.argv.slice(2).filter((arg) => arg !== "--doctor");

function pathExists(targetPath) {
  if (!targetPath) {
    return false;
  }

  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getAdbPath(sdkRoot) {
  return path.join(
    sdkRoot,
    "platform-tools",
    isWindows ? "adb.exe" : "adb",
  );
}

function isSdkRoot(candidate) {
  return pathExists(getAdbPath(candidate));
}

function getWindowsStudioCandidates() {
  const appData = process.env.APPDATA;
  if (!appData) {
    return [];
  }

  const googleDir = path.join(appData, "Google");
  if (!pathExists(googleDir)) {
    return [];
  }

  const studioDirs = fs
    .readdirSync(googleDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("AndroidStudio"))
    .map((entry) => path.join(googleDir, entry.name))
    .sort()
    .reverse();

  const candidates = [];
  for (const studioDir of studioDirs) {
    const sdkPathFile = path.join(studioDir, "options", "android.sdk.path.xml");
    if (!pathExists(sdkPathFile)) {
      continue;
    }

    try {
      const content = fs.readFileSync(sdkPathFile, "utf8");
      const match = content.match(/androidSdkAbsolutePath" value="([^"]+)"/);
      if (match && match[1]) {
        candidates.push(match[1]);
      }
    } catch {
      // Ignore unreadable Studio config files and continue probing.
    }
  }

  return candidates;
}

function getDefaultCandidates() {
  const homeDir = os.homedir();
  const localAppData = process.env.LOCALAPPDATA;

  if (isWindows) {
    return [
      localAppData && path.join(localAppData, "Android", "Sdk"),
      "D:\\adsV",
    ];
  }

  if (process.platform === "darwin") {
    return [path.join(homeDir, "Library", "Android", "sdk")];
  }

  return [path.join(homeDir, "Android", "Sdk")];
}

function resolveAndroidSdk() {
  const candidates = unique([
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    ...getWindowsStudioCandidates(),
    ...getDefaultCandidates(),
  ]);

  for (const candidate of candidates) {
    if (isSdkRoot(candidate)) {
      return candidate;
    }
  }

  return null;
}

function prependToPath(env, entries) {
  const delimiter = path.delimiter;
  const current = env.PATH || env.Path || "";
  const normalizedCurrent = current
    .split(delimiter)
    .filter(Boolean);

  env.PATH = unique([...entries, ...normalizedCurrent]).join(delimiter);
  if (isWindows) {
    env.Path = env.PATH;
  }
}

function runAdbVersion(env, adbPath) {
  const result = spawnSync(adbPath, ["version"], {
    env,
    encoding: "utf8",
  });

  if (result.error) {
    console.error(result.error.message);
  }

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  return result.status ?? 1;
}

const sdkRoot = resolveAndroidSdk();

if (!sdkRoot) {
  console.error("Failed to resolve Android SDK path.");
  console.error("Set ANDROID_HOME or install the SDK through Android Studio.");
  process.exit(1);
}

const adbPath = getAdbPath(sdkRoot);
const env = { ...process.env };
env.ANDROID_HOME = sdkRoot;
env.ANDROID_SDK_ROOT = sdkRoot;
prependToPath(env, [
  path.join(sdkRoot, "platform-tools"),
  path.join(sdkRoot, "emulator"),
]);

console.log(`Using Android SDK: ${sdkRoot}`);
console.log(`Using adb: ${adbPath}`);

if (doctorMode) {
  const status = runAdbVersion(env, adbPath);
  process.exit(status);
}

const npxCommand = isWindows ? "npx.cmd" : "npx";
const child = spawn(
  npxCommand,
  ["expo", "start", "--android", ...passthroughArgs],
  {
    stdio: "inherit",
    env,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
