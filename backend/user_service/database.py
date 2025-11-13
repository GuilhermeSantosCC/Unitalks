from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv() # Carrega as variáveis do arquivo .env

# LE a variável do .env
DATABASE_URL = os.environ.get("DATABASE_URL") 

# VERIFICAÇÃO DE ERRO (Boa prática)
if DATABASE_URL is None:
    raise ValueError("Variável de ambiente DATABASE_URL não encontrada. Crie o .env")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Função para injetar a sessão do banco nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()