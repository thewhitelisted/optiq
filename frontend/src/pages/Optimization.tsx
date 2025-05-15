import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Slider,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

type OptimizationModel = 'mpt' | 'black-litterman';

export default function Optimization() {
  const { id } = useParams<{ id: string }>();
  const [model, setModel] = useState<OptimizationModel>('mpt');
  const [riskTolerance, setRiskTolerance] = useState<number>(50);
  const [minWeight, setMinWeight] = useState<number>(0);
  const [maxWeight, setMaxWeight] = useState<number>(100);
  const queryClient = useQueryClient();

  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => api.getPortfolio(Number(id))
  });

  const optimizeMutation = useMutation({
    mutationFn: () => api.optimizePortfolio(Number(id), {
      risk_tolerance: riskTolerance / 100,
      constraints: {
        min_weight: minWeight / 100,
        max_weight: maxWeight / 100
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', id] });
    }
  });

  const handleOptimize = () => {
    optimizeMutation.mutate();
  };

  if (portfolioLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentWeights = portfolio?.stocks.map(stock => ({
    ticker: stock.ticker,
    currentWeight: stock.weight || 0,
    optimizedWeight: optimizeMutation.data?.weights?.[stock.ticker] || 0
  })) || [];

  // Mock efficient frontier data - in real app, this would come from the backend
  const efficientFrontierData = Array.from({ length: 20 }, (_, i) => ({
    risk: (i * 0.5 + 5),
    return: (i * 0.3 + 4 + Math.random() * 2)
  }));

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Optimization Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Portfolio Optimization
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Optimization Model</InputLabel>
                  <Select
                    value={model}
                    onChange={(e) => setModel(e.target.value as OptimizationModel)}
                    label="Optimization Model"
                  >
                    <MenuItem value="mpt">Modern Portfolio Theory</MenuItem>
                    <MenuItem value="black-litterman">Black-Litterman</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>Risk Tolerance</Typography>
                <Slider
                  value={riskTolerance}
                  onChange={(_, value) => setRiskTolerance(value as number)}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0, label: 'Conservative' },
                    { value: 50, label: 'Moderate' },
                    { value: 100, label: 'Aggressive' },
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Minimum Weight (%)"
                  type="number"
                  value={minWeight}
                  onChange={(e) => setMinWeight(Number(e.target.value))}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum Weight (%)"
                  type="number"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(Number(e.target.value))}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleOptimize}
                  disabled={optimizeMutation.isPending}
                >
                  {optimizeMutation.isPending ? 'Optimizing...' : 'Optimize Portfolio'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Efficient Frontier Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Efficient Frontier
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="risk" name="Risk" unit="%" />
                <YAxis type="number" dataKey="return" name="Return" unit="%" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Portfolio" data={efficientFrontierData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Optimization Results */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Weight Comparison
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Stock</TableCell>
                    <TableCell align="right">Current Weight (%)</TableCell>
                    <TableCell align="right">Optimized Weight (%)</TableCell>
                    <TableCell align="right">Change (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentWeights.map((row) => (
                    <TableRow key={row.ticker}>
                      <TableCell>{row.ticker}</TableCell>
                      <TableCell align="right">{row.currentWeight.toFixed(2)}</TableCell>
                      <TableCell align="right">{row.optimizedWeight.toFixed(2)}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: row.optimizedWeight - row.currentWeight > 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {(row.optimizedWeight - row.currentWeight).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}