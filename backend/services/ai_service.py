import json
import random
import re
import requests
from flask import current_app


def _clean_html(html: str) -> str:
    """清洗 HTML 标签，返回纯文本"""
    if not html:
        return ''
    html = re.sub(r'<[^>]+>', '', html)
    html = re.sub(r'&nbsp;', ' ', html)
    html = re.sub(r'\s+', ' ', html)
    return html.strip()


def _call_llm(system_prompt: str, user_prompt: str, response_json=True):
    """统一调用大模型，优先 OpenAI，失败后尝试通义千问，都失败则返回 None"""
    openai_key = current_app.config.get('OPENAI_API_KEY', '').strip()
    dashscope_key = current_app.config.get('DASHSCOPE_API_KEY', '').strip()

    if openai_key:
        result = _call_openai(system_prompt, user_prompt, response_json)
        if result is not None:
            return result
        current_app.logger.warning('[AI Service] OpenAI 调用失败，尝试通义千问')

    if dashscope_key:
        result = _call_qwen(system_prompt, user_prompt, response_json)
        if result is not None:
            return result
        current_app.logger.warning('[AI Service] 通义千问调用失败')

    current_app.logger.error('[AI Service] 所有 AI 模型调用均失败')
    return None


def _call_openai(system_prompt: str, user_prompt: str, response_json: bool):
    try:
        url = f"{current_app.config['OPENAI_BASE_URL'].rstrip('/')}/chat/completions"
        headers = {
            'Authorization': f"Bearer {current_app.config['OPENAI_API_KEY']}",
            'Content-Type': 'application/json',
        }
        body = {
            'model': current_app.config['OPENAI_MODEL'],
            'temperature': 0.7,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
        }
        if response_json:
            body['response_format'] = {'type': 'json_object'}
        resp = requests.post(url, headers=headers, json=body, timeout=60)
        resp.raise_for_status()
        content = resp.json()['choices'][0]['message']['content']
        if response_json:
            return json.loads(content)
        return content
    except Exception as e:
        current_app.logger.error(f'[OpenAI] 调用失败: {e}')
        return None


def _call_qwen(system_prompt: str, user_prompt: str, response_json: bool):
    try:
        url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
        headers = {
            'Authorization': f"Bearer {current_app.config['DASHSCOPE_API_KEY']}",
            'Content-Type': 'application/json',
        }
        body = {
            'model': current_app.config['QWEN_MODEL'],
            'temperature': 0.7,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
        }
        if response_json:
            body['response_format'] = {'type': 'json_object'}
        current_app.logger.info(f'[Qwen] 正在调用 API，模型: {current_app.config["QWEN_MODEL"]}')
        resp = requests.post(url, headers=headers, json=body, timeout=60)
        resp.raise_for_status()
        content = resp.json()['choices'][0]['message']['content']
        current_app.logger.info(f'[Qwen] 调用成功，返回内容长度: {len(content)}')
        if response_json:
            return json.loads(content)
        return content
    except Exception as e:
        current_app.logger.error(f'[Qwen] 调用失败: {e}')
        return None


def generate_outline(keywords: str):
    """AI 生成文章结构参考方向（注意：是「参考」，不是成文）"""
    system = """你是一位资深的写作教练，不是代写者。
你的任务是：根据用户给出的关键词，给出5个左右的「文章结构参考方向」。
每个条目包含 title（这一部分的主题）和 hint（写作提示，告诉作者怎么展开，但绝对不直接写内容）。
请严格返回 JSON 格式，形如：
{
  "outline": [
    {"title": "开场画面：...", "hint": "从某个感官细节切入，比如气味..."},
    ...
  ]
}"""
    user = f"请给出围绕关键词「{keywords}」的文章结构参考方向，5条左右。"
    result = _call_llm(system, user)
    if result and 'outline' in result:
        return result['outline']
    return None


def find_materials(topic: str):
    """查找与某主题相关的背景资料、名言、数据"""
    system = """你是一位写作研究员。请为给定的主题提供写作素材卡片：
1. background: 3条左右的背景常识/历史脉络（事实性内容）
2. quotes: 2-3条可迁移引用的名言或观点，每条为 {"text":"...", "source":"..."}
3. data_points: 2-3个带数值的数据点，每条为 {"value":"约XX%", "desc":"...描述..."}
所有数据请加上「建议自行核实」的意识，数据可以是典型调研方向的占位。
严格返回 JSON，键名就是 background、quotes、data_points。"""
    user = f"主题：{topic}\n请输出该主题的写作素材卡片。"
    result = _call_llm(system, user)
    if result:
        return result
    return None


