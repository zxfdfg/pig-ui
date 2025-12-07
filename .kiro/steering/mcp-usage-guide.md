---
inclusion: manual
---

# MCP 服务使用指南

本项目已配置 5 个 MCP 服务，用于增强前端开发效率。

## 已配置的 MCP 服务

### 1. Git MCP
**功能：** Git 版本控制操作
- 查看提交历史和分支信息
- 分析代码变更
- 查看文件修改记录
- 帮助编写规范的 commit message

**使用场景：**
- "查看最近 10 次提交记录"
- "显示当前分支信息"
- "查看 src/views 目录的修改历史"

### 2. Filesystem MCP
**功能：** 文件系统操作
- 快速搜索 Vue 组件
- 批量文件操作
- 分析项目结构
- 查找特定代码模式

**使用场景：**
- "搜索所有使用 Element Plus 的组件"
- "查找所有 API 接口定义文件"
- "列出所有 Pinia store 文件"

### 3. Docker MCP
**功能：** Docker 容器管理
- 查看运行中的容器
- 管理容器生命周期
- 查看容器日志
- 监控容器状态

**使用场景：**
- "查看所有运行中的容器"
- "显示 Nginx 容器的日志"
- "检查前端构建容器状态"

### 4. Memory MCP
**功能：** 知识库管理
- 存储项目特定信息
- 记录常用配置
- 保存代码片段
- 记录开发约定

**使用场景：**
- "记住：API 基础路径是 /api"
- "保存这个 Axios 拦截器配置"
- "记录 Element Plus 主题配置"

### 5. Playwright MCP
**功能：** 浏览器自动化测试
- 自动化 UI 测试
- 网页截图
- 表单自动填充测试
- 端到端测试
- 测试响应式布局

**使用场景：**
- "测试登录页面在不同分辨率下的显示"
- "自动化测试用户列表的增删改查"
- "截取仪表盘页面的屏幕截图"
- "测试表单验证功能"

## 前置要求

确保已安装 `uv` 和 `uvx`：

```bash
# 使用 pip 安装
pip install uv

# 或使用 pipx
pipx install uv
```

## 配置文件位置

`pig-ui/.kiro/settings/mcp.json`

## 重新连接 MCP 服务

如果 MCP 服务连接失败：

1. 打开命令面板（Ctrl+Shift+P）
2. 搜索 "MCP"
3. 选择 "Reconnect MCP Servers"

或者在 Kiro 侧边栏的 "MCP Servers" 视图中手动重连。

## 前端开发常用场景

### 组件开发
```
"使用 Playwright 测试 UserList 组件的分页功能"
"搜索所有使用 ElTable 的组件"
```

### API 调试
```
"查看 src/api/admin 目录下的所有接口定义"
"记住：用户管理 API 的基础路径是 /admin/user"
```

### 样式调试
```
"使用 Playwright 截取不同主题下的页面效果"
"搜索所有使用 Tailwind CSS 的组件"
```

### 代码审查
```
"查看最近修改的 Vue 组件"
"显示 stores 目录的提交历史"
```

## 常见问题

### Q: MCP 服务无法启动？
A: 确保已安装 `uv` 和 `uvx`，并且网络连接正常。首次使用时 uvx 会自动下载所需的包。

### Q: Playwright 需要额外安装浏览器吗？
A: 首次使用时，Playwright 会自动下载所需的浏览器。如果遇到问题，可以手动运行：
```bash
playwright install
```

### Q: 如何禁用某个 MCP 服务？
A: 在 mcp.json 中将对应服务的 `disabled` 设置为 `true`。

### Q: 如何自动批准某些工具调用？
A: 在 `autoApprove` 数组中添加工具名称，例如：
```json
"autoApprove": ["git_log", "playwright_screenshot"]
```

## 最佳实践

1. **Git MCP**: 提交前查看变更，确保符合 feat/fix/docs 规范
2. **Filesystem MCP**: 快速定位需要修改的 Vue 组件和 API 文件
3. **Docker MCP**: 开发时快速查看前端构建容器状态
4. **Memory MCP**: 记录 API 路径、环境变量等项目配置
5. **Playwright MCP**: 自动化测试关键用户流程，确保功能正常

## 扩展阅读

- MCP 官方文档: https://modelcontextprotocol.io
- Playwright 文档: https://playwright.dev
- Kiro MCP 使用指南: 在命令面板搜索 "MCP" 查看更多命令
