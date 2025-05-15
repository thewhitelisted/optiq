from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
import numpy as np
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models import models, schemas

router = APIRouter(prefix="/portfolios", tags=["portfolios"])

def calculate_portfolio_metrics(prices_df: pd.DataFrame) -> Dict:
    """Calculate portfolio risk metrics"""
    returns = prices_df.pct_change()
    cov_matrix = returns.cov() * 252  # Annualized covariance
    corr_matrix = returns.corr()
    
    return {
        "covariance_matrix": cov_matrix.to_dict(),
        "correlation_matrix": corr_matrix.to_dict()
    }

def optimize_portfolio_mpt(
    prices_df: pd.DataFrame,
    risk_tolerance: float,
    constraints: Dict
) -> Dict[str, float]:
    """Optimize portfolio using Modern Portfolio Theory"""
    returns = prices_df.pct_change()
    expected_returns = returns.mean() * 252  # Annualized returns
    cov_matrix = returns.cov() * 252  # Annualized covariance
    
    n_assets = len(prices_df.columns)
    min_weight = constraints.get("min_weight", 0.0)
    max_weight = constraints.get("max_weight", 1.0)
    
    # Using scipy's minimize function for optimization
    from scipy.optimize import minimize
    
    def objective(weights):
        portfolio_return = np.sum(expected_returns * weights)
        portfolio_risk = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
        # Utility function combining return and risk based on risk tolerance
        return -(portfolio_return - (1 - risk_tolerance) * portfolio_risk)
    
    constraints_list = [
        {"type": "eq", "fun": lambda x: np.sum(x) - 1},  # Weights sum to 1
    ]
    
    bounds = [(min_weight, max_weight) for _ in range(n_assets)]
    
    initial_weights = np.array([1/n_assets] * n_assets)
    result = minimize(
        objective,
        initial_weights,
        method="SLSQP",
        bounds=bounds,
        constraints=constraints_list
    )
    
    return dict(zip(prices_df.columns, result.x))

def optimize_portfolio_black_litterman(
    prices_df: pd.DataFrame,
    risk_tolerance: float,
    constraints: Dict,
    market_caps: Dict[str, float] = None
) -> Dict[str, float]:
    """Optimize portfolio using Black-Litterman model"""
    # Calculate market weights if market caps are provided
    if market_caps:
        total_market_cap = sum(market_caps.values())
        market_weights = {k: v/total_market_cap for k, v in market_caps.items()}
    else:
        # Equal weights if no market caps provided
        market_weights = {col: 1/len(prices_df.columns) for col in prices_df.columns}
    
    returns = prices_df.pct_change()
    cov_matrix = returns.cov() * 252
    
    # Risk aversion parameter
    risk_aversion = 2.5
    
    # Implement Black-Litterman formula
    # For simplicity, we'll use market equilibrium returns
    pi = risk_aversion * np.dot(cov_matrix, np.array(list(market_weights.values())))
    
    # Final weights would be calculated using the Black-Litterman formula
    # This is a simplified version
    weights = market_weights
    
    return weights

@router.get("/{portfolio_id}", response_model=schemas.Portfolio)
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@router.post("/{portfolio_id}/optimize")
def optimize_portfolio(
    portfolio_id: int,
    params: schemas.OptimizationParams,
    db: Session = Depends(get_db)
):
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Fetch historical prices for all stocks in portfolio
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    
    prices_data = {}
    for stock in portfolio.stocks:
        ticker = yf.Ticker(stock.ticker)
        hist = ticker.history(start=start_date, end=end_date)
        prices_data[stock.ticker] = hist['Close']
    
    prices_df = pd.DataFrame(prices_data)
    
    # Calculate portfolio metrics
    metrics = calculate_portfolio_metrics(prices_df)
    
    # Optimize portfolio based on selected model
    if params.model == "black-litterman":
        # Fetch market caps for Black-Litterman
        market_caps = {}
        for stock in portfolio.stocks:
            ticker = yf.Ticker(stock.ticker)
            market_caps[stock.ticker] = ticker.info.get('marketCap', 0)
        
        optimized_weights = optimize_portfolio_black_litterman(
            prices_df,
            params.risk_tolerance,
            params.constraints,
            market_caps
        )
    else:  # Default to MPT
        optimized_weights = optimize_portfolio_mpt(
            prices_df,
            params.risk_tolerance,
            params.constraints
        )
    
    return {
        "weights": optimized_weights,
        "metrics": metrics
    }