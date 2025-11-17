from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
import models, schemas, security, database, auth

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

origins = [
    "http://localhost:8080", 
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8001",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Cadastro Atualizado ---
@app.post("/register/", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado.")
    
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Este nome de usuário já está em uso.")
    
    hashed_password = security.get_password_hash(user.password)
    
    db_user = models.User(
        email=user.email,
        username=user.username, # Salva o username
        name=user.name,
        college=user.college, # Pode ser null
        course=user.course,   # Pode ser null
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Endpoint de Login (ATUALIZADO) ---
@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    login_input = form_data.username

    user = db.query(models.User).filter(
        or_(
            models.User.email == login_input,
            models.User.username == login_input
        )
    ).first()

    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário/Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Perfil (Atualizado com contagens) ---
@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    # Adiciona contagens dinâmicas
    current_user.followers_count = len(current_user.followers)
    current_user.following_count = len(current_user.following)
    return current_user

@app.put("/users/me", response_model=schemas.UserResponse)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if user_update.username:
        exists = db.query(models.User).filter(models.User.username == user_update.username).first()
        if exists and exists.id != current_user.id:
             raise HTTPException(status_code=400, detail="Este nome de usuário já está em uso.")

    user_data = user_update.dict(exclude_unset=True)
    for key, value in user_data.items():
        setattr(current_user, key, value)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    current_user.followers_count = len(current_user.followers)
    current_user.following_count = len(current_user.following)
    return current_user

# --- NOVOS ENDPOINTS: Seguir/Deixar de Seguir ---

@app.post("/users/{user_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
def follow_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode seguir a si mesmo.")
    
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    # Se já segue, não faz nada
    if target_user in current_user.following:
        return 

    current_user.following.append(target_user)
    db.commit()
    return 

@app.delete("/users/{user_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
def unfollow_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    if target_user in current_user.following:
        current_user.following.remove(target_user)
        db.commit()
    
    return

# --- Endpoints de Listagem de Seguidores/Seguindo ---

@app.get("/users/{user_id}/followers", response_model=List[schemas.UserResponse])
def get_user_followers(user_id: int, db: Session = Depends(database.get_db)):

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    return user.followers

@app.get("/users/{user_id}/following", response_model=List[schemas.UserResponse])
def get_user_following(user_id: int, db: Session = Depends(database.get_db)):

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    return user.following