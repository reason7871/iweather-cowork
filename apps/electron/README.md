# iWeather Electron 应用

iWeather 的主要桌面界面，使用 Electron + React 构建。提供多会话收件箱和聊天界面，通过工作区与 Claude 交互。

## 快速开始

```bash
# 从项目根目录运行
bun run electron:build   # 构建应用
bun run electron:start   # 构建并运行
```

## 架构

```
apps/electron/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.ts       # 窗口创建、应用生命周期
│   │   ├── ipc.ts         # IPC 处理程序注册
│   │   ├── menu.ts        # 应用菜单（文件、编辑、视图、帮助）
│   │   ├── sessions.ts    # 会话管理、CraftAgent 集成
│   │   ├── deep-link.ts   # 深度链接 URL 解析和处理
│   │   ├── agent-service.ts # 代理列表、缓存、认证检查
│   │   └── sources-service.ts # 数据源和认证服务
│   ├── preload/           # 上下文桥接（主进程 ↔ 渲染进程）
│   │   └── index.ts       # 向渲染进程暴露 electronAPI
│   ├── renderer/          # React UI
│   │   ├── App.tsx        # 主应用、事件处理
│   │   ├── components/
│   │   │   ├── chat/      # 聊天 UI (ChatInput, ChatDisplay)
│   │   │   ├── markdown/  # 使用 Shiki 的 Markdown 渲染器
│   │   │   └── ui/        # shadcn/ui 组件
│   │   ├── contexts/
│   │   │   └── NavigationContext.tsx  # 类型安全路由和导航
│   │   ├── lib/
│   │   │   └── navigate.ts  # 全局 navigate() 函数
│   │   ├── hooks/
│   │   │   └── useAgentState.ts  # 代理激活状态机
│   │   └── playground/    # 组件开发测试场
│   └── shared/
│       ├── types.ts       # 共享 TypeScript 接口
│       ├── routes.ts      # 类型安全路由定义
│       └── route-parser.ts # 路由字符串解析
├── dist/                  # 构建输出
└── resources/             # 应用图标
```

## 关键知识点

### 1. SDK 路径解析（关键）

Claude Agent SDK 通过生成子进程运行 `cli.js`。当 esbuild 将 SDK 打包到 `main.js` 时，SDK 对 `cli.js` 的自动检测会失效。

**问题：**
```
Error: The "path" argument must be of type string or an instance of URL. Received undefined
```

**根本原因：** SDK 使用 `import.meta.url` 查找 `cli.js`。打包后，此路径无效。

**解决方案：** 在创建任何代理之前显式设置路径：
```typescript
import { setPathToClaudeCodeExecutable } from '../../../src/agent/options'

// 在 initialize() 中：
const cliPath = join(process.cwd(), 'node_modules', '@anthropic-ai', 'claude-agent-sdk', 'cli.js')
setPathToClaudeCodeExecutable(cliPath)
```

### 2. 认证环境设置（关键）

SDK 要求在创建代理之前设置认证环境变量。Electron 应用必须在初始化期间显式执行此操作。

```typescript
import { getAuthState } from '../../../src/auth/state'

// 在 initialize() 中：
const authState = await getAuthState()
const { billing } = authState

if (billing.type === 'oauth_token' && billing.claudeOAuthToken) {
  process.env.CLAUDE_CODE_OAUTH_TOKEN = billing.claudeOAuthToken
} else if (billing.apiKey) {
  process.env.ANTHROPIC_API_KEY = billing.apiKey
}
```

### 3. AgentEvent 类型不匹配

`CraftAgent` 的 `AgentEvent` 类型使用与预期不同的属性名称：

| 事件类型 | 错误 | 正确 |
|----------|------|------|
| `text_delta` | `event.delta` | `event.text` |
| `error` | `event.error` | `event.message` |
| `tool_result` | `event.toolName` | 只有 `event.toolUseId` |

**tool_result 的解决方案：** 从 `tool_start` 事件跟踪 `toolUseId → toolName` 映射：
```typescript
interface ManagedSession {
  // ...
  pendingTools: Map<string, string>  // toolUseId -> toolName
}

// 在 tool_start 处理程序中：
managed.pendingTools.set(event.toolUseId, event.toolName)

// 在 tool_result 处理程序中：
const toolName = managed.pendingTools.get(event.toolUseId) || 'unknown'
managed.pendingTools.delete(event.toolUseId)
```

### 4. CraftAgent 构造函数

`CraftAgent` 期望完整的 `Workspace` 对象，而不仅仅是 ID：

```typescript
// 错误：
new CraftAgent({ workspaceId: workspace.id, model })

// 正确：
new CraftAgent({ workspace, model })
```

### 5. esbuild 配置

只有 `electron` 被外部化。SDK 被打包到 `main.js` 中：

```json
"electron:build:main": "esbuild ... --external:electron"
```

这意味着：
- SDK 代码被内联（约 950KB）
- SDK 的运行时路径解析会失效（见 #1）
- 原生模块需要显式外部化

## 构建过程

```bash
bun run electron:build:main      # 打包主进程 (esbuild)
bun run electron:build:preload   # 打包预加载脚本 (esbuild)
bun run electron:build:renderer  # 打包 React 应用 (Vite)
bun run electron:build:resources # 复制图标
bun run electron:build           # 执行以上所有
```

