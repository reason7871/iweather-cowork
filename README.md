# iWeather

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## 简介

iWeather 是一款基于 Claude Agent SDK 构建的智能 AI 助手桌面应用。它提供直观的多任务处理能力，可以无缝连接任何 API 或服务，支持会话共享，并以文档为中心的工作流程，在精美流畅的界面中呈现。

该项目采用 Agent Native 软件原则设计，开箱即用，高度可定制。

## 功能特色

### 核心功能

- **多会话收件箱**：桌面应用支持会话管理、状态工作流和标记功能
- **Claude Code 体验**：流式响应、工具可视化、实时更新
- **多 LLM 连接**：支持添加多个 AI 提供商，并可为每个工作区设置默认连接
- **Codex / OpenAI 支持**：可与 Anthropic 一起运行 Codex 支持的会话
- **MCP 集成**：支持连接 MCP 服务器
- **数据源**：连接 MCP 服务器、REST API（Google、Slack、Microsoft）和本地文件系统
- **权限模式**：三级系统（探索、编辑确认、自动），支持自定义规则
- **后台任务**：运行长时间操作并跟踪进度
- **动态状态系统**：可自定义的会话工作流状态（待办、进行中、已完成等）
- **主题系统**：应用级和工作区级级联主题
- **多文件差异对比**：VS Code 风格的窗口，查看一轮对话中的所有文件更改
- **技能**：按工作区存储的专业代理指令
- **文件附件**：拖放图片、PDF、Office 文档，自动转换
- **钩子**：事件驱动自动化 —— 在标签更改、计划任务、工具使用等事件触发时运行命令或创建会话

### 数据源连接

| 类型 | 示例 |
|------|------|
| **MCP 服务器** | 自定义服务器、Linear、GitHub、Notion |
| **REST API** | Google（Gmail、日历、Drive）、Slack、Microsoft |
| **本地文件** | 文件系统、Obsidian 库、Git 仓库 |

### 权限模式

| 模式 | 显示名称 | 行为 |
|------|---------|------|
| `safe` | 探索 | 只读，阻止所有写入操作 |
| `ask` | 编辑确认 | 需要批准（默认） |
| `allow-all` | 自动 | 自动批准所有命令 |

使用 **SHIFT+TAB** 在聊天界面中切换模式。

## 安装

### 从源码构建

```bash
git clone https://github.com/reason7871/iweather-cowork.git
cd iweather-cowork
bun install
bun run electron:start
```

## 快速开始

1. **启动应用**：安装后启动 iWeather
2. **选择 API 连接**：使用 Anthropic（API 密钥或 Claude Max）或 Codex（OpenAI OAuth）
3. **创建工作区**：设置工作区来组织你的会话
4. **连接数据源**（可选）：添加 MCP 服务器、REST API 或本地文件系统
5. **开始对话**：创建会话并与 Claude 交互

## 架构

```
iweather-agent/
├── apps/
│   └── electron/              # 桌面 GUI（主要界面）
│       └── src/
│           ├── main/          # Electron 主进程
│           ├── preload/       # 上下文桥接
│           └── renderer/      # React UI (Vite + shadcn)
└── packages/
    ├── core/                  # 共享类型
    └── shared/                # 业务逻辑
        └── src/
            ├── agent/         # Agent、权限
            ├── auth/          # OAuth、令牌
            ├── config/        # 存储、偏好、主题
            ├── credentials/   # AES-256-GCM 加密存储
            ├── sessions/      # 会话持久化
            ├── sources/       # MCP、API、本地数据源
            └── statuses/      # 动态状态系统
```

## 开发

```bash
# 热重载开发模式
bun run electron:dev

# 构建并运行
bun run electron:start

# 类型检查
bun run typecheck:all

# 调试日志（写入到 ~/Library/Logs/iWeather/）
# 日志在开发模式下自动启用
```

### 环境变量

OAuth 集成（Slack、Microsoft）需要在构建时嵌入凭据。创建 `.env` 文件：

```bash
MICROSOFT_OAUTH_CLIENT_ID=your-client-id
SLACK_OAUTH_CLIENT_ID=your-slack-client-id
SLACK_OAUTH_CLIENT_SECRET=your-slack-secret
```

**注意：** Google OAuth 凭据不会嵌入到构建中。用户通过数据源配置提供自己的凭据。

### Google OAuth 设置（Gmail、日历、Drive）

Google 集成需要创建自己的 OAuth 凭据。这是一次性设置。

#### 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建新项目（或选择现有项目）
3. 记下项目 ID

#### 2. 启用所需 API

访问 **APIs & Services → Library** 并启用所需 API：
- **Gmail API** - 邮件集成
- **Google Calendar API** - 日历集成
- **Google Drive API** - 文件存储集成

#### 3. 配置 OAuth 同意屏幕

1. 访问 **APIs & Services → OAuth consent screen**
2. 选择 **External** 用户类型（除非你有 Google Workspace）
3. 填写必填字段
4. 将自己添加为测试用户

#### 4. 创建 OAuth 凭据

1. 访问 **APIs & Services → Credentials**
2. 点击 **Create Credentials → OAuth Client ID**
3. 应用类型：**Desktop app**
4. 创建后记下 **Client ID** 和 **Client Secret**

#### 5. 在 iWeather 中配置

