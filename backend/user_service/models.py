from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

# Tabela de associação para o sistema de "Seguir"
# (Many-to-Many: Um usuário segue muitos, e é seguido por muitos)
follows = Table(
    'follows', Base.metadata,
    Column('follower_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('followed_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # Nome de exibição
    # Username agora é obrigatório e único
    username = Column(String, unique=True, index=True, nullable=False) 
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Opcionais
    college = Column(String, nullable=True)
    course = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    
    profile_picture = Column(String, nullable=True)
    cover_picture = Column(String, nullable=True)
    
    linkedin = Column(String, nullable=True)
    instagram = Column(String, nullable=True)
    github = Column(String, nullable=True)
    custom_link = Column(String, nullable=True)
    uni_link = Column(String, nullable=True)

    # Relacionamento de seguidores
    followers = relationship(
        "User", 
        secondary=follows,
        primaryjoin=id==follows.c.followed_id,
        secondaryjoin=id==follows.c.follower_id,
        backref="following" # Cria user.following automaticamente
    )