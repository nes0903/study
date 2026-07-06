import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptRoot, "..");
const studyRoot = path.resolve(appRoot, "..");
const shouldEmbed = process.argv.includes("--embed");

function run(args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`$ npx ${args.join(" ")}`);
    const child = spawn("npx", args, {
      cwd: studyRoot,
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0 || options.allowFailure) {
        resolve(code);
        return;
      }
      reject(new Error(`Command failed with exit code ${code}`));
    });
  });
}

async function main() {
  await run(["--yes", "@tobilu/qmd", "init"], { allowFailure: true });
  await run(["--yes", "@tobilu/qmd", "collection", "add", studyRoot, "--name", "study"], {
    allowFailure: true,
  });
  await run(["--yes", "@tobilu/qmd", "update"]);

  if (shouldEmbed) {
    await run([
      "--yes",
      "@tobilu/qmd",
      "embed",
      "-c",
      "study",
      "--max-docs-per-batch",
      "64",
      "--max-batch-mb",
      "16",
    ]);
  } else {
    console.log("Skipping embeddings. Run `npm run qmd:embed` when you are ready for vector search.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
