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

## License

MIT
