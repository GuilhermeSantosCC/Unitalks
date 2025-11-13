from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload 
import models, schemas, database, auth 
from typing import List

# Cria as tabelas (posts, votes, replies) se não existirem
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# --- Configuração do CORS ---
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

# --- Endpoints de Posts ---

@app.get("/posts/", response_model=List[schemas.PostResponse])
def get_posts(db: Session = Depends(database.get_db)):
    """
    Busca todos os posts, incluindo 'owner' e 'replies' com seus 'owners'.
    """
    posts = db.query(models.Post).options(
        joinedload(models.Post.owner), 
        joinedload(models.Post.replies).joinedload(models.Reply.owner)
    ).order_by(models.Post.created_at.desc()).all()
    
    return posts

@app.post("/posts/", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post: schemas.PostCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user) 
):
    new_post = models.Post(
        content=post.content,
        owner_id=current_user.id
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    db_post = db.query(models.Post).options(joinedload(models.Post.owner)).filter(models.Post.id == new_post.id).first()
    return db_post

@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    post_query = db.query(models.Post).filter(models.Post.id == post_id)
    post = post_query.first()

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post com id: {post_id} não encontrado."
        )
    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não autorizado a realizar esta ação."
        )

    post_query.delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# --- Endpoint de Voto ---
@app.post("/vote/", response_model=schemas.PostResponse)
def vote_post(
    vote: schemas.Vote, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == vote.post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Post com id {vote.post_id} não encontrado.")

    vote_query = db.query(models.Vote).filter(
        models.Vote.post_id == vote.post_id, 
        models.Vote.user_id == current_user.id
    )
    existing_vote = vote_query.first()

    if vote.vote_type == "none":
        if existing_vote:
            if existing_vote.vote_type == 1:
                post.agree_count -= 1
            elif existing_vote.vote_type == -1:
                post.disagree_count -= 1
            vote_query.delete(synchronize_session=False)
    
    elif vote.vote_type == "agree":
        vote_value = 1
        if existing_vote:
            if existing_vote.vote_type == -1: 
                existing_vote.vote_type = vote_value
                post.agree_count += 1
                post.disagree_count -= 1
        else:
            new_vote = models.Vote(post_id=vote.post_id, user_id=current_user.id, vote_type=vote_value)
            db.add(new_vote)
            post.agree_count += 1

    elif vote.vote_type == "disagree":
        vote_value = -1
        if existing_vote:
            if existing_vote.vote_type == 1:
                existing_vote.vote_type = vote_value
                post.disagree_count += 1
                post.agree_count -= 1
        else:
            new_vote = models.Vote(post_id=vote.post_id, user_id=current_user.id, vote_type=vote_value)
            db.add(new_vote)
            post.disagree_count += 1

    db.commit()
    db.refresh(post)
    
    db_post = db.query(models.Post).options(joinedload(models.Post.owner)).filter(models.Post.id == post.id).first()
    return db_post

# --- Endpoints de Respostas (Replies) ---

@app.get("/posts/{post_id}/replies", response_model=List[schemas.ReplyResponse])
def get_replies_for_post(post_id: int, db: Session = Depends(database.get_db)):
    replies = db.query(models.Reply).filter(models.Reply.post_id == post_id)\
        .options(joinedload(models.Reply.owner))\
        .order_by(models.Reply.created_at.asc())\
        .all()
    return replies

@app.post("/posts/{post_id}/replies", response_model=schemas.ReplyResponse, status_code=status.HTTP_201_CREATED)
def create_reply_for_post(
    post_id: int, 
    reply: schemas.ReplyCreate, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Post com id {post_id} não encontrado.")
    
    if reply.parent_reply_id:
        parent_reply = db.query(models.Reply).filter(models.Reply.id == reply.parent_reply_id).first()
        if not parent_reply:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Resposta 'pai' com id {reply.parent_reply_id} não encontrada.")

    new_reply = models.Reply(
        content=reply.content,
        post_id=post_id,
        owner_id=current_user.id,
        parent_reply_id=reply.parent_reply_id
    )

    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)

    db_reply = db.query(models.Reply).options(joinedload(models.Reply.owner))\
        .filter(models.Reply.id == new_reply.id).first()

    return db_reply

# --- NOVO ENDPOINT DE DELETE (REPLIES) ---
@app.delete("/replies/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reply(
    reply_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Deleta uma resposta (reply).
    - Exige que o usuário esteja logado.
    - Verifica se o usuário logado é o dono da resposta.
    """
    # 1. Busca a resposta no banco
    reply_query = db.query(models.Reply).filter(models.Reply.id == reply_id)
    reply = reply_query.first()

    # 2. Se a resposta não existe
    if reply is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resposta com id: {reply_id} não encontrada."
        )

    # 3. Verifica se o usuário logado é o dono da resposta
    if reply.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não autorizado a realizar esta ação."
        )

    # 4. Se tudo deu certo, deleta a resposta
    # (Graças ao 'ondelete="CASCADE"' no models.py,
    # todas as respostas aninhadas a esta serão deletadas juntas)
    reply_query.delete(synchronize_session=False)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)