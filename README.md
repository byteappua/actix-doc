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

## 🚀 快速开始

### 前置要求

- Rust 1.70+
- Node.js 18+
- npm 或 pnpm

### 开发环境运行

1. **克隆仓库**

```bash
git clone <repository-url>
cd actix-doc
```

1. **启动后端**

```bash
cd server
cargo run
```

后端将在 `http://127.0.0.1:8080` 启动

1. **启动前端** (新终端)

```bash
cd client
npm install
npm run dev
```

前端将在 `http://localhost:3000` 启动

1. **访问应用**  
打开浏览器访问 `http://localhost:3000`

### 生产环境部署

1. **构建前端**

```bash
cd client
npm run build
```

1. **复制静态文件**

```bash
cp -r out/* ../server/static/
```

1. **运行服务器**

```bash
cd ../server
cargo run --release
```

访问 `http://127.0.0.1:8080`

## 📁 项目结构

```
actix-doc/
├── server/          # Rust 后端
│   ├── src/
│   │   ├── main.rs      # 入口
│   │   ├── auth.rs      # 认证模块
│   │   ├── docs.rs      # 文档 CRUD
│   │   ├── models.rs    # 数据模型
│   │   └── ...
│   ├── migrations/      # 数据库迁移
│   └── Cargo.toml
└── client/          # Next.js 前端
    ├── src/
    │   ├── app/         # App Router 页面
    │   ├── components/  # UI 组件
    │   └── lib/         # 工具函数
    └── package.json
```

## 🔑 环境变量

在 `server/.env` 中配置：

```env
DATABASE_URL=sqlite:./data.db
JWT_SECRET=your_secret_key_min_32_chars
RUST_LOG=info
```

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
- 前端修改会自动热更新
- CORS 已配置为 permissive，方便开发调试

## 📝 License

MIT
