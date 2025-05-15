# React + FastAPI Monorepo

This is a monorepo containing a React frontend and FastAPI backend.

## Project Structure
- `frontend/`: React + TypeScript frontend built with Vite
- `backend/`: Python FastAPI backend

## Setup & Running

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on http://localhost:5173

### Backend
```bash
cd backend
# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On Unix:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```
Backend will run on http://localhost:8000