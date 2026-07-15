from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON

db = SQLAlchemy()


class Article(db.Model):
    __tablename__ = 'articles'

    id = db.Column(db.Integer, primary_key=True)
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
