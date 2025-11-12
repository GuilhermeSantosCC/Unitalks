from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # Para o form de login
from sqlalchemy.orm import Session
import models
import schemas
import security
import database

# Cria as tabelas no banco de dados (se não existirem)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# --- Endpoint de Registro ---
@app.post("/register/", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # 1. Verifica se o email já existe
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 2. Cria o hash da senha
    hashed_password = security.get_password_hash(user.password)
    
    # 3. Cria o novo usuário no banco
    db_user = models.User(
        email=user.email,
        name=user.name,
        college=user.college,
        course=user.course,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Endpoint de Login ---
@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # 1. Encontra o usuário pelo email (o form usa 'username' por padrão)
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    # 2. Verifica se o usuário existe e se a senha está correta
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Cria o token de acesso
    access_token = security.create_access_token(
        data={"sub": user.email}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}