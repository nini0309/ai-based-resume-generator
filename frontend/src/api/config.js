let config = {
  API_BASE_URL: "http://127.0.0.1:5000", // fallback default
};

export async function loadConfig() {
  try {
    const response = await fetch("/config.json", { cache: "no-cache" });
    if (response.ok) {
      const json = await response.json();
      config = { ...config, ...json };
      console.log("Loaded config:", config);
    } else {
      console.warn("Config file not found, using defaults.");
    }
  } catch (err) {
    console.warn("Failed to load config.json, using defaults.", err);
  }
}

export function getConfig() {
  return config;
}
