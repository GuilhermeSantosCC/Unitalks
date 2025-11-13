from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql.expression import text
from database import Base 

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) 
    email = Column(String, unique=True, nullable=False)
    college = Column(String, nullable=True) 

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), 
                        nullable=False, server_default=text('now()'))
    
    agree_count = Column(Integer, nullable=False, server_default=text('0'))
    disagree_count = Column(Integer, nullable=False, server_default=text('0'))
    
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    owner = relationship("User")
    
    # cascade="all, delete-orphan": Se um Post é apagado, todas as suas 'replies' são apagadas.
    replies = relationship("Reply", back_populates="post", cascade="all, delete-orphan")

class Vote(Base):
    __tablename__ = "votes"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    vote_type = Column(Integer, nullable=False) 

# --- NOVA TABELA ---
class Reply(Base):
    __tablename__ = "replies"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), 
                        nullable=False, server_default=text('now()'))

    # Chave estrangeira para o dono (autor) da resposta
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Chave estrangeira para o post ao qual a resposta pertence
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)

    # Suporte para respostas aninhadas (uma resposta pode ter um 'pai')
    parent_reply_id = Column(Integer, ForeignKey("replies.id", ondelete="CASCADE"), nullable=True)

    # Relações do SQLAlchemy
    owner = relationship("User")
    post = relationship("Post", back_populates="replies")