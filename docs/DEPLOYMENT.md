# 部署指南

## Docker 部署（推荐）

### 使用 Docker Compose

```bash
# 克隆仓库
git clone <repository-url>
cd actix-doc

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 手动 Docker 部署

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
```

## 本地部署

### 前置要求

- Rust 1.70+
- Node.js 18+
- pnpm

### 构建步骤

```bash
# 构建发布版本
cargo build --release

# 二进制文件位于
./target/release/actix-doc
```

### 运行

```bash
# 设置环境变量
export DATABASE_URL=sqlite:./data.db
export JWT_SECRET=your_production_secret_key
export RUST_LOG=info

# 运行
./target/release/actix-doc
```

## 环境变量配置

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | 数据库连接 URL | `sqlite:./data.db` |
| `JWT_SECRET` | JWT 密钥（至少32字符） | 无 |
| `RUST_LOG` | 日志级别 | `info` |

## 生产环境注意事项

### 安全性

1. **修改默认密码**
   - 默认管理员账户：`admin/admin`
   - 首次登录后立即修改

2. **设置强 JWT Secret**

   ```bash
   # 生成随机密钥
   openssl rand -base64 32
   ```

3. **配置 HTTPS**
   - 使用 Nginx 反向代理
   - 配置 SSL 证书

4. **数据库备份**

   ```bash
   # SQLite 备份
   sqlite3 data.db ".backup data-backup.db"
   ```

### 性能优化

1. **使用发布版本构建**

   ```bash
   cargo build --release
   ```

2. **启用日志轮转**
   - 避免日志文件过大

3. **定期清理**
   - 清理过期数据
   - 优化数据库

## Nginx 反向代理示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
