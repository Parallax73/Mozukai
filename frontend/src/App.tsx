import './App.css';
import CustomStyles from './AppTheme';
import HeaderBar from './components/HeaderBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import BlogPage from './pages/BlogPage';
import ToolsPage from './pages/ToolsPage';
import SuppliesPage from './pages/SuppliesPage';
import PotsPage from './pages/PotsPage';
import BonsaiPage from './pages/BonsaiPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <CustomStyles>
        <Box sx={{
          backgroundColor: 'background.default',
          minHeight: '100vh',
          width: '100%',
          overflow: 'hidden'
        }}>
          <HeaderBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bonsai" element={<BonsaiPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/acessorios" element={<AcessoriesPage />} />
            <Route path="/vasos" element={<PotsPage />} />
            <Route path="/insumos" element={<SuppliesPage />} />
            <Route path="/ferramentas" element={<ToolsPage />} />

          </Routes>
        </Box>
      </CustomStyles>
    </Router>
  );
}

export default App;