## macOS Liquid Glass 图标

应用包含为 macOS 26+ Liquid Glass 图标预编译的 `Assets.car`。这支持 macOS Tahoe 上的分层玻璃效果。在较旧的 macOS 版本上，应用会回退到 `icon.icns`。

**图标更改后重新生成：**

如果修改 `resources/icon.icon`，重新生成 Assets.car：

```bash
cd apps/electron
xcrun actool "resources/icon.icon" --compile "resources" \
  --app-icon AppIcon --minimum-deployment-target 26.0 \
  --platform macosx --output-partial-info-plist /dev/null
```

> **注意：** 这需要 macOS 26 和 Xcode 26（macOS 26 SDK）。预编译的 Assets.car 已提交到仓库，以便 CI 构建在没有 SDK 的情况下也能工作。

## 调试

通过运行 `electron:start` 的终端启用控制台日志。关键日志前缀：
- `[SessionManager]` - 会话生命周期、认证设置
- `[IPC]` - 进程间通信

DevTools 自动打开（在 `index.ts` 中配置）。生产环境请移除 `mainWindow.webContents.openDevTools()`。

## 已实现的功能

- **会话持久化** - 会话、消息和名称保存到磁盘
- **文件附件** - 向消息附加图片、PDF 和代码文件
- **AI 生成的标题** - 会话在首次交互后获得自动标题
- **子代理支持** - 从文档加载和应用代理定义
- **Shell 集成** - 在浏览器中打开 URL，在默认应用中打开文件
- **权限模式** - 三级权限系统（探索、编辑确认、自动）
- **后台任务** - 在后台运行长时间任务并跟踪进度
- **多文件差异对比** - VS Code 风格窗口查看一轮对话中的所有文件更改
- **动态状态** - 工作区可自定义的会话工作流状态
- **主题系统** - 级联主题（应用 → 工作区 → 代理）
- **代理状态机** - useAgentState hook 管理激活流程
- **应用菜单** - 标准 macOS/Windows 菜单和键盘快捷键
- **组件测试场** - 隔离测试 UI 组件的开发工具
- **类型安全导航** - 统一的路由系统，用于标签页、操作和深度链接

## 导航系统

应用使用类型安全的路由系统处理所有内部导航和深度链接。

### 快速开始

```typescript
import { navigate, routes } from '@/lib/navigate'

// 标签页路由
navigate(routes.tab.settings())           // 打开设置
navigate(routes.tab.chat('session123'))   // 打开聊天
navigate(routes.tab.agentInfo('claude'))  // 打开代理信息

// 操作路由
navigate(routes.action.newChat({ agentId: 'claude' }))  // 使用代理新建聊天
navigate(routes.action.deleteSession('id'))             // 删除会话

// 侧边栏路由
navigate(routes.sidebar.inbox())          // 显示收件箱
navigate(routes.sidebar.flagged())        // 显示已标记
```

### 深度链接

外部应用可以使用 `iweather://` URL 进行导航：

```
iweather://settings
iweather://allSessions/session/session123
iweather://sources/source/github
iweather://action/new-chat
iweather://workspace/{id}/allSessions/session/abc123
```

## 文件概述

| 文件 | 用途 |
|------|------|
| `main/index.ts` | 应用入口、窗口创建 |
| `main/sessions.ts` | CraftAgent 包装器、事件处理、数据源集成 |
| `main/ipc.ts` | IPC 通道处理程序（会话、文件、shell） |
| `main/menu.ts` | 应用菜单（文件、编辑、视图、帮助） |
| `main/deep-link.ts` | 深度链接 URL 解析和处理 |
| `main/sources-service.ts` | 数据源加载和认证服务 |
| `preload/index.ts` | 上下文桥接 API |
| `renderer/App.tsx` | React 根组件、状态管理 |
| `renderer/contexts/NavigationContext.tsx` | 类型安全路由和导航处理程序 |
| `renderer/lib/navigate.ts` | 全局 navigate() 函数 |
| `renderer/hooks/useAgentState.ts` | 代理激活状态机（基于 IPC） |
| `renderer/hooks/useBackgroundTasks.ts` | 后台任务跟踪 |
| `renderer/hooks/useStatuses.ts` | 工作区状态配置 |
| `renderer/hooks/useTheme.ts` | 级联主题解析 |
| `renderer/components/chat/Chat.tsx` | 主聊天布局，可调整大小的面板 |
| `renderer/components/chat/ChatInput.tsx` | 消息输入，支持文件附件 |
| `renderer/components/chat/ChatDisplay.tsx` | 消息列表，Markdown 渲染 |
| `renderer/components/app-shell/input/structured/PermissionRequest.tsx` | Bash 命令批准 UI |
| `renderer/components/chat/SessionList.tsx` | 会话侧边栏，支持重命名 |
| `renderer/components/chat/AttachmentPreview.tsx` | 文件附件气泡 |
| `renderer/components/ui/source-avatar.tsx` | 统一的数据源图标组件 |
| `renderer/playground/` | 组件开发测试场 |
| `shared/types.ts` | IPC 通道、Message/Session/FileAttachment 类型 |
| `shared/routes.ts` | 类型安全路由定义和构建器 |
| `shared/route-parser.ts` | 路由字符串解析工具 |
