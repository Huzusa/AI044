# API 文档

## 基础信息

- **基础 URL**: `http://localhost:5000/api`
- **认证方式**: JWT Token (Bearer)
- **响应格式**: JSON

## 认证机制

### 获取 Token

登录或注册后，服务端返回 `access_token`，后续请求需在 Header 中携带：

```http
Authorization: Bearer <access_token>
```

### 响应格式

**成功响应**:
```json
{
  "ok": true,
  "data": { ... }
}
```

**失败响应**:
```json
{
  "ok": false,
  "error": "错误描述"
}
```

---

## 用户认证

### 1. 注册

**POST** `/api/auth/register`

请求体:
```json
{
  "username": "用户名",
  "password": "密码（至少6位）",
  "email": "邮箱（可选）"
}
```

成功响应:
```json
{
  "ok": true,
  "message": "注册成功",
  "user": {
    "id": 1,
    "username": "demo",
    "email": "demo@example.com"
  }
}
```

### 2. 登录

**POST** `/api/auth/login`

请求体:
```json
{
  "username": "用户名",
  "password": "密码"
}
```

成功响应:
```json
{
  "ok": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "demo",
    "email": "demo@example.com"
  }
}
```

### 3. 获取当前用户

**GET** `/api/auth/me`

需要认证: ✅

成功响应:
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "username": "demo",
    "email": "demo@example.com",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

### 4. 更新个人信息

**PUT** `/api/auth/update-profile`

需要认证: ✅

请求体:
```json
{
  "username": "新用户名（可选）",
  "email": "新邮箱（可选）"
}
```

成功响应:
```json
{
  "ok": true,
  "message": "更新成功",
  "user": { ... }
}
```

### 5. 修改密码

**PUT** `/api/auth/change-password`

需要认证: ✅

请求体:
```json
{
  "current_password": "当前密码",
  "new_password": "新密码（至少6位）"
}
```

成功响应:
```json
{
  "ok": true,
  "message": "密码修改成功"
}
```

---

## 文章管理

### 1. 获取文章列表

**GET** `/api/articles`

需要认证: ✅

查询参数:
| 参数 | 类型 | 说明 |
|------|------|------|
| `page` | int | 页码，默认1 |
| `limit` | int | 每页数量，默认20 |
| `status` | string | 状态筛选：`published`（默认）、`draft`、`all` |

