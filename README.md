# dsh-wsl-terraform

> **语言：** **中文**（本页） · [English](./README.en.md)

terraform/tofu：plan 摘要 + state list（永不 apply）。

| | |
|---|---|
| 版本 | **0.1.0** |
| 套件 | [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit) **可选**，不在 `install.sh` |

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-terraform
# 或本机 path：
# dsh plugin --profile web add /mnt/c/Users/YOU/Desktop/AIFullStackDevelopment/dsh-wsl-terraform
```

kit 批量链接（可选）：`bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## 工具

| 工具 | 作用 |
|------|------|
| `tf_status` | terraform/tofu 是否可用 |
| `tf_plan_summary` | plan 计数摘要 |
| `tf_state_list` | state list |

## 配置要点

`allowRoots / timeoutMs`

只读。输出截断。建议配 `allowRoots`。

## 兼容性

| 字段 | 值 |
|------|----|
| **插件** | `dsh-wsl-terraform` **0.1.1** |
| **最低 dsh** | ≥ **0.1.2**（Web UI 一次性 `?token=`，Windows 中继 `:3081`） |
| **最新验证** | 以 [dsh-wsl-kit 兼容性](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) 为准（当前 **`0.2.0-rc.2`**）— 套件唯一真源 |
| **套件档位** | 可选（默认不在 `install.sh` / `KIT_SET=daily`） |

## License

MIT
