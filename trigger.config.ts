import { defineConfig } from "@trigger.dev/sdk"

export default defineConfig({
  // Replace with your project ref from https://cloud.trigger.dev
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_xxxxxx",
  dirs: ["trigger"],
  runtime: "node",
  logLevel: "info",
  maxDuration: 3600, // seconds

  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
    },
  },
})
