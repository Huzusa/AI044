from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON
from passlib.context import CryptContext

db = SQLAlchemy()
pwd_context = CryptContext(schemes=['pbkdf2_sha256'], deprecated='auto')


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    articles = db.relationship('Article', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = pwd_context.hash(password)

    def check_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
        }


class Article(db.Model):
    __tablename__ = 'articles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), nullable=False, default='匿名作者')

    ai_summary = db.Column(db.Text, nullable=True)
    ai_tags = db.Column(JSON, nullable=True)
    ai_reader_comments = db.Column(JSON, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    view_count = db.Column(db.Integer, default=0)
    is_published = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'content': self.content,
            'author': self.author,
            'ai_summary': self.ai_summary,
            'ai_tags': self.ai_tags or [],
            'ai_reader_comments': self.ai_reader_comments or [],
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'updated_at': self.updated_at.isoformat() + 'Z' if self.updated_at else None,
            'view_count': self.view_count or 0,
        }
