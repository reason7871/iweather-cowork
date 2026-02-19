# 数据表格指南

本指南介绍如何使用 datatable 和 spreadsheet 块展示结构化数据，以及如何使用 `transform_data` 工具处理大型数据集。

## 概述

iWeather 支持三种方式显示表格数据：

| 格式 | 适用场景 | 交互性 |
|------|----------|--------|
| **Markdown 表格** | 小型简单数据（3-4 行） | 无 |
| **`datatable` 块** | 查询结果、比较、用户可能排序/筛选的任何数据 | 排序、筛选、分组、搜索 |
| **`spreadsheet` 块** | 财务报表、导出、用户可能下载为 .xlsx 的数据 | 排序、导出到 Excel/CSV |

**关键原则：** 对于 20+ 行的数据集，使用 `transform_data` 工具将数据写入 JSON 文件并通过 `"src"` 引用，而不是内联所有行。这可以显著减少令牌使用和成本。

## 内联表格（小型数据集）

对于 20 行以下的数据集，直接在 markdown 块中内联数据：

### Datatable

````
```datatable
{
  "title": "顶级用户",
  "columns": [
    { "key": "name", "label": "名称", "type": "text" },
    { "key": "revenue", "label": "收入", "type": "currency" },
    { "key": "growth", "label": "增长", "type": "percent" },
    { "key": "active", "label": "活跃", "type": "boolean" },
    { "key": "tier", "label": "等级", "type": "badge" }
  ],
  "rows": [
    { "name": "Acme Corp", "revenue": 4200000, "growth": 0.152, "active": true, "tier": "Enterprise" },
    { "name": "StartupCo", "revenue": 85000, "growth": -0.03, "active": true, "tier": "Starter" }
  ]
}
```
````

### Spreadsheet

````
```spreadsheet
{
  "filename": "q4-revenue.xlsx",
  "sheetName": "收入",
  "columns": [
    { "key": "month", "label": "月份", "type": "text" },
    { "key": "revenue", "label": "收入", "type": "currency" }
  ],
  "rows": [
    { "month": "十月", "revenue": 125000 },
    { "month": "十一月", "revenue": 142000 }
  ]
}
```
````

## 列类型参考

| 类型 | 输入格式 | 渲染为 | 输入示例 | 输出示例 |
|------|----------|--------|----------|----------|
| `text` | 任意字符串 | 纯文本 | `"John Doe"` | John Doe |
| `number` | 数字 | 格式化数字 | `1500000` | 1,500,000 |
| `currency` | 原始数字（非格式化） | 美元金额 | `4200000` | $4,200,000 |
| `percent` | 小数（0-1 范围） | 带颜色的百分比 | `0.152` | +15.2%（绿色） |
| `boolean` | `true`/`false` | 是/否 | `true` | 是 |
| `date` | 日期字符串 | 格式化日期 | `"2025-01-15"` | 2025年1月15日 |
| `badge` | 字符串 | 彩色状态标签 | `"Active"` | Active（徽章） |

**重要说明：**
- `currency` — 传递原始数字，而非格式化字符串。`4200000` 渲染为 `$4,200,000`。
- `percent` — 以小数传递。`0.152` 渲染为 `+15.2%`。正值为绿色，负值为红色。
- `boolean` — 使用实际的 `true`/`false`，而非字符串。

## 文件支持的表格（大型数据集）

### 何时使用

在以下情况下使用 `transform_data` 工具 + `"src"` 字段：
- 数据集有 **20+ 行** — 内联 100 行在令牌上花费约 $1+
- 数据来自 **大型 API 响应** 或工具结果
- 需要 **筛选、重塑或聚合** 原始数据后再显示
- 数据为 **CSV、TSV 或非结构化文本**，需要解析
- 想要 **连接多个数据源的数据**

### transform_data 工具

`transform_data` 在隔离的子进程中运行脚本，读取输入文件并写入结构化 JSON 输出。

**参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| `language` | `"python3"` \| `"node"` \| `"bun"` | 脚本运行时 |
| `script` | 字符串 | 转换脚本源代码 |
| `inputFiles` | 字符串[] | 相对于会话目录的输入文件路径 |
| `outputFile` | 字符串 | 输出文件名（写入会话 `data/` 目录） |

