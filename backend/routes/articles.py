from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Article, User

articles_bp = Blueprint('articles', __name__)


def _get_current_user():
    username = get_jwt_identity()
    current_app.logger.info(f'[Articles] JWT identity: {username}')
    user = User.query.filter_by(username=username).first()
    if user:
        current_app.logger.info(f'[Articles] found user: id={user.id}, username={user.username}')
    else:
        current_app.logger.warning(f'[Articles] user not found for identity: {username}')
    return user


@articles_bp.route('', methods=['GET'])
@jwt_required()
def list_articles():
    try:
        user = _get_current_user()
        if not user:
            return jsonify({'ok': False, 'error': '用户不存在'}), 404
        user_id = user.id

        limit = min(int(request.args.get('limit', 20)), 100)
        offset = int(request.args.get('offset', 0))
        tag = request.args.get('tag', '').strip()

        query = Article.query.filter_by(user_id=user_id, is_published=True)
        total = query.count()
        current_app.logger.info(f'[Articles] total articles found: {total}')
        query = query.order_by(Article.created_at.desc())
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
        current_app.logger.error(f'[Articles] list error: {e}')
        return jsonify({'ok': False, 'error': str(e)}), 500


@articles_bp.route('/<int:article_id>', methods=['GET'])
@jwt_required()
def get_article(article_id):
    try:
        user = _get_current_user()
        if not user:
            return jsonify({'ok': False, 'error': '用户不存在'}), 404
        user_id = user.id

        article = Article.query.filter_by(id=article_id, user_id=user_id).first()
        if not article:
            return jsonify({'ok': False, 'error': '文章不存在'}), 404

        article.view_count = (article.view_count or 0) + 1
        db.session.commit()

        return jsonify({
            'ok': True,
            'article': article.to_dict(),
        })
    except Exception as e:
        current_app.logger.error(f'[Articles] get error: {e}')
        return jsonify({'ok': False, 'error': str(e)}), 500


@articles_bp.route('', methods=['POST'])
@jwt_required()
def create_article():
    try:
        user = _get_current_user()
        if not user:
            return jsonify({'ok': False, 'error': '用户不存在'}), 404
        user_id = user.id

        body = request.get_json(force=True, silent=True) or {}
        title = (body.get('title') or '').strip()
        content = (body.get('content') or '').strip()

        if not title or not content:
            return jsonify({'ok': False, 'error': '标题和正文不能为空'}), 400

        article = Article(
            user_id=user_id,
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
        current_app.logger.info(f'[Articles] created article id={article.id} for user_id={user_id}')

        return jsonify({
            'ok': True,
            'article': article.to_dict(),
        }), 201
    except Exception as e:
        current_app.logger.error(f'[Articles] create error: {e}')
        db.session.rollback()
        return jsonify({'ok': False, 'error': str(e)}), 500


@articles_bp.route('/<int:article_id>', methods=['PUT'])
@jwt_required()
def update_article(article_id):
    try:
        user = _get_current_user()
        if not user:
            return jsonify({'ok': False, 'error': '用户不存在'}), 404
        user_id = user.id

        article = Article.query.filter_by(id=article_id, user_id=user_id).first()
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
        current_app.logger.error(f'[Articles] update error: {e}')
        db.session.rollback()
        return jsonify({'ok': False, 'error': str(e)}), 500


@articles_bp.route('/<int:article_id>', methods=['DELETE'])
@jwt_required()
def delete_article(article_id):
    try:
        user = _get_current_user()
        if not user:
            return jsonify({'ok': False, 'error': '用户不存在'}), 404
        user_id = user.id

        article = Article.query.filter_by(id=article_id, user_id=user_id).first()
        if not article:
            return jsonify({'ok': False, 'error': '文章不存在'}), 404

        article.is_published = False
        db.session.commit()

        return jsonify({'ok': True, 'message': '已删除'})
    except Exception as e:
        current_app.logger.error(f'[Articles] delete error: {e}')
        db.session.rollback()
        return jsonify({'ok': False, 'error': str(e)}), 500
