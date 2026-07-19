import os
import urllib.parse
from dotenv import load_dotenv

_basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(_basedir, '.env'))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'inkscribe-dev-secret-key-change-me-123456')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'inkscribe-dev-secret-key-change-me-123456')

    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'inkscribe')

    encoded_password = urllib.parse.quote_plus(MYSQL_PASSWORD)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f'mysql+mysqlconnector://{MYSQL_USER}:{encoded_password}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    mysql_ssl_ca = os.environ.get('MYSQL_SSL_CA', '')
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 3600,
    }
    if mysql_ssl_ca:
        SSL_CERT_PATH = os.path.join(_basedir, mysql_ssl_ca)
        SQLALCHEMY_ENGINE_OPTIONS['connect_args'] = {
            'ssl_ca': SSL_CERT_PATH
        }

    JSON_AS_ASCII = False
    JSONIFY_PRETTYPRINT_REGULAR = True

    CORS_ORIGIN = os.environ.get('CORS_ORIGIN', 'http://localhost:3000')

    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')
    OPENAI_BASE_URL = os.environ.get('OPENAI_BASE_URL', 'https://api.openai.com/v1')

    DASHSCOPE_API_KEY = os.environ.get('DASHSCOPE_API_KEY', '')
    QWEN_MODEL = os.environ.get('QWEN_MODEL', 'qwen-plus')
