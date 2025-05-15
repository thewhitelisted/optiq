import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

interface Stock {
  id: number;
  ticker: string;
  company_name: string;
  sector?: string;
  industry?: string;
  country?: string;
}

interface Portfolio {
  id: number;
  name: string;
  book_cost: number;
  owner_id: number;
  stocks: Stock[];
  current_value?: number;
}

export const api = {
  // Stock endpoints
  getStockInfo: async (ticker: string) => {
    const response = await axios.get(`${BASE_URL}/stock/${ticker}`);
    return response.data;
  },

  // Portfolio endpoints
  getPortfolio: async (id: number): Promise<Portfolio> => {
    const response = await axios.get(`${BASE_URL}/portfolios/${id}`);
    return response.data;
  },

  createPortfolio: async (portfolio: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    const response = await axios.post(`${BASE_URL}/portfolios/`, portfolio);
    return response.data;
  },

  updatePortfolio: async (id: number, portfolio: Partial<Portfolio>): Promise<Portfolio> => {
    const response = await axios.patch(`${BASE_URL}/portfolios/${id}`, portfolio);
    return response.data;
  },

  // Portfolio optimization endpoints
  optimizePortfolio: async (id: number, params: {
    risk_tolerance?: number;
    constraints?: {
      min_weight?: number;
      max_weight?: number;
      sector_constraints?: Record<string, number>;
    }
  }) => {
    const response = await axios.post(`${BASE_URL}/portfolios/${id}/optimize`, params);
    return response.data;
  },

  // Research endpoints
  searchStocks: async (query: string): Promise<Stock[]> => {
    const response = await axios.get(`${BASE_URL}/stocks/search`, { params: { query } });
    return response.data;
  },

  getStockAnalysis: async (ticker: string) => {
    const response = await axios.get(`${BASE_URL}/stocks/${ticker}/analysis`);
    return response.data;
  }
};