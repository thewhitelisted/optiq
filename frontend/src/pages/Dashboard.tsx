import { useQuery } from '@tanstack/react-query';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { PieChart, Pie, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio', 1], // Default portfolio ID
    queryFn: () => api.getPortfolio(1)
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const portfolioData = portfolio?.stocks.map((stock, index) => ({
    name: stock.ticker,
    value: parseFloat((100 / portfolio.stocks.length).toFixed(2))
  })) || [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Portfolio Value Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Portfolio Value
            </Typography>
            <Typography variant="h4">
              ${portfolio?.current_value?.toLocaleString() || 0}
            </Typography>
            <Typography color="textSecondary">
              Book Cost: ${portfolio?.book_cost.toLocaleString() || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Holdings Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Holdings Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value}%)`}
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Risk Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Risk Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Sharpe Ratio</Typography>
                <Typography variant="h6">1.45</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Max Drawdown</Typography>
                <Typography variant="h6">-12.3%</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Beta</Typography>
                <Typography variant="h6">0.85</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}