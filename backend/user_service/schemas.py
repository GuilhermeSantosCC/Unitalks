from pydantic import BaseModel, EmailStr
from typing import Optional, List

# --- Cadastro (Atualizado) ---
class UserCreate(BaseModel):
    name: str             # Nome de exibição
    username: str         # @usuario (Novo e Obrigatório)
    email: EmailStr
    college: Optional[str] = None
    course: Optional[str] = None
    password: str

# --- Login ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Update ---
class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    college: Optional[str] = None
    course: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    cover_picture: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    github: Optional[str] = None
    custom_link: Optional[str] = None
    uni_link: Optional[str] = None

# --- Resposta ---
class UserResponse(BaseModel):
    id: int
    name: str
    username: str # Agora é obrigatório na resposta
    email: EmailStr
    college: Optional[str] = None
    course: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    cover_picture: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    github: Optional[str] = None
    custom_link: Optional[str] = None
    uni_link: Optional[str] = None
    # Contagens para o perfil
    followers_count: int = 0
    following_count: int = 0

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str