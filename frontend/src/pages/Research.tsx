import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

export default function Research() {
  const [ticker, setTicker] = useState('');
  const [searchTicker, setSearchTicker] = useState('');

  const { data: stockInfo, isLoading } = useQuery({
    queryKey: ['stockInfo', searchTicker],
    queryFn: () => searchTicker ? api.getStockInfo(searchTicker) : null,
    enabled: !!searchTicker
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['stockAnalysis', searchTicker],
    queryFn: () => searchTicker ? api.getStockAnalysis(searchTicker) : null,
    enabled: !!searchTicker
  });

  const handleSearch = () => {
    setSearchTicker(ticker);
  };

  if (isLoading || analysisLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Search Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Stock Ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Enter stock ticker (e.g., AAPL)"
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{ minWidth: 120 }}
              >
                Search
              </Button>
            </Box>
          </Paper>
        </Grid>

        {stockInfo && (
          <>
            {/* Stock Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {stockInfo.company_name} ({stockInfo.ticker})
                </Typography>
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Current Price</TableCell>
                        <TableCell align="right">${stockInfo.current_price}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Market Cap</TableCell>
                        <TableCell align="right">${stockInfo.market_cap.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>P/E Ratio</TableCell>
                        <TableCell align="right">{stockInfo.pe_ratio || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dividend Yield</TableCell>
                        <TableCell align="right">{stockInfo.dividend_yield ? `${(stockInfo.dividend_yield * 100).toFixed(2)}%` : 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Price Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Price History
                </Typography>
                {analysis?.priceHistory && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysis.priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="price" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>

            {/* Financial Metrics */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Financial Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2">Revenue Growth (YoY)</Typography>
                    <Typography variant="h6">{analysis?.metrics?.revenueGrowth || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2">Profit Margin</Typography>
                    <Typography variant="h6">{analysis?.metrics?.profitMargin || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2">Debt to Equity</Typography>
                    <Typography variant="h6">{analysis?.metrics?.debtToEquity || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}