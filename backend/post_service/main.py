from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
import models, schemas, database, auth
from typing import List

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

# --- Configuração do CORS (sem alteração) ---
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://192.168.0.148:8080", 
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints da API de Posts ---

@app.get("/posts/", response_model=List[schemas.PostResponse])
def get_posts(db: Session = Depends(database.get_db)):
    """
    Busca todos os posts E OS DADOS DO DONO (owner).
    """
    # 3. ATUALIZADO: Usamos 'joinedload' para otimizar a busca
    # Isso faz o SQLAlchemy buscar os posts E os usuários de uma vez
    posts = db.query(models.Post).options(joinedload(models.Post.owner)).all()
    return posts

@app.post("/posts/", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post: schemas.PostCreate, 
    db: Session = Depends(database.get_db),
    # 4. ATUALIZADO: Esta rota agora EXIGE um usuário logado
    # A função 'get_current_user' vai rodar primeiro
    current_user: models.User = Depends(auth.get_current_user) 
):
    """
    Cria um novo post usando o ID do usuário que veio do token.
    """
    
    # 5. ATUALIZADO: Trocamos o 'fake_user_id' pelo ID real
    new_post = models.Post(
        content=post.content,
        owner_id=current_user.id  # <-- O ID real do usuário logado!
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    # 6. ATUALIZADO: Recarregamos o post com os dados do 'owner'
    # para que a resposta (PostResponse) venha completa.
    # (Este passo é necessário porque o 'new_post' original não tem o 'owner' carregado)
    db_post = db.query(models.Post).options(joinedload(models.Post.owner)).filter(models.Post.id == new_post.id).first()
    
    return db_post