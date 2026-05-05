from fastapi import APIRouter, HTTPException
from schemas import UserSignup, UserLogin
from database import users_db
from logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.post("/signup")
def signup(user: UserSignup):
    logger.info(f"Attempting signup for email: {user.email}")
    if user.email in users_db:
        logger.warning(f"Signup failed. Email already registered: {user.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    users_db[user.email] = {"name": user.name, "email": user.email, "phone": user.phone, "password": user.password, "balance": user.initial_balance}
    logger.info(f"User signup successful: {user.email}")
    return {"status": "success", "user": {"name": user.name, "email": user.email}}

@router.post("/login")
def login(user: UserLogin):
    logger.info(f"Login attempt for email: {user.email}")
    if user.email not in users_db or users_db[user.email]["password"] != user.password:
        logger.warning(f"Failed login attempt for email: {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    logger.info(f"Successful login for email: {user.email}")
    return {"status": "success", "user": {"name": users_db[user.email]["name"], "email": user.email}}
