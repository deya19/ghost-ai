import {
  defineConfig
} from "../../chunk-FH2IPZXU.mjs";
import "../../chunk-5A54AS5L.mjs";
import {
  init_esm
} from "../../chunk-4DNCWKMJ.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  // Replace with your project ref from https://cloud.trigger.dev
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_xxxxxx",
  dirs: ["trigger"],
  runtime: "node",
  logLevel: "info",
  // seconds
  maxDuration: 3600,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 1e4,
      factor: 2
    }
  },
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
