# 贡献指南

感谢你对 iWeather 项目的贡献兴趣！本文档提供了贡献的指南和说明。

## 快速开始

### 前置要求

- [Bun](https://bun.sh/) 运行时
- Node.js 18+（用于某些工具）
- macOS、Linux 或 Windows

### 开发环境设置

1. 克隆仓库：
   ```bash
   git clone https://github.com/reason7871/iweather-cowork.git
   cd iweather-cowork
   ```

2. 安装依赖：
   ```bash
   bun install
   ```

3. 设置环境变量：
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入你的凭据
   ```

4. 以开发模式运行：
   ```bash
   bun run electron:dev
   ```

## 开发工作流

### 分支命名

使用描述性的分支名称：
- `feature/add-new-tool` - 新功能
- `fix/resolve-auth-issue` - Bug 修复
- `refactor/simplify-agent-loop` - 代码重构
- `docs/update-readme` - 文档更新

### 进行更改

1. 从 `main` 创建功能分支
2. 进行更改
3. 运行类型检查：`bun run typecheck:all`
4. 使用清晰、描述性的消息提交更改
5. 推送到你的 fork 并创建 Pull Request

### 代码风格

- 我们在整个代码库中使用 TypeScript
- 遵循代码库中的现有模式
- 使用有意义的变量和函数名称
- 为复杂逻辑添加注释

### 类型检查

在提交 PR 之前，确保所有类型检查通过：

```bash
bun run typecheck:all
```

## Pull Request 流程

1. **标题**：使用清晰、描述性的标题
2. **描述**：解释 PR 做了什么以及为什么
3. **测试**：描述你如何测试更改
4. **截图**：UI 更改请包含截图

### PR 模板

```markdown
## 摘要
简要描述更改内容

## 更改
- 更改 1
- 更改 2

## 测试
如何测试这些更改

## 截图（如适用）
```

## 项目结构

```
iweather-agent/
├── apps/
│   └── electron/    # 桌面 GUI（主要界面）
└── packages/
    ├── core/        # @iweather/core - 共享类型
    ├── shared/      # @iweather/shared - 业务逻辑
    └── ui/          # @iweather/ui - React 组件
```

## 关键目录

- **代理逻辑**：`packages/shared/src/agent/`
- **认证**：`packages/shared/src/auth/`
- **MCP 集成**：`packages/shared/src/mcp/`
- **UI 组件**：packages/ui/src/`
- **Electron 应用**：`apps/electron/`

## 有问题？

- 对于 bug 或功能请求，请提交 issue
- 对于问题或想法，请发起讨论

## 许可证

通过贡献，你同意你的贡献将根据 Apache License 2.0 许可。
