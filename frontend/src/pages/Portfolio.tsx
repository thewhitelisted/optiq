import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { api } from '../services/api';

interface StockDialogData {
  ticker: string;
  weight: number;
}

export default function Portfolio() {
  const { id } = useParams<{ id: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<StockDialogData>({ ticker: '', weight: 0 });
  const queryClient = useQueryClient();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => api.getPortfolio(Number(id))
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: (data: { id: number; portfolio: any }) => 
      api.updatePortfolio(data.id, data.portfolio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', id] });
    }
  });

  const handleAddStock = () => {
    setDialogData({ ticker: '', weight: 0 });
    setDialogOpen(true);
  };

  const handleEditStock = (stock: any) => {
    setDialogData({
      ticker: stock.ticker,
      weight: stock.weight || 0
    });
    setDialogOpen(true);
  };

  const handleDeleteStock = (ticker: string) => {
    if (!portfolio) return;
    
    const updatedStocks = portfolio.stocks.filter(s => s.ticker !== ticker);
    updatePortfolioMutation.mutate({
      id: Number(id),
      portfolio: { stocks: updatedStocks }
    });
  };

  const handleDialogSave = () => {
    if (!portfolio) return;

    const existingStockIndex = portfolio.stocks.findIndex(
      s => s.ticker === dialogData.ticker
    );

    let updatedStocks;
    if (existingStockIndex >= 0) {
      updatedStocks = [...portfolio.stocks];
      updatedStocks[existingStockIndex] = {
        ...updatedStocks[existingStockIndex],
        weight: dialogData.weight
      };
    } else {
      updatedStocks = [...portfolio.stocks, dialogData];
    }

    updatePortfolioMutation.mutate({
      id: Number(id),
      portfolio: { stocks: updatedStocks }
    });

    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Portfolio Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">
              {portfolio?.name || 'Portfolio'} Details
            </Typography>
            <Button
              variant="contained"
              onClick={handleAddStock}
            >
              Add Stock
            </Button>
          </Paper>
        </Grid>

        {/* Holdings Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticker</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell align="right">Weight (%)</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">Market Value</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {portfolio?.stocks.map((stock) => (
                  <TableRow key={stock.ticker}>
                    <TableCell>{stock.ticker}</TableCell>
                    <TableCell>{stock.company_name}</TableCell>
                    <TableCell align="right">{stock.weight?.toFixed(2)}%</TableCell>
                    <TableCell align="right">${stock.current_price?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell align="right">
                      ${((stock.current_price || 0) * (stock.weight || 0) / 100 * (portfolio.current_value || 0)).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEditStock(stock)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteStock(stock.ticker)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Add/Edit Stock Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {dialogData.ticker ? 'Edit Stock' : 'Add Stock'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Ticker"
              value={dialogData.ticker}
              onChange={(e) => setDialogData({ ...dialogData, ticker: e.target.value.toUpperCase() })}
              disabled={!!dialogData.ticker}
            />
            <TextField
              label="Weight (%)"
              type="number"
              value={dialogData.weight}
              onChange={(e) => setDialogData({ ...dialogData, weight: parseFloat(e.target.value) })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDialogSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}