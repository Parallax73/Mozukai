import { alpha, useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { IconButton, FormControl, InputLabel, Input, InputAdornment } from '@mui/material';
import Person2Icon from '@mui/icons-material/Person2';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import React, { useState, useEffect } from 'react';
import { MozukaiIcon } from '../common/CustomIcons';
import AuthService   from '../../services/AuthService';


export default function HeaderBar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      navigate(`/search?query=${encodeURIComponent(debouncedSearchTerm)}`);
    } 
  }, [debouncedSearchTerm, navigate]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  const handleProtectedNavigation = () => {
    const token = AuthService.getAccessToken();
    if (token && AuthService.isAuthenticated()) {
      navigate('/blog');
    } else {
      navigate('/login');
    }
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          variant="dense"
          disableGutters
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
            backdropFilter: 'blur(24px)',
            border: '1px solid',
            borderColor: alpha(theme.palette.secondary.dark, 0.4),
            backgroundColor: alpha(theme.palette.background.default, 0.7),
            boxShadow: theme.shadows[3],
            padding: '8px 12px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', px: 0 }}>
            <Typography
              component={Link}
              to="/"
              variant="logo"
              sx={{
                background: '#000000',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                fontWeight: theme.typography.logo.fontWeight,
                textDecoration: 'none',
              }}
            >
              <MozukaiIcon />
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Button component={Link} to="/bonsai" variant="text" color="primary" size="small">
              Bonsai
            </Button>
            <Button component={Link} to="/vasos" variant="text" color="primary" size="small">
              Vasos
            </Button>
            <Button component={Link} to="/insumos" variant="text" color="primary" size="small">
              Insumos
            </Button>
            <Button component={Link} to="/acessorios" variant="text" color="primary" size="small">
              Acessórios
            </Button>
            <Button component={Link} to="/ferramentas" variant="text" color="primary" size="small" sx={{ minWidth: 0 }}>
              Ferramentas
            </Button>
            <Button component={Link} to="/blog" variant="text" color="primary" size="small" sx={{ minWidth: 0 }}>
              Blog
            </Button>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                transition: 'all 0.3s ease',
                width: searchOpen ? '10rem' : 0,
                visibility: searchOpen ? 'visible' : 'hidden',
                overflow: 'hidden',
                mr: 1,
              }}
            >
              <FormControl variant="standard" fullWidth>
                <InputLabel htmlFor="product-search-input">Buscar</InputLabel>
                <Input
                  id="product-search-input"
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  }
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchSubmit}
                  placeholder="Buscar produtos..."
                />
              </FormControl>
            </Box>

            <IconButton
              color="primary"
              aria-label="search"
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              <SearchIcon />
            </IconButton>
            <IconButton color="primary" aria-label="shopping bag" onClick={handleProtectedNavigation}>
              <ShoppingBagIcon />
            </IconButton>
            <IconButton color="primary" aria-label="profile" onClick={handleProtectedNavigation}>
              <Person2Icon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