def expression_references(meaning: str):
    """给出表达角度参考（结构+关键词，不给成品句）"""
    system = """用户想表达某个意思（或给出了一段草稿），请提供 3 种「表达角度参考」。
注意：绝对不要直接写成品句子！只给出「角度名」「句式结构」「关键词搭配」。
每条结构：
{
  "angle": "感官描写切入",
  "structure": "先写A → 再点出B → 补一个C动作",
  "keywords": ["气味", "温度", "忽然", ...]
}
严格返回 JSON：{"references": [ ...3条 ]}"""
    user = f"用户想表达/当前草稿如下：\n「{meaning}」\n\n请给出3种不同的表达角度参考。"
    result = _call_llm(system, user)
    if result and 'references' in result:
        return result['references']
    return None


def deep_questions(content: str, context: str = ''):
    """针对已写内容，提出引导性的深度问题"""
    content = _clean_html(content)
    context = _clean_html(context)
    system = """你是一位敏锐的写作导师，不是润色者。
针对作者写的内容，提出 3 个「引导性问题」，每个问题要让作者不得不写得更深更细。
不要问 Yes/No 问题。
每条问题格式：
{
  "text": "这段叙述里，如果只保留一个细节让读者记住，你会选哪一个？能不能扩写2-3句？",
  "why": "检查是否抓住了核心意象，避免流水账"
}
严格返回 JSON：{"questions": [ ...3条 ]}"""
    user = f"全文/上下文（供参考）：\n{context}\n\n重点针对的段落：\n{content}\n\n请输出3个引导性深度问题。"
    result = _call_llm(system, user)
    if result and 'questions' in result:
        return result['questions']
    return None


def inspiration_fragments(theme: str):
    """灵感碎片：感官细节 x 微场景 x 微小冲突"""
    system = """你是一个「灵感骰子」。围绕给定的主题，抛出三类写作碎片（都是一句话的小点子，作者自己挑选融入）：
1. sensory: 4条左右的感官细节（眼耳鼻舌身意的具体印象）
2. scenes: 3条左右的微场景（日常但有张力的瞬间画面）
3. conflicts: 3条左右的微小冲突/心口不一/欲言又止的小状况
严格返回 JSON，键名 sensory/scenes/conflicts。
不要写大段文字，每条一两句话。"""
    user = f"主题：{theme}\n请输出三组灵感碎片。"
    result = _call_llm(system, user)
    if result:
        return result
    return None


def analyze_article(title: str, content: str):
    """写后分析：提炼摘要、标签、修改建议（但不重写）"""
    content = _clean_html(content)
    system = """请对用户已写完的文章做分析。记住：你是编辑不是代写，只分析建议不重写。
返回 JSON：
{
  "summary": "120字以内的客观摘要（基于用户已写内容，不要添加你编造的情节）",
  "tags": ["标签1", "标签2", "标签3" ... 不超过4个],
  "suggestions": [
    {"title": "📌 情绪落点更清晰", "detail": "建议在哪一段怎么做..."},
    {"title": "📌 精简形容词堆砌", "detail": "..."},
    {"title": "📌 首尾呼应", "detail": "..."}
  ]
}
suggestions 至少3条，每条具体、可操作。"""
    user = f"文章标题：{title}\n\n正文内容：\n{content}\n\n请输出分析结果。"
    result = _call_llm(system, user)
    if result:
        return result
    return None


# ============ 以下为无 KEY 时的 MOCK 兜底 ============

def _mock_outline(kw):
    pieces = [p.strip() for p in kw.replace('、', ',').split(',') if p.strip()]
    w = pieces[0] if pieces else kw
    return [
        {'title': f'开场画面：与「{w}」有关的一个具体瞬间', 'hint': '从某个感官细节切入，比如气味/声音/触感，不要写大道理'},
        {'title': '交代背景：那是什么时候、我在哪、和谁', 'hint': '2-3句说清时空，避免冗长的铺垫'},
        {'title': '核心故事：印象最深的那一件小事', 'hint': '要有冲突或转折，哪怕是内心的纠结'},
        {'title': '双线：当时的感受 VS 现在回头看', 'hint': '拉开时间距离，让文章有厚度'},
        {'title': '结尾：回到当下，留一个有余味的意象', 'hint': '可呼应开头的某个细节，形成闭环'},
    ]


def _mock_materials(topic):
    return {
        'background': [
            f'「{topic}」这一议题，在不同文化语境中都有长期讨论，概念边界也随时代变迁。',
            f'近20年，关于{topic}的社会接受度/讨论度发生了可感知的变化，与城市化和媒介演变相关。',
            f'心理学层面，人们对{topic}的态度往往与童年依恋模式和核心价值观相关。',
        ],
        'quotes': [
            {'text': f'关于{topic}，真正重要的东西，用眼睛是看不见的。', 'source': '改写自《小王子》'},
            {'text': '我们不是被事情本身困扰，而是被对事情的看法所困扰。', 'source': '爱比克泰德（可迁移至本主题）'},
        ],
        'data_points': [
            {'value': '约 65-70%', 'desc': f'的受访者表示曾在人生某阶段深入思考过「{topic}」相关问题'},
            {'value': '3~5 次', 'desc': '一个人平均会在不同年龄段重新审视该议题'},
        ],
    }


