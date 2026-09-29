# dsh-wsl-terraform

> **Languages:** [中文（首页）](./README.md) · **English** (this file)

terraform/tofu plan summary + state list (never apply).

| | |
|---|---|
| Version | **0.1.0** |
| Kit | Optional companion to [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit); not in `install.sh` |

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-terraform
```

Batch link (optional): `bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## Tools

| Tool | Role |
|------|------|
| `tf_status` | binaries on PATH |
| `tf_plan_summary` | Plan add/change/destroy |
| `tf_state_list` | state list |

## Config

`allowRoots / timeoutMs`

Read-only, capped output. Prefer `allowRoots`.

## Compatibility

| Field | Value |
|-------|-------|
| **Plugin** | `dsh-wsl-terraform` **0.1.1** |
| **Minimum dsh** | ≥ **0.1.2** (web UI one-shot `?token=` on Windows relay `:3081`) |
| **Latest verified** | See [dsh-wsl-kit Compatibility](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) (currently **`0.2.0-rc.2`**) — single source of truth for the suite |
| **Kit set** | optional (not in `install.sh` / `KIT_SET=daily` by default) |

## License

MIT
