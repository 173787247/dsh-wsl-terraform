import { tfStatus, tfVersion, tfPlanSummary, tfStateList } from "./lib/tf.js";

export const name = "dsh-wsl-terraform";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  if (config.enabled === false) {
    console.log("[dsh-wsl-terraform] disabled");
    return;
  }
  const timeoutMs = positive(config.timeoutMs, 180_000);
  const allowRoots = Array.isArray(config.allowRoots) ? config.allowRoots.map(String) : [];
  console.log("[dsh-wsl-terraform] plan/state list only — never apply");

  ctx.systemPrompt.section({
    name: "tool:terraform",
    order: 135,
    text: "dsh-wsl-terraform runs terraform/tofu plan summaries and state list only. Never apply/destroy. Prefer tf_plan_summary over dumping full plans. Set allowRoots for safety.",
  });

  ctx.tools.register({
    name: "tf_status",
    description: "Whether terraform or tofu is on PATH.",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: { schema: { type: "object", additionalProperties: true }, render: (_a, v) => [{ type: "text", text: JSON.stringify(v) }] },
    timeoutMs: 10_000,
    isConcurrencySafe: () => true,
    async execute() {
      try {
        const st = await tfStatus();
        if (st.terraform || st.tofu) {
          const ver = await tfVersion({ timeoutMs: 10_000 });
          return { ...st, version: ver.output };
        }
        return st;
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "tf status" }),
    presentResult: (_a, r) => ({ card: "generic", title: "tf status", content: r.content }),
  });

  ctx.tools.register({
    name: "tf_plan_summary",
    description: "terraform/tofu plan -no-color (read-only). Returns Plan: add/change/destroy counts + capped output. Never applies.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["dir"],
      properties: {
        dir: { type: "string", description: "Terraform working directory" },
        refresh: { type: "boolean", description: "Default true; set false for faster offline-ish plan" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [
        {
          type: "text",
          text:
            v.ok === false
              ? v.error
              : `hasChanges=${v.hasChanges} ${v.summary?.line || ""}\n${(v.output || "").slice(0, 8000)}`,
        },
      ],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await tfPlanSummary({
          dir: args.dir,
          refresh: args.refresh !== false,
          allowRoots,
          timeoutMs,
        });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "tf plan" }),
    presentResult: (_a, r) => ({ card: "generic", title: "tf plan", content: r.content }),
  });

  ctx.tools.register({
    name: "tf_state_list",
    description: "terraform/tofu state list (read-only resource addresses).",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["dir"],
      properties: { dir: { type: "string" } },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [
        {
          type: "text",
          text: v.ok === false ? v.error : `count=${v.count}\n${(v.resources || []).join("\n")}`,
        },
      ],
    },
    timeoutMs: Math.min(timeoutMs, 60_000),
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await tfStateList({ dir: args.dir, allowRoots, timeoutMs: Math.min(timeoutMs, 60_000) });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "tf state list" }),
    presentResult: (_a, r) => ({ card: "generic", title: "tf state list", content: r.content }),
  });
}

function positive(v, fb) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fb;
}
