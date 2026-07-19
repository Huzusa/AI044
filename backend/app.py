import os
import logging
from flask import Flask, jsonify, current_app
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db, Article, User
from routes.articles import articles_bp
from routes.ai import ai_bp
from routes.auth import auth_bp


db_initialized = False
db_init_error = None

def _init_database(app):
    global db_initialized, db_init_error
    if db_initialized:
        return
    try:
        with app.app_context():
            _create_database_if_not_exists()
            db.create_all()
            _seed_demo_data_if_empty()
        db_initialized = True
        db_init_error = None
        app.logger.info('✓ 数据库初始化成功')
    except Exception as e:
        db_initialized = False
        db_init_error = f'数据库连接失败: {str(e)}'
        app.logger.error(f'✗ 数据库初始化失败: {str(e)}')


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.json.ensure_ascii = False
    app.json.sort_keys = False

    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    )
    app.logger.setLevel(logging.INFO)

    CORS(
        app,
        resources={r'/api/*': {'origins': app.config['CORS_ORIGIN'].split(',')}},
        supports_credentials=True,
    )

    db.init_app(app)
    JWTManager(app)

    @app.before_request
    def before_request():
        _init_database(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(articles_bp, url_prefix='/api/articles')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')

    @app.route('/api/health')
    def health():
        return jsonify({
            'ok': True,
            'service': '墨染 · AI写作工坊 后端',
            'version': '1.0.0',
            'database': 'connected' if db_initialized else 'disconnected',
            'error': db_init_error,
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'ok': False, 'error': '接口不存在'}), 404

    @app.errorhandler(500)
    def server_error(e):
        app.logger.exception(e)
        return jsonify({'ok': False, 'error': '服务器内部错误'}), 500

    return app


def _create_database_if_not_exists():
    import urllib.parse
    from sqlalchemy import create_engine, text
    db_name = current_app.config['MYSQL_DB']
    host = current_app.config['MYSQL_HOST']
    port = current_app.config['MYSQL_PORT']
    user = current_app.config['MYSQL_USER']
    password = current_app.config['MYSQL_PASSWORD']
    mysql_ssl_ca = current_app.config.get('MYSQL_SSL_CA', '')
    
    encoded_password = urllib.parse.quote_plus(password)
    
    connect_args = {'ssl_mode': 'REQUIRED'}
    if mysql_ssl_ca:
        import os
        ssl_cert_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), mysql_ssl_ca)
        connect_args['ssl'] = {'ca': ssl_cert_path}
    
    engine = create_engine(
        f'mysql+pymysql://{user}:{encoded_password}@{host}:{port}/',
        connect_args=connect_args
    )
    
    with engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
        conn.commit()
    print(f'✓ 数据库 {db_name} 已确保存在')


def _seed_demo_data_if_empty():
    if User.query.count() == 0:
        demo_user = User(username='demo', email='demo@example.com')
        demo_user.set_password('demo123')
        db.session.add(demo_user)
        db.session.commit()
        print('✓ 已创建演示用户（用户名: demo, 密码: demo123）')

    if Article.query.count() > 0:
        return

    demo_user = User.query.filter_by(username='demo').first()
    if not demo_user:
        demo_user = User(username='demo')
        demo_user.set_password('demo123')
        db.session.add(demo_user)
        db.session.commit()

    demo = [
        Article(
            user_id=demo_user.id,
            title='关于夏天的十个碎片记忆',
            content='午后三点的阳光穿过梧桐叶，在课桌上投下斑驳的光影。电风扇吱呀地转着，粉笔灰在光柱里缓缓浮动。\n\n我趴在桌上，盯着黑板右上角倒计时牌上的数字，心里有一种说不清道不明的情绪。',
            author='盛夏光年',
            ai_summary='作者以十个生活碎片串联起对夏日的细腻观察，从阳光、蝉鸣到冰西瓜的甜，用克制的笔触写出了藏在平凡日常里的温柔。',
            ai_tags=['生活随笔', '散文诗歌', '青春回忆'],
            ai_reader_comments=[
                '第二段关于"夏天的味道"那段写得太有共鸣了，瞬间把我拉回了高中时代。',
                '如果能补充一两个具体同学的名字（哪怕化名），人物会更立体。',
            ],
            view_count=42,
        ),
        Article(
            user_id=demo_user.id,
            title='Next.js 14 App Router 迁移踩坑记录',
            content='最近在重构项目时全面转向了 App Router，相较于 Pages Router 确实有很多理念上的不同。\n\n这篇笔记记录了我遇到的 8 个典型问题，包括服务端组件通信、缓存策略、动态路由等，以及对应的实际解决方案。',
            author='代码笔记君',
            ai_summary='本文详细记录了从 Pages Router 迁移到 App Router 过程中遇到的典型问题，并给出了可操作的解决方案，适合正在做技术选型的同学参考。',
            ai_tags=['技术笔记', '前端开发'],
            ai_reader_comments=[
                '"不要把 useEffect 当生命周期用"这一条说到我心坎里了。',
                '建议补充一下 Server Actions 部分的坑，我当时踩了好久。',
            ],
            view_count=128,
        ),
    ]
    db.session.add_all(demo)
    db.session.commit()
    print('✓ 已插入 2 篇演示文章（首次启动）')


app = create_app()

if __name__ == '__main__':
    port = int(app.config.get('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
