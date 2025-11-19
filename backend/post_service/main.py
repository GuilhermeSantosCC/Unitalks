from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from sqlalchemy import or_, desc
import models, schemas, database, auth 
from typing import List

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# --- Configuração do CORS ---

origins = ["*"]  # <--- LIBERA TUDO

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoint de Leitura (Com Paginação) ---
@app.get("/posts/", response_model=List[schemas.PostResponse])
def get_posts(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(database.get_db)
):

    posts = db.query(models.Post).options(
        joinedload(models.Post.owner), 
        joinedload(models.Post.replies).joinedload(models.Reply.owner)
    ).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    
    return posts

# --- TRENDING TOPICS ---
@app.get("/posts/trending", response_model=List[schemas.PostResponse])
def get_trending_posts(db: Session = Depends(database.get_db)):
    posts = db.query(models.Post).options(
        joinedload(models.Post.owner),
        joinedload(models.Post.replies).joinedload(models.Reply.owner)
    ).order_by(models.Post.agree_count.desc()).limit(5).all()
    
    return posts

# --- PESQUISA ---
@app.get("/search", response_model=List[schemas.PostResponse])
def search_posts(q: str, db: Session = Depends(database.get_db)):
    if not q:
        return []
        
    posts = db.query(models.Post).join(models.User).options(
        joinedload(models.Post.owner),
        joinedload(models.Post.replies).joinedload(models.Reply.owner)
    ).filter(
        or_(
            models.Post.content.ilike(f"%{q}%"), 
            models.User.name.ilike(f"%{q}%")     
        )
    ).order_by(models.Post.agree_count.desc()).all()
    
    return posts

# --- Endpoints de Criação e Edição ---

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post não encontrado.")
    if post.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão.")

    post_query.delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.post("/vote/", response_model=schemas.PostResponse)
def vote_post(
    vote: schemas.Vote, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == vote.post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post não encontrado.")

    vote_query = db.query(models.Vote).filter(
        models.Vote.post_id == vote.post_id, 
        models.Vote.user_id == current_user.id
    )
    existing_vote = vote_query.first()

    if vote.vote_type == "none":
        if existing_vote:
            if existing_vote.vote_type == 1: post.agree_count -= 1
            elif existing_vote.vote_type == -1: post.disagree_count -= 1
            vote_query.delete(synchronize_session=False)
    
    elif vote.vote_type == "agree":
        if existing_vote:
            if existing_vote.vote_type == -1: 
                existing_vote.vote_type = 1
                post.agree_count += 1
                post.disagree_count -= 1
        else:
            new_vote = models.Vote(post_id=vote.post_id, user_id=current_user.id, vote_type=1)
            db.add(new_vote)
            post.agree_count += 1

    elif vote.vote_type == "disagree":
        if existing_vote:
            if existing_vote.vote_type == 1:
                existing_vote.vote_type = -1
                post.disagree_count += 1
                post.agree_count -= 1
        else:
            new_vote = models.Vote(post_id=vote.post_id, user_id=current_user.id, vote_type=-1)
            db.add(new_vote)
            post.disagree_count += 1

    db.commit()
    db.refresh(post)
    
    db_post = db.query(models.Post).options(joinedload(models.Post.owner)).filter(models.Post.id == post.id).first()
    return db_post

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post não encontrado.")
    
    if reply.parent_reply_id:
        parent_reply = db.query(models.Reply).filter(models.Reply.id == reply.parent_reply_id).first()
        if not parent_reply:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resposta pai não encontrada.")

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

@app.delete("/replies/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reply(
    reply_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    reply_query = db.query(models.Reply).filter(models.Reply.id == reply_id)
    reply = reply_query.first()

    if reply is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resposta não encontrada.")
    if reply.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão.")

    reply_query.delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# --- Endpoint: Posts de um usuário específico ---
@app.get("/posts/user/{user_id}", response_model=List[schemas.PostResponse])
def get_user_posts(user_id: int, db: Session = Depends(database.get_db)):
    posts = db.query(models.Post).filter(models.Post.owner_id == user_id).options(
        joinedload(models.Post.owner),
        joinedload(models.Post.replies).joinedload(models.Reply.owner)
    ).order_by(models.Post.created_at.desc()).all()
    return posts

# --- Endpoint: Posts curtidos por um usuário ---
@app.get("/posts/user/{user_id}/liked", response_model=List[schemas.PostResponse])
def get_user_liked_posts(user_id: int, db: Session = Depends(database.get_db)):
    # Faz um JOIN entre Post e Vote onde o voto é '1' (agree) e o usuário é o user_id
    posts = db.query(models.Post).join(models.Vote).filter(
        models.Vote.user_id == user_id,
        models.Vote.vote_type == 1 # Apenas Likes/Concordo
    ).options(
        joinedload(models.Post.owner),
        joinedload(models.Post.replies).joinedload(models.Reply.owner)
    ).order_by(models.Vote.post_id.desc()).all() # Ordena pelos likes mais recentes
    return posts