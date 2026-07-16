from flask import Blueprint, request, jsonify, current_app
from services import ai_service

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/generate-outline', methods=['POST'])
def api_generate_outline():
    """
    POST /api/ai/generate-outline
    Body: { keywords: "夏日、毕业、告别" }
    生成文章结构参考方向
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        keywords = (body.get('keywords') or '').strip()
        if not keywords:
            return jsonify({'ok': False, 'error': '关键词不能为空'}), 400

        outline = ai_service.generate_outline(keywords)
        if outline is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'outline': outline})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500


@ai_bp.route('/find-materials', methods=['POST'])
def api_find_materials():
    """
    POST /api/ai/find-materials
    Body: { topic: "胡同文化" }
    查找写作资料（背景/名言/数据）
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        topic = (body.get('topic') or '').strip()
        if not topic:
            return jsonify({'ok': False, 'error': '主题不能为空'}), 400

        materials = ai_service.find_materials(topic)
        if materials is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'materials': materials})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500


@ai_bp.route('/expression-refs', methods=['POST'])
def api_expression_refs():
    """
    POST /api/ai/expression-refs
    Body: { meaning: "我很怀念小时候的夏天" }
    给出 3 种表达角度参考（结构+关键词，不给成品句）
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        meaning = (body.get('meaning') or '').strip()
        if not meaning:
            return jsonify({'ok': False, 'error': '内容不能为空'}), 400

        references = ai_service.expression_references(meaning)
        if references is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'references': references})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500


@ai_bp.route('/deep-questions', methods=['POST'])
def api_deep_questions():
    """
    POST /api/ai/deep-questions
    Body: { content: "...", context?: "全文..." }
    针对已写内容提出引导性深度问题
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        content = (body.get('content') or '').strip()
        context = (body.get('context') or '').strip()
        if not content:
            return jsonify({'ok': False, 'error': '内容不能为空'}), 400

        questions = ai_service.deep_questions(content, context)
        if questions is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'questions': questions})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500


@ai_bp.route('/inspiration-fragments', methods=['POST'])
def api_inspiration_fragments():
    """
    POST /api/ai/inspiration-fragments
    Body: { theme: "遗憾" }
    输出灵感碎片：感官细节 x 微场景 x 微小冲突
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        theme = (body.get('theme') or '').strip() or '生活'
        fragments = ai_service.inspiration_fragments(theme)
        if fragments is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'fragments': fragments})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500


@ai_bp.route('/analyze-article', methods=['POST'])
def api_analyze_article():
    """
    POST /api/ai/analyze-article
    Body: { title, content }
    基于已写内容，分析并返回：summary 摘要 / tags 标签 / suggestions 修改建议
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        title = (body.get('title') or '').strip()
        content = (body.get('content') or '').strip()
        if not title or not content:
            return jsonify({'ok': False, 'error': '标题和正文不能为空'}), 400

        analysis = ai_service.analyze_article(title, content)
        if analysis is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'analysis': analysis})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500


@ai_bp.route('/analyze-tone', methods=['POST'])
def api_analyze_tone():
    """
    POST /api/ai/analyze-tone
    Body: { content }
    分析文章的语气风格和情绪基调
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        content = (body.get('content') or '').strip()
        if not content:
            return jsonify({'ok': False, 'error': '内容不能为空'}), 400

        tone = ai_service.analyze_tone(content)
        if tone is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'tone': tone})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500


@ai_bp.route('/check-logic', methods=['POST'])
def api_check_logic():
    """
    POST /api/ai/check-logic
    Body: { content }
    检查文章段落间的逻辑连贯性
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        content = (body.get('content') or '').strip()
        if not content:
            return jsonify({'ok': False, 'error': '内容不能为空'}), 400

        logic = ai_service.check_logic(content)
        if logic is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'logic': logic})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500


@ai_bp.route('/vocabulary-upgrade', methods=['POST'])
def api_vocabulary_upgrade():
    """
    POST /api/ai/vocabulary-upgrade
    Body: { content }
    词汇升级建议：提供更精准的词汇替换
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        content = (body.get('content') or '').strip()
        if not content:
            return jsonify({'ok': False, 'error': '内容不能为空'}), 400

        upgrade = ai_service.vocabulary_upgrade(content)
        if upgrade is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'upgrade': upgrade})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500


@ai_bp.route('/suggest-open-close', methods=['POST'])
def api_suggest_open_close():
    """
    POST /api/ai/suggest-open-close
    Body: { title, content }
    开头结尾优化建议
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        title = (body.get('title') or '').strip()
        content = (body.get('content') or '').strip()
        if not title or not content:
            return jsonify({'ok': False, 'error': '标题和正文不能为空'}), 400

        result = ai_service.suggest_open_close(title, content)
        if result is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'result': result})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500