设置 Google 数据源时，在配置中添加这些字段：

```json
{
  "api": {
    "googleService": "gmail",
    "googleOAuthClientId": "your-client-id.apps.googleusercontent.com",
    "googleOAuthClientSecret": "your-client-secret"
  }
}
```

## 配置第三方提供商（OpenRouter、Vercel AI Gateway、Ollama 等）

第三方和自托管 LLM 提供商**仅通过 Claude / Anthropic API 密钥**连接支持。

| 提供商 | 端点 | 说明 |
|--------|------|------|
| **OpenRouter** | `https://openrouter.ai/api` | 通过单一 API 密钥访问 Claude、GPT、Llama、Gemini 等数百种模型 |
| **Vercel AI Gateway** | `https://ai-gateway.vercel.sh` | 通过 Vercel AI Gateway 路由请求，内置可观测性和缓存 |
| **Ollama** | `http://localhost:11434` | 本地运行开源模型，无需 API 密钥 |
| **自定义** | 任何 URL | 任何 OpenAI 兼容或 Anthropic 兼容端点 |

## 配置

配置存储在 `~/.iweather/`：

```
~/.iweather/
├── config.json              # 主配置（工作区、LLM 连接）
├── credentials.enc          # 加密凭据（AES-256-GCM）
├── preferences.json         # 用户偏好
├── theme.json               # 应用级主题
└── workspaces/
    └── {id}/
        ├── config.json      # 工作区设置
        ├── theme.json       # 工作区主题覆盖
        ├── hooks.json       # 事件驱动自动化钩子
        ├── sessions/        # 会话数据 (JSONL)
        ├── sources/         # 已连接的数据源
        ├── skills/          # 自定义技能
        └── statuses/        # 状态配置
```

### 钩子（自动化）

钩子允许你在事件发生时自动触发操作 —— 标签更改、会话开始、工具运行或按计划执行。

**直接告诉代理：**
- "设置每个工作日上午 9 点的每日站会简报"
- "当会话被标记为紧急时通知我"
- "将所有权限模式更改记录到文件"
- "每周五下午 5 点，总结本周完成的任务"

**钩子类型：**
- **命令钩子** —— 运行 shell 命令，事件数据作为环境变量（`$CRAFT_LABEL`、`$CRAFT_SESSION_ID` 等）
- **提示钩子** —— 使用提示创建新的代理会话（支持 `@mentions` 引用数据源和技能）

**支持的事件：** `LabelAdd`、`LabelRemove`、`PermissionModeChange`、`FlagChange`、`SessionStatusChange`、`SchedulerTick`、`PreToolUse`、`PostToolUse`、`SessionStart`、`SessionEnd` 等。

## 高级功能

### 大响应处理

超过约 60KB 的工具响应会使用 Claude Haiku 自动摘要，保留意图感知上下文。

### 深度链接

外部应用可以使用 `iweather://` URL 进行导航：

```
iweather://allSessions                      # 所有会话视图
iweather://allSessions/session/session123   # 特定会话
iweather://settings                         # 设置
iweather://sources/source/github            # 数据源信息
iweather://action/new-chat                  # 创建新会话
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 运行时 | [Bun](https://bun.sh/) |
| AI | [@anthropic-ai/claude-agent-sdk](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk) |
| AI (OpenAI) | Codex app-server |
| 桌面应用 | [Electron](https://www.electronjs.org/) + React |
| UI | [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS v4 |
| 构建 | esbuild (主进程) + Vite (渲染进程) |
| 凭据 | AES-256-GCM 加密文件存储 |

## 故障排除

### 调试模式

要启用详细日志启动打包应用，使用 `-- --debug`（注意双破折号分隔符）：

**macOS:**
```bash
/Applications/iWeather.app/Contents/MacOS/iWeather -- --debug
```

**Windows (PowerShell):**
```powershell
& "$env:LOCALAPPDATA\Programs\iWeather\iWeather.exe" -- --debug
```

**Linux:**
```bash
./iweather -- --debug
```

日志写入位置：
- **macOS:** `~/Library/Logs/@iweather/electron/main.log`
- **Windows:** `%APPDATA%\@iweather\electron\logs\main.log`
- **Linux:** `~/.config/@iweather/electron/logs/main.log`

## 许可证

本项目采用 Apache License 2.0 许可 - 详情见 [LICENSE](LICENSE) 文件。

### 第三方许可证

本项目使用 [Claude Agent SDK](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)，受 [Anthropic 商业服务条款](https://www.anthropic.com/legal/commercial-terms)约束。

## 贡献

欢迎贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

## 安全

### 本地 MCP 服务器隔离

在生成本地 MCP 服务器（stdio 传输）时，敏感环境变量会被过滤，以防止凭据泄露到子进程。被阻止的变量包括：

- `ANTHROPIC_API_KEY`、`CLAUDE_CODE_OAUTH_TOKEN`（应用认证）
- `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN`
- `GITHUB_TOKEN`、`GH_TOKEN`、`OPENAI_API_KEY`、`GOOGLE_API_KEY`、`STRIPE_SECRET_KEY`、`NPM_TOKEN`

要显式将环境变量传递给特定 MCP 服务器，请在数据源配置中使用 `env` 字段。

报告安全漏洞请参阅 [SECURITY.md](SECURITY.md)。
