from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    college: Optional[str] = None
    course: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None # @handle
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

class UserResponse(BaseModel):
    id: int
    name: str
    username: Optional[str] = None
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

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str