def _mock_expression(meaning):
    return [
        {
            'angle': '感官描写切入',
            'structure': '先写一个具体的感官印象（气味/温度/声音）→ 再点出这个感觉对应想表达的意思 → 补一个小动作收尾',
            'keywords': ['气味', '温度', '指尖', '忽然', '那个瞬间'],
        },
        {
            'angle': '反话 / 自我调侃',
            'structure': '先说一句看似相反的自嘲 → "但其实 / 后来我才明白" → 再说真正想说的 → 最后轻描淡写带过',
            'keywords': ['说来可笑', '以前一直以为', '其实', '不过是', '罢了'],
        },
        {
            'angle': '用具象的物做比喻',
            'structure': '找一件日常物品（旧T恤/半杯水/没关的灯）→ 写它的2-3个细节 → 每个细节对应一层意思',
            'keywords': ['就像', '好比', '像极了', '正如'],
        },
    ]


def _mock_questions(content):
    length = max(10, len(content))
    ratio = min(0.5, length / 200)
    return [
        {
            'text': f'如果从你写的这 {length} 字里只保留一个细节让读者记住，你会选哪一个？能不能把那个细节再扩写 2-3 句？',
            'why': '检查是否抓住了核心意象，避免流水账',
        },
        {
            'text': '如果把叙述视角切换到另一个人（对面的人/旁观者/小时候的自己），他们会看到什么你没写的东西？',
            'why': '避免视角单一，发现盲区',
        },
        {
            'text': '这段叙述背后，你"没说出口"的真实情绪是什么？遗憾？愧疚？释然？敢不敢直接写一句？',
            'why': '很多文章写得"隔"，是作者回避了最真的那句话',
        },
    ]


def _mock_inspiration(theme):
    sensory_pool = [
        '空气里有雨水混合柏油路的味道',
        '冰箱门打开时那盏黄光照亮半张脸',
        '老式电扇转动发出的嗡嗡低频声',
        '指尖翻旧书时纸边的粗糙颗粒感',
        '冷饮玻璃杯外壁凝出的水珠顺着指缝流下',
        '午夜走廊尽头声控灯亮起又灭掉的 30 秒',
        '刚晒过的被子有阳光和灰尘的混合味',
    ]
    scenes_pool = [
        '公交车上，两个陌生人同时伸手抓同一根扶手，又同时缩回去',
        '超市货架前，一个小孩举着两样东西犹豫了整整三分钟',
        '深夜阳台对面楼，只剩唯一一盏灯还亮着',
        '外卖小哥在雨里停下车，用袖子擦了擦手机屏幕上的水',
        '排队结账时，前面的老人把东西一样一样摆得很整齐',
    ]
    conflicts_pool = [
        '嘴上说"随便"，但心里其实有非常明确的想要',
        '明明很感动，却用开玩笑的语气把话题岔开',
        '想开口道歉，最后却变成了一句"吃饭了吗"',
        '对方发了一大段话，你删了又改最后只回了个"嗯"',
        '已经走到门口了，却又折返回来想说些什么，最终还是走了',
    ]
    return {
        'sensory': random.sample(sensory_pool, k=4),
        'scenes': random.sample(scenes_pool, k=3),
        'conflicts': random.sample(conflicts_pool, k=3),
    }


def _mock_analyze(title, content):
    length = len(content)
    tags_pool = ['生活随笔', '个人成长', '回忆叙事', '散文诗歌', '读书笔记', '职场思考', '旅行游记']
    tags = random.sample(tags_pool, k=3)
    return {
        'summary': (
            f'本文围绕「{title[:12]}」展开，优点是能抓住具体细节让读者进入情境，'
            f'目前约 {length} 字。建议在"为什么这件事重要"和"对现在的影响"上着墨更多，'
            f'给读者一个清晰的情绪落点。'
        ),
        'tags': tags,
        'suggestions': [
            {
                'title': '📌 情绪落点更清晰',
                'detail': '读者读完应产生什么感受？共鸣/唏嘘/释然？建议在倒数第二段用 1-2 句直接点出，不要全靠读者猜。',
            },
            {
                'title': '📌 减少副词堆砌',
                'detail': '数一下"非常/特别/真的/很"的使用次数，把其中 60% 换成具体行为或细节（例："非常难过"→"那天我没吃晚饭"）。',
            },
            {
                'title': '📌 尝试首尾呼应',
                'detail': '如果开头写了某个意象（夏天/午后/一盏灯），结尾可用现在时态再提一次，形成穿越感。',
            },
        ],
    }
