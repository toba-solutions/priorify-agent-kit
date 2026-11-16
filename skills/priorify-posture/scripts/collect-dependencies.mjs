#!/usr/bin/env node
// Priorify.app Agent Kit: collect a repository's dependency inventory.
//
// Read-only. Reads lockfiles under the given directory (default: the current
// one) and prints exactly one JSON object, {"inventory":[...]}, in the posture
// snapshot contract: ecosystem, name and exact version of every locked
// package. It reads no source code, no environment and no secrets, and makes
// no network calls. Report the output with report_component_posture on the
// app's component; Priorify.app matches it against known vulnerabilities.
//
// Lockfiles: package-lock.json, npm-shrinkwrap.json, yarn.lock (v1 and Berry),
// pnpm-lock.yaml, requirements*.txt (== pins), poetry.lock, uv.lock,
// Pipfile.lock, Cargo.lock, go.sum.
//
//   node collect-dependencies.mjs [repo-directory]

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const LIMIT = 5000;
const SKIP = new Set(["node_modules", ".git", "vendor", "dist", "build", ".next", ".venv", "venv", "target", ".claude", "coverage"]);
const root = process.argv[2] || ".";
const found = new Map();

function add(ecosystem, name, version) {
  if (!name || !version || found.size >= LIMIT) return;
  const cleanName = String(name).trim().slice(0, 200);
  const cleanVersion = String(version).trim().replace(/^=+/, "").slice(0, 100);
  if (!cleanName || !cleanVersion || /[\s"\\]/.test(cleanVersion)) return;
  found.set(`${ecosystem}\u0000${cleanName}\u0000${cleanVersion}`, { ecosystem, name: cleanName, version: cleanVersion });
}

function read(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

// npm: lockfile v2/v3 "packages", v1 "dependencies".
function npmLock(text) {
  const lock = JSON.parse(text);
  if (lock.packages) {
    for (const [path, entry] of Object.entries(lock.packages)) {
      if (!path || entry.link || !entry.version) continue;
      const name = entry.name || path.split("node_modules/").pop();
      add("npm", name, entry.version);
    }
    return;
  }
  const walk = (deps) => {
    for (const [name, entry] of Object.entries(deps || {})) {
      if (entry.version && !String(entry.version).startsWith("file:")) add("npm", name, entry.version);
      walk(entry.dependencies);
    }
  };
  walk(lock.dependencies);
}

// yarn v1 ("name@range", version "x") and Berry ("name@npm:range", version: x).
function yarnLock(text) {
  let names = [];
  for (const line of text.split("\n")) {
    if (line && !line.startsWith(" ") && !line.startsWith("#") && line.trimEnd().endsWith(":")) {
      names = line
        .slice(0, -1)
        .split(",")
        .map((spec) => spec.trim().replace(/^"|"$/g, ""))
        .map((spec) => spec.slice(0, spec.lastIndexOf("@") > 0 ? spec.lastIndexOf("@") : spec.length))
        .filter((name) => name && name !== "__metadata");
      continue;
    }
    const version = /^\s+version:?\s+"?([^"\s]+)"?/.exec(line);
    if (version && names.length) {
      if (!/^0\.0\.0-use\.local/.test(version[1])) add("npm", names[0], version[1]);
      names = [];
    }
  }
}

// pnpm: keys under "packages:" such as "/name@1.2.3", "name@1.2.3" or "/@scope/name@1.2.3(peer)".
function pnpmLock(text) {
  let inPackages = false;
  for (const line of text.split("\n")) {
    if (/^\S/.test(line)) inPackages = /^(packages|snapshots):\s*$/.test(line);
    if (!inPackages) continue;
    const key = /^ {2}['"]?\/?((?:@[^/@\s]+\/)?[^@\s'"]+)@([^('":\s]+)/.exec(line);
    if (key) add("npm", key[1], key[2]);
  }
}

function requirements(text) {
  for (const line of text.split("\n")) {
    const pin = /^\s*([A-Za-z0-9][A-Za-z0-9._-]*)(?:\[[^\]]*\])?\s*==\s*([^\s;#,]+)/.exec(line);
    if (pin) add("pypi", pin[1], pin[2]);
  }
}

// poetry.lock, uv.lock and Cargo.lock: [[package]] tables with name and version.
function tomlPackages(text, ecosystem, { skipLocal = false } = {}) {
  for (const block of text.split(/^\[\[package\]\]\s*$/m).slice(1)) {
    const name = /^name\s*=\s*"([^"]+)"/m.exec(block)?.[1];
    const version = /^version\s*=\s*"([^"]+)"/m.exec(block)?.[1];
    // A workspace's own crate has no source; it is not a dependency.
    if (skipLocal && !/^source\s*=/m.test(block)) continue;
    if (/^source\s*=\s*\{\s*(editable|virtual|directory|path)\s*=/m.test(block)) continue;
    add(ecosystem, name, version);
  }
}

function pipfileLock(text) {
  const lock = JSON.parse(text);
  for (const section of ["default", "develop"]) {
    for (const [name, entry] of Object.entries(lock[section] || {})) add("pypi", name, entry.version);
  }
}

function goSum(text) {
  for (const line of text.split("\n")) {
    const [module, version] = line.trim().split(/\s+/);
    if (module && version) add("go", module, version.replace(/\/go\.mod$/, ""));
  }
}

const PARSERS = [
  [/^(package-lock|npm-shrinkwrap)\.json$/, npmLock],
  [/^yarn\.lock$/, yarnLock],
  [/^pnpm-lock\.yaml$/, pnpmLock],
  [/^requirements.*\.txt$/, requirements],
  [/^poetry\.lock$/, (text) => tomlPackages(text, "pypi")],
  [/^uv\.lock$/, (text) => tomlPackages(text, "pypi")],
  [/^Pipfile\.lock$/, pipfileLock],
  [/^Cargo\.lock$/, (text) => tomlPackages(text, "cargo", { skipLocal: true })],
  [/^go\.sum$/, goSum],
];

const read_files = [];
function scan(dir, depth) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry);
    let stat;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (depth < 4 && !SKIP.has(entry) && !entry.startsWith(".")) scan(path, depth + 1);
      continue;
    }
    const parser = PARSERS.find(([pattern]) => pattern.test(entry));
    if (!parser || stat.size > 50 * 1024 * 1024) continue;
    const text = read(path);
    if (text === null) continue;
    try {
      parser[1](text);
      read_files.push(relative(root, path) || entry);
    } catch {
      process.stderr.write(`skipped ${relative(root, path)}: could not parse\n`);
    }
  }
}

scan(root, 0);
process.stderr.write(`read ${read_files.length} lockfile(s): ${read_files.join(", ") || "none"}; ${found.size} packages${found.size >= LIMIT ? " (limit reached)" : ""}\n`);
process.stdout.write(`${JSON.stringify({ inventory: [...found.values()] })}\n`);
