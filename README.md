# Actix+Next.js 文档管理系统

一个使用 **Actix Web (Rust)** 作为后端、**Next.js (TypeScript)** 作为前端的现代化文档管理系统。

## ✨ 技术栈

**后端**:

- Actix Web 4.x - 高性能 Rust Web 框架
- SQLx - 异步 SQL 工具包 (SQLite)
- Argon2 - 密码哈希
- JWT - 身份认证

**前端**:

- Next.js 16 - React 框架
- shadcn/ui - UI 组件库
- Tailwind CSS - 样式框架
- Tiptap - 富文本编辑器
- mdBook - 项目文档生成

## 📚 完整文档

本项目包含详细的文档，请访问 `docs/` 目录或查看在线文档：

- [📘 开发指南](docs/DEVELOPMENT.md)
- [🏗️ 架构说明](docs/ARCHITECTURE.md)
- [🔌 API 参考](docs/API.md)
- [🚀 部署指南](docs/DEPLOYMENT.md)

也支持使用 mdBook 进行阅读：

```bash
cargo install mdbook
mdbook serve
```

## 🚀 快速开始

### 方式一：Docker (推荐)

```bash
# 使用 docker-compose
docker-compose up -d

# 或手动构建并运行
docker build -t actix-doc .
docker run -p 8080:8080 -v $(pwd)/data:/app/data actix-doc
```

访问 `http://localhost:8080`

### 方式二：本地开发

#### 前置要求

- Rust 1.70+
- Node.js 18+
- pnpm (推荐) 或 npm

#### 开发环境运行

1. **克隆仓库**

```bash
git clone <repository-url>
cd actix-doc
```

1. **启动后端**

```bash
cargo run
```

后端将在 `http://127.0.0.1:8080` 启动

> **注意**: 首次运行 `cargo build/run` 会自动构建前端并嵌入到 `static/` 目录

1. **启动前端开发服务器** (新终端，可选)

```bash
cd front
pnpm install
pnpm run dev
```

前端将在 `http://localhost:3000` 启动

1. **访问应用**  

- 开发模式: `http://localhost:3000` (前端热更新)
- 生产模式: `http://127.0.0.1:8080` (后端服务静态文件)

### 生产环境部署

**一键构建**:

```bash
cargo build --release
```

前端会自动构建并嵌入。

**运行**:

```bash
cargo run --release
```

访问 `http://127.0.0.1:8080`

## 📁 项目结构

```
actix-doc/
├── src/                # Rust 后端源代码
├── migrations/         # 数据库迁移
├── static/             # 前端静态文件（自动生成）
├── front/              # Next.js 前端源代码
├── build.rs            # 构建脚本（自动化前端构建）
├── Dockerfile          # Docker 镜像定义
├── docker-compose.yml  # Docker Compose 配置
├── Cargo.toml          # Rust 项目配置
└── .env                # 环境变量
```

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 手动 Docker 命令

```bash
# 构建镜像
docker build -t actix-doc .

# 运行容器
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -e JWT_SECRET=your_secret_key \
  --name actix-doc \
  actix-doc

# 查看日志
docker logs -f actix-doc
```

### 环境变量配置

在 `docker-compose.yml` 或 `.env` 中配置：

```env
DATABASE_URL=sqlite:/app/data/data.db
JWT_SECRET=your_secret_key_min_32_chars
RUST_LOG=info
```

## 🔧 自动化构建

项目使用 `build.rs` 实现自动化：

- ✅ `cargo build` 时自动检测 `front/out` 是否存在
- ✅ 如不存在，自动运行 `pnpm install` 和 `pnpm run build`
- ✅ 自动复制构建产物到 `static/` 目录
- ✅ 智能检测 `front/src` 文件变化并重新构建

**手动控制前端重建**:

```bash
# Windows CMD
set REBUILD_FRONT=1 && cargo build

# Windows PowerShell
$env:REBUILD_FRONT=1; cargo build

# Linux/macOS
REBUILD_FRONT=1 cargo build
```

> 💡 **提示**: 如果删除了 `front/out` 或 `static/` 目录，使用此命令强制重新构建前端。

## 🔑 环境变量

在根目录 `.env`:

```env
DATABASE_URL=sqlite:./data.db
JWT_SECRET=your_secret_key_min_32_chars
RUST_LOG=info
```

## 👤 默认用户

首次启动时会自动创建默认管理员账户：

- **管理员**: `admin` / `admin`
- **演示用户**: `demo` / `demo` (自动创建，用于测试)

> ⚠️ **重要**：生产环境请立即修改默认密码！

## 📚 API 文档

- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `GET /documents` - 获取文档列表
- `GET /documents/{id}` - 获取单个文档
- `POST /documents` - 创建文档
- `PUT /documents/{id}` - 更新文档
- `DELETE /documents/{id}` - 删除文档

## 🛠️ 开发建议

- 使用 `cargo watch -x run` 实现后端热重载
- 前端修改在开发模式下会自动热更新
- CORS 已配置为 permissive，方便开发调试
- 生产环境建议使用 Docker 部署

## 📝 License

MIT
