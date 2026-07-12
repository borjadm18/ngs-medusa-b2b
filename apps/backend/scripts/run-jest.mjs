import { spawnSync } from "node:child_process";

const testType = process.argv[2] ?? "unit";
const extraArgs = process.argv.slice(3);
const existingNodeOptions = process.env.NODE_OPTIONS ?? "";

process.env.TEST_TYPE = testType;
process.env.NODE_OPTIONS = [
  existingNodeOptions,
  "--experimental-vm-modules",
]
  .filter(Boolean)
  .join(" ");

const result = spawnSync(
  "jest",
  [
    "--silent=false",
    "--runInBand",
    "--forceExit",
    ...extraArgs,
  ],
  {
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  }
);

process.exit(result.status ?? 1);
