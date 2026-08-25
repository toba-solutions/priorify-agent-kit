import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repository = "https://github.com/toba-solutions/priorify-agent-kit";
const mcpEndpoint = "https://priorify.app/mcp";
const expectedSkills = [
  "priorify-product-operations",
  "priorify-social-planning",
  "priorify-agent-work",
];
const platformFiles = {
  "agent-plugin": ["plugin.json", "mcp.json", "README.md", "LICENSE"],
  openai: [".codex-plugin/plugin.json", ".mcp.json", "README.md", "LICENSE"],
  claude: [".claude-plugin/plugin.json", ".mcp.json", "README.md", "LICENSE"],
  gemini: ["gemini-extension.json", "README.md", "LICENSE"],
};

function fail(message) {
  throw new Error(message);
}

async function json(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    fail(`${relative(root, path)} is not valid JSON: ${error.message}`);
  }
}

function frontmatter(markdown, path) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) fail(`${relative(root, path)} has no YAML frontmatter.`);
  const values = Object.fromEntries(
    match[1]
      .split("\n")
      .map((line) => line.match(/^([a-z][a-z0-9_-]*):\s*(.+)$/))
      .filter(Boolean)
      .map((entry) => [entry[1], entry[2]]),
  );
  if (!values.name || !values.description) {
    fail(`${relative(root, path)} must define name and description.`);
  }
  return values;
}

async function filesUnder(path, base = path) {
  const entries = await readdir(path, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "dist", "node_modules"].includes(entry.name)) continue;
    const absolute = join(path, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(absolute, base)));
    if (entry.isFile()) files.push(relative(base, absolute));
  }
  return files.sort();
}

const packageManifest = await json(join(root, "package.json"));
const manifests = [
  await json(join(root, "plugin.json")),
  await json(join(root, ".codex-plugin", "plugin.json")),
  await json(join(root, ".claude-plugin", "plugin.json")),
  await json(join(root, "gemini-extension.json")),
];
const versions = new Set([
  packageManifest.version,
  ...manifests.map((manifest) => manifest.version),
]);
if (versions.size !== 1 || !/^\d+\.\d+\.\d+$/.test(packageManifest.version)) {
  fail("All manifests must share one strict semantic version.");
}
if (packageManifest.repository !== repository) {
  fail("package.json has the wrong public repository URL.");
}
for (const manifest of manifests.slice(0, 3)) {
  if (manifest.repository !== repository) fail("A plugin manifest has the wrong repository URL.");
  if (manifest.license !== "MIT") fail("Every publishable plugin manifest must declare MIT.");
}

const portableMcp = await json(join(root, "mcp.json"));
const nativeMcp = await json(join(root, ".mcp.json"));
if (
  portableMcp.mcpServers?.priorify?.type !== "streamable-http" ||
  portableMcp.mcpServers?.priorify?.url !== mcpEndpoint
) {
  fail("mcp.json must declare the portable Streamable HTTP Priorify endpoint.");
}
if (
  nativeMcp.mcpServers?.priorify?.type !== "http" ||
  nativeMcp.mcpServers?.priorify?.url !== mcpEndpoint
) {
  fail(".mcp.json must declare the native HTTP Priorify endpoint.");
}
if (manifests[3].mcpServers?.priorify?.httpUrl !== mcpEndpoint) {
  fail("gemini-extension.json must declare the Priorify HTTP endpoint.");
}

const skillDirectories = (await readdir(join(root, "skills"), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
if (JSON.stringify(skillDirectories.sort()) !== JSON.stringify([...expectedSkills].sort())) {
  fail("The canonical skills directory has an unexpected skill set.");
}

for (const skillName of expectedSkills) {
  const skillPath = join(root, "skills", skillName, "SKILL.md");
  const markdown = await readFile(skillPath, "utf8");
  const metadata = frontmatter(markdown, skillPath);
  if (metadata.name !== skillName) fail(`${skillName} does not match its directory name.`);
  const openaiPath = join(root, "skills", skillName, "agents", "openai.yaml");
  const openai = await readFile(openaiPath, "utf8");
  if (!openai.includes(`$${skillName}`)) fail(`${skillName} UI metadata must explicitly invoke the skill.`);
  if (!openai.includes(mcpEndpoint)) fail(`${skillName} UI metadata must declare the MCP dependency.`);

  for (const platform of Object.keys(platformFiles)) {
    const generated = join(root, "dist", "packages", platform, "skills", skillName, "SKILL.md");
    if ((await readFile(generated, "utf8")) !== markdown) {
      fail(`${relative(root, generated)} differs from the canonical skill.`);
    }
  }
}

for (const [platform, requiredFiles] of Object.entries(platformFiles)) {
  const packageRoot = join(root, "dist", "packages", platform);
  for (const file of requiredFiles) await readFile(join(packageRoot, file));
  const generatedSkills = (await readdir(join(packageRoot, "skills"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (JSON.stringify(generatedSkills) !== JSON.stringify([...expectedSkills].sort())) {
    fail(`${platform} package has an unexpected skill set.`);
  }
}

const publicFiles = await filesUnder(root);
const secretAssignment = /(?:access_token|refresh_token|client_secret|private_key)\s*[:=]\s*["'][^"']+["']/i;
for (const file of publicFiles) {
  if (file === "scripts/validate.mjs") continue;
  const content = await readFile(join(root, file), "utf8").catch(() => "");
  if (secretAssignment.test(content) || content.includes("-----BEGIN PRIVATE KEY-----")) {
    fail(`${file} appears to contain credential material.`);
  }
}

const digest = createHash("sha256")
  .update(
    (
      await Promise.all(
        expectedSkills.map((name) => readFile(join(root, "skills", name, "SKILL.md"), "utf8")),
      )
    ).join("\n"),
  )
  .digest("hex");

console.log(
  `Validated Priorify Agent Kit ${packageManifest.version}: ${expectedSkills.length} skills, ${Object.keys(platformFiles).length} packages, source digest ${digest.slice(0, 12)}.`,
);
