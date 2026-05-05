from fastapi import APIRouter, HTTPException, UploadFile, File
from schemas import Transaction
from database import transactions_db, users_db
from socket_manager import manager
from logger import get_logger
import uuid
import shutil

router = APIRouter()
logger = get_logger(__name__)

@router.get("/dashboard/{email}")
def get_dashboard(email: str):
    user_txs = [t for t in transactions_db if t.get("user_email") == email]
    user_txs.sort(key=lambda x: x["time"], reverse=True)
    balance = users_db.get(email, {}).get("balance", 124500.0)
    
    risk_level = "LOW"
    recent_frauds = [t for t in user_txs if t.get("is_suspicious")]
    if len(recent_frauds) > 2:
        risk_level = "HIGH"
    elif len(recent_frauds) > 0:
        risk_level = "MEDIUM"

    return {
        "balance": balance,
        "risk_level": risk_level,
        "recent_transactions": user_txs[:5]
    }

@router.get("/transactions/{email}")
def get_transactions(email: str, skip: int = 0, limit: int = 10):
    user_txs = [t for t in transactions_db if t.get("user_email") == email]
    user_txs.sort(key=lambda x: x["time"], reverse=True)
    
    paginated_txs = user_txs[skip : skip + limit]
    has_more = len(user_txs) > skip + limit
    
    return {"transactions": paginated_txs, "has_more": has_more}

@router.post("/upload-receipt")
async def upload_receipt(file: UploadFile = File(...)):
    # Generate unique filename to prevent overwrites
    ext = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_location = f"uploads/{unique_filename}"
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    return {"receipt_url": f"http://10.110.159.61:8080/static/{unique_filename}"}

@router.post("/transaction/check")
async def check_transaction(transaction: Transaction):
    logger.info(f"Processing new {transaction.type} transaction of ₹{transaction.amount} for {transaction.user_email}")
    fraud_score = 0.1
    if transaction.amount > 10000:
        fraud_score = 0.9  
    
    is_suspicious = fraud_score > 0.7
    
    tx_record = {
        "id": str(uuid.uuid4()),
        "amount": transaction.amount,
        "type": transaction.type,
        "time": transaction.time,
        "location": transaction.location,
        "category": transaction.category,
        "notes": transaction.notes,
        "receipt_url": transaction.receipt_url,
        "user_email": transaction.user_email,
        "fraud_score": fraud_score,
        "is_suspicious": is_suspicious,
        "status": "Action Required" if is_suspicious else "Completed"
    }
    
    transactions_db.append(tx_record)
    
    if transaction.user_email in users_db:
        if transaction.type == "expense":
            users_db[transaction.user_email]["balance"] -= transaction.amount
        else:
            users_db[transaction.user_email]["balance"] += transaction.amount

    response = {
        "status": "success",
        "fraud_score": fraud_score,
        "is_suspicious": is_suspicious,
        "transaction": tx_record
    }

    if is_suspicious:
        logger.warning(f"FRAUD ALERT! High risk score {fraud_score} detected for transaction {tx_record['id']}")
        await manager.broadcast({
            "type": "FRAUD_ALERT",
            "data": response
        })
    else:
        logger.info(f"Transaction {tx_record['id']} completed safely.")

    return response

@router.post("/transaction/resolve")
def resolve_transaction(tx_id: str, is_safe: bool):
    for tx in transactions_db:
        if tx["id"] == tx_id:
            tx["is_suspicious"] = not is_safe
            tx["status"] = "Completed" if is_safe else "Reported Fraud"
            return {"status": "success"}
    raise HTTPException(status_code=404, detail="Transaction not found")
