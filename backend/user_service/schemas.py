from pydantic import BaseModel, EmailStr
from typing import Optional

# Define o que o /register espera
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    college: Optional[str] = None
    course: Optional[str] = None
    password: str

# Define o que o /login espera
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Define o que a API devolve (para /register e /users/me)
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    college: Optional[str] = None
    course: Optional[str] = None

    class Config:
        from_attributes = True

# Define o que a API /token devolve
class Token(BaseModel):
    access_token: str
    token_type: str