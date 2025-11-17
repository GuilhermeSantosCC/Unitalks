from sqlalchemy import Column, Integer, String, Boolean, Text
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True) 
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    college = Column(String, nullable=True)
    course = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    
    profile_picture = Column(String, nullable=True) 
    cover_picture = Column(String, nullable=True)
    
    # Links Sociais
    linkedin = Column(String, nullable=True)
    instagram = Column(String, nullable=True)
    github = Column(String, nullable=True)
    custom_link = Column(String, nullable=True)
    uni_link = Column(String, nullable=True)