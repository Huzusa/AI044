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


@ai_bp.route('/generate-titles', methods=['POST'])
def api_generate_titles():
    """
    POST /api/ai/generate-titles
    Body: { title, content }
    根据文章内容生成5个备选标题
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        title = (body.get('title') or '').strip()
        content = (body.get('content') or '').strip()
        if not content:
            return jsonify({'ok': False, 'error': '正文不能为空'}), 400

        titles = ai_service.generate_titles(title, content)
        if titles is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'titles': titles})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500


@ai_bp.route('/polish-sentence', methods=['POST'])
def api_polish_sentence():
    """
    POST /api/ai/polish-sentence
    Body: { sentence, context }
    针对一句话提供润色建议（不改变原意，只优化表达）
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        sentence = (body.get('sentence') or '').strip()
        context = (body.get('context') or '').strip()
        if not sentence:
            return jsonify({'ok': False, 'error': '句子不能为空'}), 400

        suggestions = ai_service.polish_sentence(sentence, context)
        if suggestions is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'suggestions': suggestions})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500


@ai_bp.route('/continue-writing', methods=['POST'])
def api_continue_writing():
    """
    POST /api/ai/continue-writing
    Body: { content, context }
    根据已写内容续写一段（不超过150字）
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        content = (body.get('content') or '').strip()
        context = (body.get('context') or '').strip()
        if not content:
            return jsonify({'ok': False, 'error': '内容不能为空'}), 400

        continuation = ai_service.continue_writing(content, context)
        if continuation is None:
            return jsonify({'ok': False, 'error': 'AI 服务暂时不可用，请检查后端日志'}), 503
        return jsonify({'ok': True, 'continuation': continuation})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'ok': False, 'error': str(e)}), 500
