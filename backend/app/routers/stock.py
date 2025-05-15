from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

router = APIRouter(prefix="/stocks", tags=["stocks"])

@router.get("/{ticker}")
def get_stock_info(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        return {
            "ticker": ticker,
            "company_name": info.get("longName"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "country": info.get("country"),
            "current_price": info.get("currentPrice"),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "dividend_yield": info.get("dividendYield"),
            "beta": info.get("beta"),
            "52_week_high": info.get("fiftyTwoWeekHigh"),
            "52_week_low": info.get("fiftyTwoWeekLow")
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")

@router.get("/{ticker}/analysis")
def get_stock_analysis(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        
        # Get historical data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        hist = stock.history(start=start_date, end=end_date)
        
        # Calculate key metrics
        returns = hist['Close'].pct_change()
        
        # Calculate financial metrics
        financials = stock.financials
        try:
            revenue_growth = (
                (financials.iloc[0, 0] - financials.iloc[0, 1]) / 
                financials.iloc[0, 1]
            ) if not financials.empty else None
        except:
            revenue_growth = None
            
        # Get price history data
        price_history = [{
            "date": date.strftime("%Y-%m-%d"),
            "price": price
        } for date, price in zip(hist.index, hist['Close'])]
        
        # Calculate risk metrics
        volatility = returns.std() * (252 ** 0.5)  # Annualized volatility
        sharpe_ratio = (returns.mean() * 252) / volatility if volatility else None
        max_drawdown = (hist['Close'] / hist['Close'].expanding(min_periods=1).max() - 1).min()
        
        return {
            "priceHistory": price_history,
            "metrics": {
                "volatility": float(volatility) if not pd.isna(volatility) else None,
                "sharpeRatio": float(sharpe_ratio) if sharpe_ratio and not pd.isna(sharpe_ratio) else None,
                "maxDrawdown": float(max_drawdown) if not pd.isna(max_drawdown) else None,
                "revenueGrowth": float(revenue_growth) if revenue_growth and not pd.isna(revenue_growth) else None,
                "profitMargin": stock.info.get("profitMargins"),
                "debtToEquity": stock.info.get("debtToEquity")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error analyzing stock {ticker}: {str(e)}")

@router.get("/search")
def search_stocks(query: str) -> List[Dict]:
    """
    Search for stocks using a query string.
    This is a simplified implementation - in a real app, you'd want to use a proper market data API
    """
    # For demo purposes, we'll just return some sample stocks
    sample_stocks = [
        {"ticker": "AAPL", "company_name": "Apple Inc."},
        {"ticker": "MSFT", "company_name": "Microsoft Corporation"},
        {"ticker": "GOOGL", "company_name": "Alphabet Inc."},
        {"ticker": "AMZN", "company_name": "Amazon.com, Inc."},
        {"ticker": "FB", "company_name": "Meta Platforms, Inc."},
        {"ticker": "TSLA", "company_name": "Tesla, Inc."},
        {"ticker": "NVDA", "company_name": "NVIDIA Corporation"},
        {"ticker": "JPM", "company_name": "JPMorgan Chase & Co."},
        {"ticker": "V", "company_name": "Visa Inc."},
        {"ticker": "JNJ", "company_name": "Johnson & Johnson"}
    ]
    
    query = query.lower()
    return [
        stock for stock in sample_stocks
        if query in stock["ticker"].lower() or query in stock["company_name"].lower()
    ]