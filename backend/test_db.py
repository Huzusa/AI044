import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db

print("=== 数据库连接测试 ===")
print()

try:
    app = create_app()
    with app.app_context():
        print(f"数据库 URL: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print()
        
        print("尝试连接数据库...")
        db.engine.connect()
        print("✓ 数据库连接成功！")
        print()
        
        print("尝试创建表...")
        db.create_all()
        print("✓ 表创建成功！")
        print()
        
        print("=== 测试通过 ===")
        
except Exception as e:
    print(f"✗ 连接失败: {str(e)}")
    print()
    print("可能的原因：")
    print("1. MySQL 服务未启动")
    print("2. 数据库配置错误（用户名/密码/数据库名）")
    print("3. 数据库 'inkscribe' 未创建")
    print()
    print("请确保：")
    print("1. 在 MySQL 中执行: CREATE DATABASE inkscribe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    print("2. 修改 backend/.env 文件中的 MYSQL_PASSWORD")
    sys.exit(1)
