from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        body = request.get_json(force=True, silent=True) or {}
        username = (body.get('username') or '').strip()
        password = body.get('password', '')
        email = (body.get('email') or '').strip()

        if not username or len(username) < 3:
            return jsonify({'ok': False, 'error': '用户名至少需要3个字符'}), 400
        if not password or len(password) < 6:
            return jsonify({'ok': False, 'error': '密码至少需要6个字符'}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({'ok': False, 'error': '该用户名已被注册'}), 400
        if email and User.query.filter_by(email=email).first():
            return jsonify({'ok': False, 'error': '该邮箱已被注册'}), 400

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        return jsonify({
            'ok': True,
            'message': '注册成功',
            'user': user.to_dict(),
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'ok': False, 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        body = request.get_json(force=True, silent=True) or {}
        username = (body.get('username') or '').strip()
        password = body.get('password', '')

        if not username or not password:
            return jsonify({'ok': False, 'error': '用户名和密码不能为空'}), 400

        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            return jsonify({'ok': False, 'error': '用户名或密码错误'}), 401

        access_token = create_access_token(identity=user.username)

        return jsonify({
            'ok': True,
            'message': '登录成功',
            'access_token': access_token,
            'user': user.to_dict(),
        })
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'ok': False, 'error': '用户不存在'}), 404

        return jsonify({'ok': True, 'user': user.to_dict()})
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500
