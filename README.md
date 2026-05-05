# 🛡️ NeuroShield

**Intelligent Financial Tracker & Real-Time Fraud Detection App**

NeuroShield is a comprehensive, full-stack personal finance application built to help users manage their income, track expenses, visualize analytics, and immediately detect suspicious financial activity using simulated Machine Learning risk analysis.

---

## 🌟 Key Features

- **🔐 Secure Authentication:** Complete user signup and login flows with session persistence.
- **💳 Transaction Management:** Log income and expenses with automatic location detection and category tagging.
- **📸 Receipt Uploads:** Attach photo receipts to your transactions directly from your phone's gallery.
- **🚨 Real-Time Fraud Detection:** AI-simulated risk scoring evaluates transactions upon submission. High-risk transactions trigger instant WebSocket alerts on the frontend.
- **📊 Advanced Analytics:** Beautiful, dark-themed dashboard featuring categorical breakdowns, safe vs. suspicious transaction ratios, and trend data.
- **📜 Smart History:** Paginated, infinitely scrolling transaction ledger with simultaneous text-search and category filtering.

---

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **Framework:** React Native (Expo)
- **Routing:** Expo Router
- **State & Data Fetching:** React Hooks, Axios
- **Styling:** Vanilla StyleSheet (Premium Dark Mode Aesthetic)
- **Native Modules:** Expo Location, Expo Image Picker

### Backend (API Engine)
- **Framework:** FastAPI (Python)
- **Database:** SQLite with SQLAlchemy ORM
- **Migrations:** Alembic
- **Real-Time:** WebSockets (Connection Manager)
- **Storage:** Local static file serving for uploaded receipts
- **Logging:** Custom Python logging engine

---

## 🏗️ Project Structure

```text
NeuroShield AG/
│
├── backend/                  # Python FastAPI Server
│   ├── main.py               # Application entry point & configuration
│   ├── database.py           # Database engine & dependency injection
│   ├── models.py             # SQLAlchemy database tables (Users, Transactions)
│   ├── schemas.py            # Pydantic validation schemas
│   ├── logger.py             # Custom logging configuration
│   ├── socket_manager.py     # Real-time WebSocket connection manager
│   ├── alembic/              # Database migration scripts
│   └── routers/              # Modular API endpoints (auth, analytics, transactions)
│
└── frontend/                 # React Native Expo App
    ├── app/
    │   ├── (tabs)/           # Main bottom-tab navigation (Dashboard, History, Analytics)
    │   ├── login.tsx         # User authentication
    │   ├── signup.tsx        # Account creation
    │   └── add-transaction.tsx # Transaction submission & receipt upload
    ├── constants/            # Theming and color tokens
    └── store.ts              # Global session state
```

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### 1. Start the Backend API
You will need Python installed on your computer.

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\Activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy alembic python-multipart

# Start the server (runs on port 8080)
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

### 2. Start the Frontend App
You will need Node.js and the **Expo Go** app installed on your physical mobile device.

```bash
cd frontend

# Install dependencies
npm install

# Start the Expo Metro Bundler
npm start
```
*Once the terminal shows a QR code, open the **Expo Go** app on your phone and scan it to launch NeuroShield!*

---

## 📝 Roadmap / Next Steps
- [ ] Implement actual `IsolationForest` ML model for fraud scoring (currently simulated).
- [ ] Migrate database from SQLite to PostgreSQL.
- [ ] Secure endpoints using JWT Bearer tokens instead of simple state.
- [ ] Deploy backend to Render/AWS and deploy frontend to app stores via EAS Build.
