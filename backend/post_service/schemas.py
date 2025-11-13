from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    college: Optional[str] = None

    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    content: str

class PostResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    owner_id: int
    owner: UserResponse

    class Config:
        from_attributes = True