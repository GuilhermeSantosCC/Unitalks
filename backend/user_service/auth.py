from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from dotenv import load_dotenv
import os
import models
import schemas
import database

load_dotenv() 

SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = "HS256"

if SECRET_KEY is None:
    raise ValueError("Variável de ambiente SECRET_KEY não encontrada. Crie o .env")

# Aponta para o endpoint /token DESTE serviço (porta 8000)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") 

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if user is None:
        raise credentials_exception
        
    return user