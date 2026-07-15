# 📡 API 接口文档（占考核 README 评分项）

> **Base URL（本地开发）**：`http://localhost:5000/api`
>
> 所有请求/响应均为 `application/json` 格式。
>
> 返回体统一结构：
> ```json
> { "ok": true, "...": "业务字段" }     // 成功
> { "ok": false, "error": "错误描述" }  // 失败
> ```

---

## 🧭 一、健康检查

### `GET /health`
后端探活接口，用于部署后校验。

**响应示例**：
```json
{
  "ok": true,
  "service": "墨染 · AI写作工坊 后端",
  "version": "1.0.0",
  "docs": "项目根目录的 API_DOC.md"
}
```

---

## 📝 二、文章相关（5 个接口）

---

### 2.1 获取文章列表

`GET /articles?limit=20&offset=0&tag=xxx&author=xxx`

**Query 参数（都可选）**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `limit` | int | 20 | 每页条数（最大 100） |
| `offset` | int | 0 | 跳过条数（分页用） |
| `tag` | string | — | 按 AI 标签模糊筛选 |
| `author` | string | — | 按作者名模糊筛选 |

**成功响应**（200 OK）：
```json
{
  "ok": true,
  "total": 2,
  "limit": 20,
  "offset": 0,
  "articles": [
    {
      "id": 1,
      "title": "关于夏天的十个碎片记忆",
      "content": "午后三点的阳光穿过梧桐叶...",
      "author": "盛夏光年",
      "ai_summary": "作者以十个生活碎片串联起...",
      "ai_tags": ["生活随笔", "散文诗歌", "青春回忆"],
      "ai_reader_comments": [
        "第二段关于夏天的味道那段太有共鸣了..."
      ],
      "created_at": "2026-07-10T08:30:00Z",
      "updated_at": "2026-07-10T08:30:00Z",
      "view_count": 42
    }
  ]
}
```

---

### 2.2 获取单篇文章详情

`GET /articles/:id`

> 每调用一次，`view_count` 自动 +1

**Path 参数**：
- `id` (int)：文章 ID

**成功响应**（200 OK）：结构同上 `articles[0]`，包裹在 `{ "ok": true, "article": {...} }` 里。

**失败响应**（404 Not Found）：
```json
{ "ok": false, "error": "文章不存在" }
```

---

### 2.3 创建新文章

`POST /articles`

**请求 Body**：
```json
{
  "title": "我的第一篇文章",
  "content": "## 标题\n\n正文正文正文...",
  "author": "张三（可选，默认匿名作者）",
  "ai_summary": "用户采纳的AI摘要（可选）",
  "ai_tags": ["标签1", "标签2"],
  "ai_reader_comments": ["读者建议1", "..."]
}
```

**字段要求**：
- `title` **必填**，非空字符串
- `content` **必填**，非空字符串

**成功响应**（201 Created）：
```json
{
  "ok": true,
  "article": { "id": 3, "title": "...", "..." : "..." }
}
```

**失败响应**（400 Bad Request）：
```json
{ "ok": false, "error": "标题和正文不能为空" }
```

---

### 2.4 更新文章

`PUT /articles/:id`

**请求 Body**（所有字段可选，只传要修改的）：
```json
{
  "title": "新标题",
  "content": "新正文",
  "author": "新作者",
  "ai_summary": "...",
  "ai_tags": ["..."],
  "ai_reader_comments": ["..."]
}
```

**成功响应**（200 OK）：返回更新后的完整 article 对象。

---

### 2.5 删除文章（软删除）

`DELETE /articles/:id`

> 采用软删除：`is_published = false`，文章列表里不再出现。

**成功响应**：
```json
{ "ok": true, "message": "已删除" }
```

---

## 🤖 三、AI 辅助写作相关（6 个接口）

> ⚠️ 设计理念：**所有 AI 接口只提供「素材 / 参考 / 引导」，绝不直接产出可直接复制粘贴的成品段落**。
>
> 所有接口的 system prompt 都强调：AI 是「写作研究员 / 教练 / 灵感骰子」，不是「代写者」。

---

### 3.1 结构参考方向

`POST /ai/generate-outline`

**Body**：
```json
{ "keywords": "夏日、毕业、成长的遗憾" }
```