成功响应:
```json
{
  "ok": true,
  "articles": [
    {
      "id": 1,
      "title": "文章标题",
      "content": "<p>正文内容...</p>",
      "author": "作者名",
      "ai_summary": "AI生成的摘要",
      "ai_tags": ["标签1", "标签2"],
      "status": "published",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

### 2. 创建文章

**POST** `/api/articles`

需要认证: ✅

请求体:
```json
{
  "title": "文章标题",
  "content": "<p>正文内容</p>",
  "author": "作者名",
  "ai_summary": "AI生成的摘要（可选）",
  "ai_tags": ["标签1", "标签2"]
}
```

成功响应:
```json
{
  "ok": true,
  "article": {
    "id": 1,
    "title": "文章标题",
    ...
  }
}
```

### 3. 获取文章详情

**GET** `/api/articles/:id`

需要认证: ✅

路径参数:
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | int | 文章ID |

成功响应:
```json
{
  "ok": true,
  "article": { ... }
}
```

### 4. 更新文章

**PUT** `/api/articles/:id`

需要认证: ✅

路径参数:
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | int | 文章ID |

请求体:
```json
{
  "title": "新标题",
  "content": "<p>新内容</p>",
  "ai_summary": "新摘要",
  "ai_tags": ["新标签"]
}
```

成功响应:
```json
{
  "ok": true,
  "article": { ... }
}
```

### 5. 删除文章

**DELETE** `/api/articles/:id`

需要认证: ✅

路径参数:
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | int | 文章ID |

成功响应:
```json
{
  "ok": true,
  "message": "删除成功"
}
```

---

## AI 服务

所有 AI 接口均需要认证。

### 1. 结构参考

**POST** `/api/ai/generate-outline`

功能: 根据关键词生成文章结构参考方向

请求体:
```json
{
  "keywords": "夏日、毕业、告别"
}
```

成功响应:
```json
{
  "ok": true,
  "outline": [
    {"title": "开场画面：...", "hint": "写作提示..."},
    {"title": "交代背景：...", "hint": "写作提示..."},
    {"title": "核心故事：...", "hint": "写作提示..."},
    {"title": "双线：...", "hint": "写作提示..."},
    {"title": "结尾：...", "hint": "写作提示..."}
  ]
}
```

### 2. 相关资料

**POST** `/api/ai/find-materials`

功能: 查找与主题相关的背景资料、名言、数据

请求体:
```json
{
  "topic": "胡同文化"
}
```

成功响应:
```json
{
  "ok": true,
  "materials": {
    "background": ["背景资料1", "背景资料2", "背景资料3"],
    "quotes": [
      {"text": "名言内容", "source": "来源"},
      {"text": "名言内容", "source": "来源"}
    ],
    "data_points": [
      {"value": "约XX%", "desc": "数据描述"},
      {"value": "约XX", "desc": "数据描述"}
    ]
  }
}
```

### 3. 表达参考

**POST** `/api/ai/expression-refs`

功能: 给出3种表达角度参考（结构+关键词）

请求体:
```json
{
  "meaning": "我很怀念小时候的夏天"
}
```

成功响应:
```json
{
  "ok": true,
  "references": [
    {
      "angle": "感官描写切入",
      "structure": "先写A → 再点出B → 补一个C动作",
      "keywords": ["气味", "温度", "忽然"]
    },
    ...
  ]
}
```

### 4. 深度反问

**POST** `/api/ai/deep-questions`

功能: 针对已写内容提出引导性深度问题

请求体:
```json
{
  "content": "要分析的段落内容",
  "context": "全文上下文（可选）"
}
```

成功响应:
```json
{
  "ok": true,
  "questions": [
    {
      "text": "引导性问题内容...",
      "why": "问题目的说明"
    },
    ...
  ]
}
```

### 5. 灵感骰子

**POST** `/api/ai/inspiration-fragments`

功能: 围绕主题抛出感官细节、微场景、微小冲突

请求体:
```json
{
  "theme": "遗憾"
}
```

成功响应:
```json
{
  "ok": true,
  "fragments": {
    "sensory": ["感官细节1", "感官细节2", "感官细节3", "感官细节4"],
    "scenes": ["微场景1", "微场景2", "微场景3"],
    "conflicts": ["微小冲突1", "微小冲突2", "微小冲突3"]
  }
}
```

### 6. 归纳分析

**POST** `/api/ai/analyze-article`

功能: 基于已写内容，分析并返回摘要、标签、修改建议

请求体:
```json
{
  "title": "文章标题",
  "content": "<p>正文内容</p>"
}
```

成功响应:
```json
{
  "ok": true,
  "analysis": {
    "summary": "文章摘要（120字以内）",
    "tags": ["标签1", "标签2", "标签3", "标签4"],
    "suggestions": [
      {"title": "修改建议标题", "detail": "具体建议内容"},
      {"title": "修改建议标题", "detail": "具体建议内容"},
      {"title": "修改建议标题", "detail": "具体建议内容"}
    ]
  }
}
```

### 7. 标题生成

**POST** `/api/ai/generate-titles`

功能: 根据文章内容生成5个不同风格的备选标题

请求体:
```json
{
  "title": "原标题",
  "content": "<p>正文内容</p>"
}
```

成功响应:
```json
{
  "ok": true,
  "titles": ["标题1", "标题2", "标题3", "标题4", "标题5"]
}
```

### 8. 句子润色

**POST** `/api/ai/polish-sentence`

功能: 针对一句话提供3种润色方案

请求体:
```json
{
  "sentence": "需要润色的句子",
  "context": "上下文（可选）"
}
```

成功响应:
```json
{
  "ok": true,
  "suggestions": [
    {
      "polished": "润色后的句子",
      "reason": "修改理由"
    },
    ...
  ]
}
```

### 9. 写作思路

**POST** `/api/ai/continue-writing`

功能: 根据已写内容，提供3个续写思路方向

请求体:
```json
{
  "content": "用户刚写完的部分",
  "context": "全文上下文（可选）"
}
```

成功响应:
```json
{
  "ok": true,
  "continuation": [
    {
      "direction": "续写方向名称",
      "hint": "具体写作提示",
      "keywords": ["关键词1", "关键词2", "关键词3"]
    },
    ...
  ]
}
```

---

## 错误码

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未认证或 Token 无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 422 | JWT Token 解析失败 |
| 500 | 服务器内部错误 |
| 503 | AI 服务暂时不可用 |

---

## CORS 配置

服务端已配置 CORS，允许以下来源:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`

生产环境需在配置文件中添加允许的域名。