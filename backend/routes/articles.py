from flask import Blueprint, request, jsonify
from models import db, Article

articles_bp = Blueprint('articles', __name__)


@articles_bp.route('', methods=['GET'])
def list_articles():
    """
    GET /api/articles?limit=20&offset=0&tag=xxx&author=xxx
    获取文章列表（分页 + 筛选）
    """
    try:
        limit = min(int(request.args.get('limit', 20)), 100)
        offset = int(request.args.get('offset', 0))
        tag = request.args.get('tag', '').strip()
        author = request.args.get('author', '').strip()

        query = Article.query.filter_by(is_published=True)

        if author:
            query = query.filter(Article.author.like(f'%{author}%'))

        query = query.order_by(Article.created_at.desc())
        total = query.count()
        articles = query.offset(offset).limit(limit).all()

        result = [a.to_dict() for a in articles]

        if tag:
            result = [
                a for a in result
                if a['ai_tags'] and any(tag in t or t in tag for t in a['ai_tags'])
            ]

        return jsonify({
            'ok': True,
            'total': total,
            'limit': limit,
            'offset': offset,
            'articles': result,
        })
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500


@articles_bp.route('/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """
    GET /api/articles/:id
    获取单篇文章详情（浏览量+1）
    """
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'ok': False, 'error': '文章不存在'}), 404

        article.view_count = (article.view_count or 0) + 1
        db.session.commit()

        return jsonify({
            'ok': True,
            'article': article.to_dict(),
        })
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500


@articles_bp.route('', methods=['POST'])
def create_article():
    """
    POST /api/articles
    Body: { title, content, author, ai_summary?, ai_tags?, ai_reader_comments? }
    创建新文章
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        title = (body.get('title') or '').strip()
        content = (body.get('content') or '').strip()

        if not title or not content:
            return jsonify({'ok': False, 'error': '标题和正文不能为空'}), 400

        article = Article(
            title=title,
            content=content,
            author=(body.get('author') or '匿名作者').strip() or '匿名作者',
            ai_summary=body.get('ai_summary'),
            ai_tags=body.get('ai_tags'),
            ai_reader_comments=body.get('ai_reader_comments'),
            is_published=True,
            view_count=0,
        )
        db.session.add(article)
        db.session.commit()

        return jsonify({
            'ok': True,
            'article': article.to_dict(),
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'ok': False, 'error': str(e)}), 500


@articles_bp.route('/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    """
    PUT /api/articles/:id
    更新文章内容或AI分析字段
    """
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'ok': False, 'error': '文章不存在'}), 404

        body = request.get_json(force=True, silent=True) or {}

        if 'title' in body and body['title'].strip():
            article.title = body['title'].strip()
        if 'content' in body and body['content'].strip():
            article.content = body['content'].strip()
        if 'author' in body:
            article.author = (body['author'] or '匿名作者').strip() or '匿名作者'
        if 'ai_summary' in body:
            article.ai_summary = body['ai_summary']
        if 'ai_tags' in body:
            article.ai_tags = body['ai_tags']
        if 'ai_reader_comments' in body:
            article.ai_reader_comments = body['ai_reader_comments']

        db.session.commit()
        return jsonify({
            'ok': True,
            'article': article.to_dict(),
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'ok': False, 'error': str(e)}), 500


@articles_bp.route('/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    """
    DELETE /api/articles/:id
    删除文章（软删除：is_published = False）
    """
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'ok': False, 'error': '文章不存在'}), 404

        article.is_published = False
        db.session.commit()

        return jsonify({'ok': True, 'message': '已删除'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'ok': False, 'error': str(e)}), 500
