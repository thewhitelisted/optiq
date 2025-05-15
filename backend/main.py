from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import portfolio, stock
from app.core.database import engine
from app.models import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Portfolio Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(portfolio.router)
app.include_router(stock.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Portfolio Management API"}