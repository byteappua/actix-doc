# 架构说明

## 技术架构

### 整体架构

```
┌─────────────────────────────────────────────┐
│            浏览器 / 客户端                    │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST API
┌──────────────────▼──────────────────────────┐
│         Actix Web Server (Rust)             │
│  ┌─────────────────────────────────────┐    │
│  │  静态文件服务 (前端)                 │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │  API Routes                         │    │
│  │  - /auth/*   (认证)                 │    │
│  │  - /documents/* (文档管理)           │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │  Middleware                         │    │
│  │  - CORS                             │    │
│  │  - Logger                           │    │
│  │  - (Future: JWT Auth)               │    │
│  └─────────────────────────────────────┘    │
└──────────────────┬──────────────────────────┘
                   │ SQLx
┌──────────────────▼──────────────────────────┐
│         SQLite Database                     │
│  ┌─────────────┐  ┌─────────────┐           │
│  │   users     │  │  documents  │           │
│  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────┘
```

## 后端架构 (Actix Web)

### 模块划分

```
src/
├── main.rs          # 应用入口，服务器配置
├── auth.rs          # 认证逻辑（注册/登录）
├── docs.rs          # 文档 CRUD 操作
├── models.rs        # 数据模型定义
├── errors.rs        # 错误处理
└── db.rs            # 数据库连接池
```

### 认证流程

```
用户注册/登录
    ↓
密码哈希 (Argon2)
    ↓
生成 JWT Token
    ↓
返回给客户端
    ↓
后续请求携带 Token (Header: Authorization: Bearer <token>)
```

### 数据库设计

**users 表**:

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**documents 表**:

```sql
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    parent_id TEXT,
    is_folder BOOLEAN NOT NULL DEFAULT 0,
    owner_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

## 前端架构 (Next.js)

### 技术栈

- **框架**: Next.js 16 (App Router)
- **UI 库**: shadcn/ui + Radix UI
- **样式**: Tailwind CSS
- **编辑器**: Tiptap
- **状态管理**: React Context (计划)
- **HTTP 客户端**: Fetch API

### 目录结构

```
front/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根布局 (Server Component)
│   ├── page.tsx            # 首页
│   ├── login/              # 登录页面
│   ├── login/              # 登录页面
│   ├── register/           # 注册页面
│   └── documents/          # 文档页面
│       └── page.tsx        # 文档编辑器 (Query Params)
├── components/             # 组件
│   ├── layout/             # 布局组件
│   │   ├── AuthLayout.tsx  # 认证布局 (Client Component)
│   │   └── AppSidebar.tsx  # 侧边栏
│   ├── editor/             # 编辑器
│   └── ui/                 # shadcn/ui 组件
└── lib/                    # 工具函数
    ├── api.ts              # API 客户端
    ├── auth.tsx            # 认证上下文 (AuthProvider)
    └── utils.ts            # 通用工具
```

### 组件层次

```
RootLayout (Server)
  └── AuthLayout (Client)
      ├── AuthProvider (Context)
      │   ├── Login/Register Page (Public)
      │   └── Protected Route
      │       ├── AppSidebar (Sidebar)
      │       └── Page Content (Main)
      │           └── Editor
      └── (Redirect if unauthenticated)
```

## 构建流程

### 开发模式

```
开发者修改代码
    ↓
前端: pnpm run dev (localhost:3000)
后端: cargo run (localhost:8080)
    ↓
前端调用后端 API (跨域通过 CORS)
```

### 生产模式

```
cargo build
    ↓
build.rs 执行
    ↓
检测 front/src 变化
    ↓
pnpm run build (生成 front/out/)
    ↓
复制到 static/
    ↓
cargo 继续编译 Rust 代码
    ↓
生成包含前端的单一二进制文件
```

## 部署架构

### Docker 多阶段构建

```
Stage 1: Frontend Builder (Node.js)
  → 构建 Next.js 静态文件

Stage 2: Backend Builder (Rust)
  → 编译 Rust 应用
  → 复制 Stage 1 的静态文件

Stage 3: Runtime (Debian Slim)
  → 仅包含二进制文件和静态资源
  → 最小化镜像大小
```

## 安全设计

### 密码安全

- **哈希算法**: Argon2 (内存硬度高，抗 GPU 破解)
- **随机盐**: 每个密码独立盐值

### JWT 认证

- **签名算法**: HS256
- **过期时间**: 7天 (可配置)
- **密钥管理**: 环境变量

### SQL 注入防护

- **参数化查询**: 使用 sqlx! 宏
- **类型安全**: 编译时检查

## 性能优化

### 后端

- **连接池**: SQLx 连接池复用
- **异步 I/O**: 基于 Tokio 的异步运行时
- **静态文件**: 直接由 Actix 服务（无需反向代理）

### 前端

- **静态生成**: Next.js 静态导出
- **代码分割**: 自动按路由分割
- **资源优化**: 自动压缩 CSS/JS

## 扩展性

### 水平扩展

- 使用 PostgreSQL 替代 SQLite
- 添加 Redis 缓存层
- 部署多实例 + 负载均衡

### 功能扩展

- WebSocket 实时协作
- 文件上传/附件
- 版本历史
- 权限管理
