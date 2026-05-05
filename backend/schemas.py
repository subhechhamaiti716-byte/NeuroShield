from pydantic import BaseModel

class UserSignup(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    initial_balance: float = 0.0

class UserLogin(BaseModel):
    email: str
    password: str

class Transaction(BaseModel):
    amount: float
    type: str = "expense" # income or expense
    time: str
    location: str
    lat: float = 0.0
    lon: float = 0.0
    category: str = "General"
    notes: str = ""
    receipt_url: str | None = None
    user_email: str = "test@test.com"
