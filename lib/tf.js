import { spawn } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { resolve } from "node:path";

export function which(cmd) {
  const safe = String(cmd || "").replace(/[^a-zA-Z0-9._+-]/g, "");
  if (!safe) return Promise.resolve("");
  return new Promise((r) => {
    const child = spawn("bash", ["-lc", `command -v ${safe}`], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("close", (c) => r(c === 0 ? out.trim() : ""));
  });
}

export function resolveDir(dir, allowRoots = []) {
  const abs = resolve(String(dir || ".").trim() || ".");
  const real = existsSync(abs) ? realpathSync(abs) : abs;
  if (allowRoots.length) {
    const roots = allowRoots.map((r) => {
      const a = resolve(r);
      return existsSync(a) ? realpathSync(a) : a;
    });
    const ok = roots.some((root) => {
      const x = root.replace(/[/\\]+$/, "");
      return real === x || real.startsWith(x + "/") || real.startsWith(x + "\\");
    });
    if (!ok) throw new Error(`terraform dir outside allowRoots: ${real}`);
  }
  return real;
}

export function run(bin, args, { cwd, timeoutMs = 120_000, maxOut = 80_000, env } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(bin, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, ...(env || {}), TF_IN_AUTOMATION: "1", TF_INPUT: "0" },
    });
    let stdout = "";
    let stderr = "";
    const t = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("timeout"));
    }, timeoutMs);
    child.stdout.on("data", (d) => {
      stdout += d;
      if (stdout.length > maxOut * 2) child.kill("SIGKILL");
    });
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) => {
      clearTimeout(t);
      resolvePromise({
        code,
        stdout: stdout.slice(0, maxOut),
        stderr: stderr.slice(0, 8000),
        truncated: stdout.length > maxOut,
      });
    });
    child.on("error", (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

export async function tfStatus() {
  return {
    ok: true,
    terraform: (await which("terraform")) || null,
    tofu: (await which("tofu")) || null,
  };
}

async function bin() {
  return (await which("terraform")) || (await which("tofu")) || "terraform";
}

export async function tfVersion({ timeoutMs } = {}) {
  const b = await bin();
  const r = await run(b, ["version"], { timeoutMs: timeoutMs || 15_000, maxOut: 10_000 });
  return { ok: true, bin: b, output: (r.stdout || r.stderr).trim() };
}

/** Read-only: terraform plan -no-color (never apply). */
export async function tfPlanSummary({
  dir,
  allowRoots,
  timeoutMs = 180_000,
  maxOut = 60_000,
  refresh = true,
} = {}) {
  const cwd = resolveDir(dir, allowRoots);
  const b = await bin();
  const args = ["plan", "-no-color", "-input=false", "-detailed-exitcode"];
  if (refresh === false) args.push("-refresh=false");
  const r = await run(b, args, { cwd, timeoutMs, maxOut });
  // exit 0 = no changes, 2 = changes, 1 = error
  if (r.code === 1) throw new Error(`terraform plan failed: ${r.stderr || r.stdout || r.code}`);
  const text = (r.stdout || "") + (r.stderr ? "\n" + r.stderr : "");
  const summary = summarizePlan(text);
  return {
    ok: true,
    dir: cwd,
    exitCode: r.code,
    hasChanges: r.code === 2,
    truncated: r.truncated || text.length > maxOut,
    summary,
    output: text.slice(0, maxOut),
  };
}

export function summarizePlan(text) {
  const s = String(text || "");
  const m = s.match(/Plan:\s*(\d+)\s*to add,\s*(\d+)\s*to change,\s*(\d+)\s*to destroy/i);
  if (m) {
    return { add: Number(m[1]), change: Number(m[2]), destroy: Number(m[3]), line: m[0] };
  }
  if (/No changes/i.test(s)) return { add: 0, change: 0, destroy: 0, line: "No changes" };
  return { add: null, change: null, destroy: null, line: null };
}

export async function tfStateList({ dir, allowRoots, timeoutMs = 60_000, maxOut = 40_000 } = {}) {
  const cwd = resolveDir(dir, allowRoots);
  const b = await bin();
  const r = await run(b, ["state", "list"], { cwd, timeoutMs, maxOut });
  if (r.code !== 0) throw new Error(`terraform state list failed: ${r.stderr || r.code}`);
  const resources = r.stdout.split("\n").filter(Boolean);
  return {
    ok: true,
    dir: cwd,
    count: resources.length,
    truncated: r.truncated,
    resources: resources.slice(0, 500),
  };
}
