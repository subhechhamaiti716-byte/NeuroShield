from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Database Connection URL (SQLite for local testing, can be swapped to Postgres)
SQLALCHEMY_DATABASE_URL = "sqlite:///./neuroshield.db"

# 2. Engine Creation
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False} # check_same_thread is needed only for SQLite
)

# 3. Session Maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base Class (Ready for future ORM models)
Base = declarative_base()

# 5. Dependency Injection for FastAPI Routers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- TEMPORARY MOCK DB (To be removed when models are built) ---
users_db = {} # email -> user_data
transactions_db = [] # list of transactions
fraud_alerts = []