**路径约定：**
- **输入文件** 相对于会话目录。常见位置：
  - `long_responses/tool_result_abc.txt` — 保存的工具结果
  - `data/previous_output.json` — 之前转换的输出
  - `attachments/data.csv` — 用户附加的文件
- **输出文件** 相对于会话 `data/` 目录。只需提供文件名（例如 `"transactions.json"`）

### 输出 JSON 模式

输出文件应包含以下格式之一的有效 JSON：

**完整格式（推荐）：**
```json
{
  "title": "最近交易",
  "columns": [
    { "key": "date", "label": "日期", "type": "date" },
    { "key": "amount", "label": "金额", "type": "currency" },
    { "key": "status", "label": "状态", "type": "badge" }
  ],
  "rows": [
    { "date": "2025-01-15", "amount": 250.00, "status": "Completed" }
  ]
}
```

**仅行格式：**
```json
{
  "rows": [
    { "date": "2025-01-15", "amount": 250.00, "status": "Completed" }
  ]
}
```

或仅裸数组：
```json
[
  { "date": "2025-01-15", "amount": 250.00, "status": "Completed" }
]
```

**合并语义：** 使用 `"src"` 时，markdown 块中的内联 `columns` 和 `title` 优先于文件中的值。这允许你在块中定义列类型，同时从文件中提取行。

### 引用输出

`transform_data` 成功后，返回输出文件的 **绝对路径**。在 datatable 或 spreadsheet 块中使用该确切路径作为 `"src"` 值：

````
```datatable
{
  "src": "/transform_data/返回的/绝对/路径",
  "title": "最近交易",
  "columns": [
    { "key": "date", "label": "日期", "type": "date" },
    { "key": "amount", "label": "金额", "type": "currency" },
    { "key": "status", "label": "状态", "type": "badge" }
  ]
}
```
````

**重要：** 始终使用 `transform_data` 工具结果中的绝对路径。不要手动构造相对路径。

## 安全与约束

- **隔离子进程：** 脚本在子进程中运行，无法访问 API 密钥、凭据或敏感环境变量
- **30 秒超时：** 超过 30 秒的脚本会被终止
- **路径沙箱：** 输入文件必须在会话目录内。输出文件必须在会话 `data/` 目录内。路径遍历尝试（如 `../`）被阻止。
- **无网络访问：** 脚本继承进程环境（除机密外），但不应进行网络调用 — 使用 MCP 工具获取数据，然后在本地转换
- **被阻止的环境变量：** `ANTHROPIC_API_KEY`、`CLAUDE_CODE_OAUTH_TOKEN`、`AWS_*`、`GITHUB_TOKEN`、`OPENAI_API_KEY`、`GOOGLE_API_KEY`、`STRIPE_SECRET_KEY`、`NPM_TOKEN`

## 最佳实践

### 决策树

```
数据少于 20 行吗？
  → 是：直接在 datatable/spreadsheet 块中内联
  → 否：使用 transform_data + "src" 字段

数据已经是结构化 JSON 吗？
  → 是：编写简单的提取脚本
  → 否：使用 Python 的 csv、json 或字符串解析来结构化

用户需要导出/下载吗？
  → 是：使用 spreadsheet 块（支持 .xlsx 导出）
  → 否：使用 datatable 块（更好的排序/筛选/分组体验）
```

### 命名约定

- 输出文件：描述性、短横线命名 — `stripe-transactions.json`、`monthly-revenue.json`
- 匹配上下文 — 如果用户问"Q4 销售额"，命名为 `q4-sales.json`

## 故障排除

### "脚本失败（退出代码 1）"
- 检查错误输出中的语法错误或缺少的导入
- 验证输入文件存在于指定路径
- 确保脚本正确从 `sys.argv` / `process.argv` 读取

### "输出文件未创建"
- 确保脚本写入 `sys.argv[-1]` / `process.argv.at(-1)`（最后一个参数）
- 检查 `json.dump` / `fs.writeFileSync` 是否成功完成
- 验证输出是有效的 JSON

### 表格显示"加载中..."无限期
- `"src"` 路径必须是 `transform_data` 返回的 **绝对路径** — 不要使用相对路径
- 验证文件确实由 `transform_data` 创建（检查工具结果消息）
