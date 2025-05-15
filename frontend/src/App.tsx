import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create layouts and pages components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Research from './pages/Research';
import Portfolio from './pages/Portfolio';
import Optimization from './pages/Optimization';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ce93d8',
    },
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ display: 'flex' }}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="research" element={<Research />} />
                <Route path="portfolio/:id" element={<Portfolio />} />
                <Route path="optimization/:id" element={<Optimization />} />
              </Route>
            </Routes>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
