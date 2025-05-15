from pydantic import BaseModel, Field, conlist, confloat
from typing import List, Optional, Dict, Literal
from decimal import Decimal

class OptimizationConstraints(BaseModel):
    min_weight: Optional[float] = Field(0.0, ge=0.0, le=1.0)
    max_weight: Optional[float] = Field(1.0, ge=0.0, le=1.0)
    sector_constraints: Optional[Dict[str, float]] = None

class OptimizationParams(BaseModel):
    model: Literal["mpt", "black-litterman"] = "mpt"
    risk_tolerance: float = Field(..., ge=0.0, le=1.0)
    constraints: OptimizationConstraints = OptimizationConstraints()

class StockBase(BaseModel):
    ticker: str
    company_name: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = None
    weight: Optional[float] = None

class StockCreate(StockBase):
    pass

class Stock(StockBase):
    id: int
    current_price: Optional[float] = None

    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    name: str
    book_cost: float

class PortfolioCreate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int
    owner_id: int
    stocks: List[Stock] = []
    current_value: Optional[float] = None

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: str
    real_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    portfolios: List[Portfolio] = []
    favorite_stocks: List[Stock] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None