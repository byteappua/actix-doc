# mdBook 文档

本项目使用 [mdBook](https://rust-lang.github.io/mdBook/) 构建和部署文档。

## 安装 mdBook

```bash
cargo install mdbook
```

## 构建文档

```bash
# 构建静态 HTML
mdbook build

# 输出目录: book/
```

## 本地预览

```bash
# 启动开发服务器（支持热重载）
mdbook serve

# 访问 http://localhost:3000
```

## 部署

### GitHub Pages

1. 构建文档：

```bash
mdbook build
```

1. 将 `book/` 目录部署到 GitHub Pages

### 自托管

将 `book/` 目录部署到任何静态文件服务器（Nginx、Apache 等）

## 文档结构

```
docs/
├── SUMMARY.md          # 目录（必需）
├── README.md           # 首页
├── DEVELOPMENT.md      # 开发指南
├── API.md              # API 文档
├── ARCHITECTURE.md     # 架构说明
└── DEPLOYMENT.md       # 部署指南
```

## 编辑文档

1. 修改 `docs/` 下的 Markdown 文件
2. 更新 `docs/SUMMARY.md` 目录（如果添加新页面）
3. 运行 `mdbook serve` 预览
4. 提交更改

## 自定义主题

编辑 `book.toml` 配置主题：

```toml
[output.html]
default-theme = "rust"  # 可选: light, rust, coal, navy, ayu
```

## 更多信息

- [mdBook 官方文档](https://rust-lang.github.io/mdBook/)
- [mdBook GitHub](https://github.com/rust-lang/mdBook)
