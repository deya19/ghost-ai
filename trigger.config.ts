import { defineConfig } from "@trigger.dev/sdk"
import { prismaExtension } from "@trigger.dev/build/extensions/prisma"

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_xxxxxx",
  dirs: ["trigger"],
  runtime: "node-22",
  logLevel: "info",
  maxDuration: 3600,

  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
    },
  },

  build: {
    external: ["@prisma/client", "@prisma/adapter-pg"],
    extensions: [
      prismaExtension({
        mode: "legacy",
        schema: "prisma/schema.prisma",
        migrate: false,
      }),
    ],
  },
})