**响应（5 条结构参考）**：
```json
{
  "ok": true,
  "outline": [
    {
      "title": "开场画面：与「夏日」有关的一个具体瞬间",
      "hint": "从某个感官细节切入，比如气味/声音，不要写大道理"
    },
    {
      "title": "交代背景：那是什么时候、我在哪、和谁",
      "hint": "2-3句说清时空，避免冗长的铺垫"
    }
  ]
}
```

---

### 3.2 查找写作资料（背景 / 名言 / 数据）

`POST /ai/find-materials`

**Body**：
```json
{ "topic": "胡同文化" }
```

**响应**：
```json
{
  "ok": true,
  "materials": {
    "background": [
      "胡同这一城市肌理形态，最早可追溯到元代大都的街巷规划...",
      "..."
    ],
    "quotes": [
      { "text": "胡同是北京的血脉。", "source": "汪曾祺（可迁移）" },
      { "...": "..." }
    ],
    "data_points": [
      { "value": "约 1400 条", "desc": "1949 年北京在册胡同数量（[建议核实]）" },
      { "...": "..." }
    ]
  }
}
```

---

### 3.3 表达角度参考（结构 + 关键词，不给成品句）

`POST /ai/expression-refs`

**Body**：
```json
{ "meaning": "我很怀念小时候的夏天" }
```

**响应（3 种参考角度）**：
```json
{
  "ok": true,
  "references": [
    {
      "angle": "感官描写切入",
      "structure": "先写一个具体的感官印象 → 再点出对应的情绪 → 补一个小动作收尾",
      "keywords": ["气味", "温度", "指尖", "忽然", "那个瞬间"]
    },
    { "...": "..." }
  ]
}
```

---

### 3.4 深度反问（针对已写内容）

`POST /ai/deep-questions`

**Body**：
```json
{
  "content": "（选中的一段文字）",
  "context": "（可选，全文用于背景参考）"
}
```

**响应（3 个引导问题）**：
```json
{
  "ok": true,
  "questions": [
    {
      "text": "如果只保留一个细节让读者记住，你会选哪一个？能不能再扩写 2-3 句？",
      "why": "检查是否抓住了核心意象，避免流水账"
    },
    { "...": "..." }
  ]
}
```

---

### 3.5 灵感碎片骰子

`POST /ai/inspiration-fragments`

**Body**：
```json
{ "theme": "遗憾" }
```

**响应（三类碎片）**：
```json
{
  "ok": true,
  "fragments": {
    "sensory": [
      "空气里有雨水混合柏油路的味道",
      "冰箱门打开时那盏黄光照亮半张脸",
      "..."
    ],
    "scenes": [
      "公交车上，两个陌生人同时伸手抓同一根扶手又同时缩回去",
      "..."
    ],
    "conflicts": [
      "嘴上说随便，心里其实有非常明确的想要",
      "..."
    ]
  }
}
```

---

### 3.6 文章归纳分析（写后）

`POST /ai/analyze-article`

**Body**：
```json
{
  "title": "文章标题",
  "content": "完整正文..."
}
```

**响应**：
```json
{
  "ok": true,
  "analysis": {
    "summary": "120字以内的客观摘要（基于用户已写内容，不编造）",
    "tags": ["生活随笔", "个人成长", "回忆叙事"],
    "suggestions": [
      {
        "title": "📌 情绪落点可以更清晰",
        "detail": "建议在倒数第二段用1-2句直接点出读者感受，不要全靠猜。"
      },
      { "...": "..." }
    ]
  }
}
```

---

## ❗️ 四、常见错误码汇总

| HTTP 状态码 | 场景 |
|-------------|------|
| 200 | 成功 |
| 201 | 创建成功（POST /articles） |
| 400 | 参数缺失 / 格式错误 |
| 404 | 文章不存在 / 接口路径错误 |
| 500 | 服务器内部错误（检查后端堆栈日志） |

---

## ✅ 五、Postman 测试截图清单（考核 B.1 要求）

建议按以下顺序在 Postman 中跑一遍，并**逐一截图保存**：

1. ✅ `GET /api/health` — 健康检查
2. ✅ `POST /api/articles` — 发布一篇测试文章
3. ✅ `GET /api/articles` — 列表能看到刚发布的
4. ✅ `GET /api/articles/:id` — 详情页 view_count 增长
5. ✅ `PUT /api/articles/:id` — 修改 title 成功
6. ✅ `POST /api/ai/generate-outline` — AI 结构参考正常返回
7. ✅ `POST /api/ai/analyze-article` — AI 分析正常返回摘要/标签/建议
8. ✅ `DELETE /api/articles/:id` — 删除后列表不再出现
