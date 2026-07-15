import os
from dotenv import load_dotenv

_basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(_basedir, '.env'))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'inkscribe-dev-secret-change-me')

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///' + os.path.join(_basedir, 'instance', 'inkscribe.db')
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {'connect_args': {'check_same_thread': False}}

    JSON_AS_ASCII = False
    JSONIFY_PRETTYPRINT_REGULAR = True

    CORS_ORIGIN = os.environ.get('CORS_ORIGIN', 'http://localhost:3000')

    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')
    OPENAI_BASE_URL = os.environ.get('OPENAI_BASE_URL', 'https://api.openai.com/v1')

    DASHSCOPE_API_KEY = os.environ.get('DASHSCOPE_API_KEY', '')
    QWEN_MODEL = os.environ.get('QWEN_MODEL', 'qwen-plus')
