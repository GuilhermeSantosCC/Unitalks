from pydantic import BaseModel, EmailStr
from typing import Optional

# Schema base, com os campos que vêm do Register.tsx
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    college: Optional[str] = None
    course: Optional[str] = None
    password: str

# Schema para o login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema para retornar dados (NUNCA retorne a senha)
class User(BaseModel):
    id: int
    name: str
    email: EmailStr
    college: Optional[str] = None
    course: Optional[str] = None

    class Config:
        orm_mode = True # Permite o Pydantic ler o modelo SQLAlchemy

# Schema para o token de login
class Token(BaseModel):
    access_token: str
    token_type: str