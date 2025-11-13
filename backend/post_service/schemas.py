from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Literal # <-- 'Literal' está no lugar correto

# --- Schema do Usuário (usado nas respostas) ---
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    college: Optional[str] = None

    class Config:
        from_attributes = True 

# --- Schema para criar um Post ---
class PostCreate(BaseModel):
    content: str

# --- Schema para Votar ---
class Vote(BaseModel):
    post_id: int
    vote_type: Literal['agree', 'disagree', 'none']

# --- NOVOS SCHEMAS PARA REPLIES ---

# O que a API devolve (definido ANTES de PostResponse)
class ReplyResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    post_id: int
    owner_id: int
    parent_reply_id: Optional[int] = None
    owner: UserResponse # Dados do autor

    class Config:
        from_attributes = True

# O que o front-end envia para criar uma resposta
class ReplyCreate(BaseModel):
    content: str
    parent_reply_id: Optional[int] = None


# --- Schema ATUALIZADO para responder um Post ---
class PostResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    owner_id: int
    owner: UserResponse
    agree_count: int
    disagree_count: int
    replies: List[ReplyResponse] = [] # Inclui a lista de respostas

    class Config:
        from_attributes = True