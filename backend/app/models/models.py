from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Association table for portfolio-stock relationship
portfolio_stocks = Table(
    'portfolio_stocks',
    Base.metadata,
    Column('portfolio_id', Integer, ForeignKey('portfolios.id')),
    Column('stock_id', Integer, ForeignKey('stocks.id')),
    Column('weight', Float)
)

# Association table for user-stock favorites
user_favorites = Table(
    'user_favorites',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('stock_id', Integer, ForeignKey('stocks.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    real_name = Column(String)
    hashed_password = Column(String)
    email = Column(String, unique=True, index=True)
    
    portfolios = relationship("Portfolio", back_populates="owner")
    favorite_stocks = relationship("Stock", secondary=user_favorites, back_populates="favorited_by")

class Stock(Base):
    __tablename__ = "stocks"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True)
    company_name = Column(String)
    sector = Column(String)
    industry = Column(String)
    country = Column(String)
    
    portfolios = relationship("Portfolio", secondary=portfolio_stocks, back_populates="stocks")
    favorited_by = relationship("User", secondary=user_favorites, back_populates="favorite_stocks")

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    book_cost = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="portfolios")
    stocks = relationship("Stock", secondary=portfolio_stocks, back_populates="portfolios")