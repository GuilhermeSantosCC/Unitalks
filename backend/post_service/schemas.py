from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Literal

# Schema para o Usuário
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    college: Optional[str] = None

    class Config:
        from_attributes = True 

# Schema para criar post
class PostCreate(BaseModel):
    content: str

class PostResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    owner_id: int
    owner: UserResponse
    agree_count: int
    disagree_count: int

    class Config:
        from_attributes = True

class Vote(BaseModel):
    post_id: int
    vote_type: Literal['agree', 'disagree', 'none']