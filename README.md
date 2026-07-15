# 墨染 · AI 写作工坊 ✒️

> 一个融合AI辅助写作的文章发布平台，从构思到发布全流程AI陪伴。

---

## 📌 项目介绍

「墨染」是一款面向内容创作者的AI辅助写作社区。用户不仅可以发布和阅读文章，更重要的是在写作的**每一个环节**都能获得AI的帮助：

- ✍️ **写前**：输入几个关键词，AI自动生成完整写作大纲
- 🎨 **写中**：卡住了？AI帮你续写；不满意？AI帮你润色/变换文风
- 🔍 **写后**：AI自动生成摘要、标签、SEO建议，甚至从读者视角提出犀利评论

## 🛠 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 前端 | **Next.js 14** (App Router) | React框架，服务端渲染 |
| 前端样式 | **Tailwind CSS** | 原子化CSS，快速构建UI |
| 前端组件 | **shadcn/ui** | 高质量可复用组件 |
| 后端 | **Flask 3** | 轻量级Python Web框架 |
| 数据库 | **SQLite** | 单文件数据库，无需额外部署 |
| ORM | **SQLAlchemy** | Python SQL工具包 |
| AI能力 | **OpenAI / 通义千问 API** | 写作大纲、续写、摘要、标签生成 |

## 📁 项目结构

```
.
├── frontend/              # Next.js 前端 (VSCode 打开)
│   ├── app/
│   │   ├── page.js        # 首页 - 文章广场
│   │   ├── write/page.js  # 写作页 - AI辅助编辑器
│   │   ├── article/
│   │   │   └── [id]/page.js # 文章详情页
│   │   └── my/
│   │       └── posts/page.js # 我的文章
│   ├── components/        # 可复用组件
│   └── package.json
│
└── backend/               # Flask 后端 (IDEA 打开)
    ├── app.py             # 应用入口
    ├── models.py          # 数据库模型
    ├── routes/
    │   ├── articles.py    # 文章CRUD接口
    │   └── ai.py          # AI辅助写作接口
    ├── services/
    │   └── ai_service.py  # AI调用封装
    ├── requirements.txt
    └── instance/
        └── inkscribe.db   # SQLite数据库文件
```

## 🚀 安装与运行

### 一、启动后端 (IDEA 终端)

```bash
cd backend

# 1. 创建虚拟环境 (推荐)
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux

# 2. 安装依赖
pip install -r requirements.txt

# 3. 配置环境变量
# 复制 .env.example 为 .env，填入你的 API Key
copy .env.example .env

# 4. 启动服务 (默认端口 5000)
python app.py
```

后端启动后访问：http://localhost:5000/api/health 检查是否成功

### 二、启动前端 (VSCode 终端)

```bash
cd frontend

# 1. 安装依赖
npm install
# 或 yarn install / pnpm install

# 2. 配置环境变量
# 复制 .env.local.example 为 .env.local
copy .env.local.example .env.local

# 3. 启动开发服务器 (默认端口 3000)
npm run dev
```

前端启动后访问：http://localhost:3000

## 📡 API 接口文档

详细的接口文档请见：[API_DOC.md](./API_DOC.md)

### 快速概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/articles` | 获取文章列表（支持分页） |
| POST | `/api/articles` | 发布新文章 |
| GET | `/api/articles/:id` | 获取文章详情 |
| **POST** | **`/api/ai/generate-outline`** | **AI生成写作大纲** |
| **POST** | **`/api/ai/assist-writing`** | **AI续写/润色/文风转换** |
| **POST** | **`/api/ai/analyze-article`** | **AI分析文章（摘要+标签+评论）** |

## 🌐 线上部署地址

> ⏳ 待部署后填写
>
> - 前端 Demo：https://your-project.vercel.app
> - 后端 API：https://your-project.onrender.com

## 📸 项目截图

> ⏳ 开发完成后补充截图
>
> 1. 首页文章广场
> 2. AI写作编辑器界面
> 3. 文章详情（AI分析结果区）
> 4. 我的文章管理

## 🤖 AI Code Review 报告

> ⏳ 开发完成后，使用 AI 工具进行一次代码审查，将优化建议粘贴在此处或单独文件。
>
> 推荐工具：Trae IDE / Cursor / GitHub Copilot Chat

## 📝 开发Git提交规范

请使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 新增功能 (例如 feat: 添加AI生成大纲接口)
fix: 修复Bug (例如 fix: 修复编辑器换行丢失问题)
docs: 文档更新
style: 代码样式调整（不影响逻辑）
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

---

## 🎯 考核对应清单

| 考核项 | 完成状态 | 备注 |
|--------|---------|------|
| 线上可访问URL | ⏳ | 待部署 |
| 前端≥3路由 | ✅ | 广场/写作/详情/我的 |
| 后端≥3API | ✅ | 文章CRUD + 3个AI接口共6个 |
| Git≥3天有效提交 | ⏳ | 开发中 |
| Commit描述规范 | ⏳ | 参考上文规范 |
| Prompt日志 | 📄 | 见 [prompt_log.md](./prompt_log.md) |
| README文档 | ✅ | 本文件 |
| API文档 | ✅ | 见 [API_DOC.md](./API_DOC.md) |
| AI Code Review | ⏳ | 待补充 |
| 个人总结报告 | ⏳ | 500字以上 |
