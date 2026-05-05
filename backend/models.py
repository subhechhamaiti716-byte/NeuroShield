from sqlalchemy import Column, Integer, String, Float, Boolean
from database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    password = Column(String) # In a real app, this should be hashed
    balance = Column(Float, default=0.0)

class TransactionRecord(Base):
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_email = Column(String, index=True) # Foreign key representation for now
    amount = Column(Float)
    type = Column(String) # "income" or "expense"
    category = Column(String)
    time = Column(String)
    location = Column(String)
    notes = Column(String, nullable=True)
    receipt_url = Column(String, nullable=True)
    fraud_score = Column(Float, default=0.0)
    is_suspicious = Column(Boolean, default=False)
    status = Column(String, default="Completed")
