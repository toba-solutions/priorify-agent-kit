import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(root, "dist", "packages");

const packages = {
  "agent-plugin": ["plugin.json", "mcp.json"],
  openai: [".codex-plugin", ".mcp.json"],
  claude: [".claude-plugin", ".mcp.json"],
  gemini: ["gemini-extension.json"],
};

async function copyEntry(source, destination) {
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const [platform, entries] of Object.entries(packages)) {
  const destination = join(outputRoot, platform);
  await mkdir(destination, { recursive: true });
  await copyEntry(join(root, "skills"), join(destination, "skills"));
  await copyEntry(join(root, "LICENSE"), join(destination, "LICENSE"));
  await copyEntry(
    join(root, "packaging", platform, "README.md"),
    join(destination, "README.md"),
  );
  for (const entry of entries) {
    await copyEntry(join(root, entry), join(destination, entry));
  }
}

const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
await writeFile(
  join(root, "dist", "BUILD_INFO.json"),
  `${JSON.stringify(
    {
      name: manifest.name,
      version: manifest.version,
      packages: Object.keys(packages),
      source: manifest.repository,
    },
    null,
    2,
  )}\n`,
);

const built = await readdir(outputRoot);
console.log(
  `Built ${built.length} Priorify ${built.length === 1 ? "package" : "packages"} in ${relative(root, outputRoot)}.`,
);
