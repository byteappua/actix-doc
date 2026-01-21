# API 文档

## 认证 API

### 用户注册

**POST** `/auth/register`

**请求体**:

```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:

```json
{
  "token": "string",
  "username": "string"
}
```

### 用户登录

**POST** `/auth/login`

**请求体**:

```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:

```json
{
  "token": "string",
  "username": "string"
}
```

**示例**:

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

## 文档 API

### 获取文档列表

**GET** `/documents`

**响应**:

```json
[
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "parent_id": "string",
    "is_folder": boolean,
    "owner_id": "string",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

### 获取单个文档

**GET** `/documents/{id}`

**响应**:

```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "parent_id": "string",
  "is_folder": boolean,
  "owner_id": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### 创建文档

**POST** `/documents`

**请求体**:

```json
{
  "title": "string",
  "content": "string",
  "parent_id": "string",
  "is_folder": boolean,
  "owner_id": "string"
}
```

### 更新文档

**PUT** `/documents/{id}`

**请求体**:

```json
{
  "title": "string",
  "content": "string"
}
```

### 删除文档

**DELETE** `/documents/{id}`

**响应**: 204 No Content
