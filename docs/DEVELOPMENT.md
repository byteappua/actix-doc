# 开发指南

## 快速开始

### 环境准备

1. **安装 Rust**

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **安装 Node.js 和 pnpm**

   ```bash
   # 安装 Node.js (推荐使用 nvm)
   nvm install 20
   
   # 安装 pnpm
   npm install -g pnpm
   ```

### 克隆并运行

```bash
# 克隆项目
git clone <repository-url>
cd actix-doc

# 启动后端
cargo run

# 启动前端（新终端）
cd front
pnpm install
pnpm run dev
```

## 项目结构

```
actix-doc/
├── src/                # Rust 后端源代码
│   ├── main.rs         # 主入口
│   ├── auth.rs         # 认证模块
│   ├── docs.rs         # 文档 CRUD
│   ├── models.rs       # 数据模型
│   ├── errors.rs       # 错误处理
│   └── db.rs           # 数据库连接
├── migrations/         # 数据库迁移文件
├── front/              # Next.js 前端
│   └── src/
│       ├── app/        # 页面路由
│       ├── components/ # UI 组件
│       └── lib/        # 工具函数
├── static/             # 前端构建产物（自动生成）
├── build.rs            # 构建脚本
├── Dockerfile          # Docker 镜像
└── docs/               # 项目文档
```

## 开发工作流

### 后端开发

```bash
# 开发模式（热重载）
cargo install cargo-watch
cargo watch -x run

# 运行测试
cargo test

# 代码格式化
cargo fmt

# 代码检查
cargo clippy
```

### 前端开发

```bash
cd front

# 开发服务器
pnpm run dev

# 代码检查
pnpm run lint

# 构建
pnpm run build
```

### 强制重建前端

如果删除了 `front/out` 或 `static` 目录，需要强制重建：

```bash
# Windows CMD
set REBUILD_FRONT=1 && cargo build

# Windows PowerShell
$env:REBUILD_FRONT=1; cargo build

# Linux/macOS
REBUILD_FRONT=1 cargo build
```

这会触发完整流程：

1. 检测 `REBUILD_FRONT` 环境变量
2. 运行 `pnpm install`（如需要）
3. 运行 `pnpm run build` → 生成 `front/out/`
4. 复制到 `static/`

### 数据库迁移

```bash
# 安装 sqlx-cli
cargo install sqlx-cli --no-default-features --features sqlite

# 创建迁移
sqlx migrate add <migration_name>

# 运行迁移
sqlx migrate run

# 回滚迁移
sqlx migrate revert
```

## 代码规范

### Rust

- 遵循 Rust 官方风格指南
- 使用 `cargo fmt` 格式化代码
- 通过 `cargo clippy` 检查

### TypeScript

- 使用 ESLint 和 Prettier
- 遵循 Airbnb React 风格指南
- 组件使用 TypeScript 类型

## 常见问题

### 编译错误

**问题**: `could not find DATABASE_URL`
**解决**: 创建 `.env` 文件并设置 `DATABASE_URL=sqlite:./data.db`

**问题**: 前端构建失败
**解决**: 删除 `front/.next` 和 `front/node_modules`，重新安装依赖

### PowerShell 执行策略

**问题**: `无法加载文件 pnpm.ps1`
**解决**: 以管理员身份运行 PowerShell：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 调试技巧

### 后端调试

1. **启用详细日志**

   ```bash
   RUST_LOG=debug cargo run
   ```

2. **使用 VSCode 调试**
   - 安装 rust-analyzer 扩展
   - 配置 launch.json

### 前端调试

1. **React DevTools**
   - Chrome 扩展：React Developer Tools

2. **Next.js 调试模式**

   ```bash
   NODE_OPTIONS='--inspect' pnpm run dev
   ```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 推送到分支
5. 创建 Pull Request
