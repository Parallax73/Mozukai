import './App.css';
import CustomStyles from './AppTheme';
import HeaderBar from './components/shared/HeaderBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import ProductList from './pages/ProductListPage';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShoppingCart from './pages/ShoppingCartPage';
import { useEffect } from 'react';
import AuthService from './services/AuthService';
import BlogPage from './pages/BlogPage';
import BlogItemPage from './pages/BlogItemPage';
import Chat from './components/shared/Chat';


function App() {
   useEffect(() => {
    AuthService.tryRefreshToken();
  }, []);
  return (
    <Router>
      <CustomStyles>
        <CssBaseline />
        <Box sx={{
          minHeight: '100vh',
          width: '100%',
          overflow: 'hidden'
        }}>
          <HeaderBar />
          <Chat />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bonsai" element={<ProductList productType="bonsai" title="Bonsai" />} />
            <Route path="/vasos" element={<ProductList productType="pot" title="Vasos" />} />
            <Route path="/acessorios" element={<ProductList productType="accessory" title="Acessorios" />} />
            <Route path="/ferramentas" element={<ProductList productType="tools" title="Ferramentas" />} />
            <Route path="/insumos" element={<ProductList productType="supply" title="Insumos" />} />
            <Route path="/item/:id" element={<ProductPage />} />
            <Route path="/search" element={<ProductList title="Resultados da Busca" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<ShoppingCart />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogItemPage />} />
          </Routes>
        </Box>
      </CustomStyles>
    </Router>
  );
}

export default App;