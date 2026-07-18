# 墨染 AI 写作工坊

一款基于 AI 的独立写作工具，为写作者提供灵感激发、结构规划、表达优化等辅助功能。

## 功能特性

### 📝 核心写作功能
- **富文本编辑器**：支持标题、粗体、斜体、列表等格式化
- **文章管理**：保存、编辑、删除个人文章
- **书架视图**：卡片式展示已保存文章，以标题为封面

### 🤖 AI 辅助工具（9个）
1. **结构参考**：根据关键词生成文章结构方向
2. **相关资料**：查找背景资料、名言、数据
3. **表达参考**：给出3种表达角度参考
4. **深度反问**：针对已写内容提出引导性问题
5. **灵感骰子**：抛出感官细节/微场景/微小冲突
6. **归纳分析**：提炼摘要、标签、修改建议
7. **标题生成**：生成5个不同风格的备选标题
8. **句子润色**：润色选中的文字
9. **写作思路**：提供续写思路方向

### 👤 用户系统
- **注册/登录**：基于 JWT 的用户认证
- **个人设置**：修改用户名、邮箱、密码
- **数据统计**：文章总数、累计字数、AI辅助文章数

## 技术栈

### 前端
- **框架**：Next.js 14 (App Router)
- **语言**：React + JavaScript
- **样式**：Tailwind CSS 3
- **图标**：Lucide React

### 后端
- **框架**：Flask 2
- **语言**：Python 3.10+
- **数据库**：TiDB Cloud (MySQL 兼容)
- **认证**：Flask-JWT-Extended
- **AI 模型**：阿里云通义千问 (qwen-plus)

## 快速开始

### 环境要求
- Python 3.10+
- Node.js 18+

### 后端启动

```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 设置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和 API Key

# 启动服务
python app.py
```

后端服务运行在：http://localhost:5000

### 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端页面运行在：http://localhost:3000

## 环境变量配置

### 后端 .env 文件

```env
# 数据库配置（TiDB Cloud）
MYSQL_HOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
MYSQL_PORT=4000
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=inkscribe

# JWT 密钥（至少32字符）
SECRET_KEY=your-secret-key-at-least-32-characters
JWT_SECRET_KEY=your-jwt-secret-key-at-least-32-characters

# AI 模型配置
DASHSCOPE_API_KEY=your_dashscope_api_key
QWEN_MODEL=qwen-plus
```

### 获取 AI API Key

1. 访问 [阿里云通义千问控制台](https://dashscope.console.aliyun.com/)
2. 创建 API Key
3. 将 Key 填入 `.env` 文件

## 项目结构

```
AI/001/
├── backend/                 # 后端服务
│   ├── app.py               # 入口文件
│   ├── config.py            # 配置文件
│   ├── models.py            # 数据库模型
│   ├── requirements.txt     # 依赖列表
│   ├── routes/              # API 路由
│   │   ├── auth.py          # 用户认证路由
│   │   ├── articles.py      # 文章相关路由
│   │   └── ai.py            # AI 服务路由
│   └── services/            # 业务服务
│       └── ai_service.py    # AI 服务逻辑
└── frontend/                # 前端应用
    ├── app/                 # Next.js App Router
    │   ├── article/         # 文章详情页
    │   ├── login/           # 登录页
    │   ├── my/              # 个人中心
    │   │   ├── posts/       # 我的文章
    │   │   ├── bookshelf/   # 我的书架
    │   │   └── settings/    # 个人设置
    │   ├── register/        # 注册页
    │   └── write/           # 写作页面
    ├── components/          # 公共组件
    ├── context/             # React Context
    ├── utils/               # 工具函数
    └── package.json         # 前端依赖
```

## 部署

### 前端部署（Vercel）

1. 登录 Vercel
2. 导入项目仓库
3. 设置环境变量：
   - `NEXT_PUBLIC_API_URL`: 后端 API 地址

### 后端部署（Render / Railway）

1. 创建 Python Web 服务
2. 设置环境变量
3. 部署命令：`python app.py`

### 数据库（TiDB Cloud）

使用 TiDB Cloud Serverless Tier，免费额度：
- 1GB 存储空间
- 每月 100GB 数据传输

## API 文档

详见 `docs/api.md`

## License

MIT