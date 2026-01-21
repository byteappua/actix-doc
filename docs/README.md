# Actix+Next.js 文档管理系统

欢迎使用 **Actix+Next.js 文档管理系统**！

这是一个使用 Rust (Actix Web) 和 TypeScript (Next.js) 构建的现代化文档管理平台。

## 特性

- 🚀 **高性能**: Rust 后端 + Next.js 前端
- 🔐 **安全**: JWT 认证 + Argon2 密码哈希
- 📝 **富文本编辑**: 基于 Tiptap 的编辑器
- 🎨 **现代 UI**: shadcn/ui + Tailwind CSS
- 🐳 **容器化**: 完整的 Docker 支持
- 📁 **文件夹管理**: 树形目录结构

## 快速导航

- [开发指南](./DEVELOPMENT.md) - 了解如何在本地开发
- [API 文档](./API.md) - REST API 接口参考
- [架构说明](./ARCHITECTURE.md) - 系统设计与架构
- [部署指南](./DEPLOYMENT.md) - 生产环境部署

## 技术栈

**后端**:

- Actix Web 4.x
- SQLx (SQLite)
- Argon2 + JWT

**前端**:

- Next.js 16
- shadcn/ui
- Tailwind CSS
- Tiptap

## 默认账户

首次启动时会自动创建管理员账户：

- **用户名**: `admin`
- **密码**: `admin`

> ⚠️ 生产环境请立即修改默认密码！
