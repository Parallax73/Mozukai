import { styled, alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import Person2Icon from '@mui/icons-material/Person2';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: alpha(theme.palette.secondary.dark, 0.4), // Use a brown for border
  backgroundColor: alpha(theme.palette.background.default, 0.7), // Slightly more opaque soft grey
  boxShadow: theme.shadows[3], // A bit more prominent shadow
  padding: '8px 12px',
}));

export default function HeaderBar() {
  const theme = useTheme();

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
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 0 }}>
            <Typography
              variant="logo"
              component="div"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.dark} 90%)`, // Woody brown gradient
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                fontWeight: theme.typography.logo.fontWeight,
              }}
            >
              Mozukai 木
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Button variant="text" color="primary" size="small">
              Bonsai
            </Button>
            <Button variant="text" color="primary" size="small">
              Ferramentas
            </Button>
            <Button variant="text" color="primary" size="small">
              Insumos
            </Button>
            <Button variant="text" color="primary" size="small">
              Acessórios
            </Button>
            <Button variant="text" color="primary" size="small" sx={{ minWidth: 0 }}>
              Vasos
            </Button>
            <Button variant="text" color="primary" size="small" sx={{ minWidth: 0 }}>
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
            <Button color="primary" variant="text" size="small">
              Sign in
            </Button>
            <Button color="primary" variant="contained" size="small">
              Sign up
            </Button>
            <IconButton color="primary" aria-label="profile">
              <Person2Icon />
            </IconButton>
            <IconButton color="primary" aria-label="search">
              <SearchIcon />
            </IconButton>
            <IconButton color="primary" aria-label="shopping bag">
              <ShoppingBagIcon />
            </IconButton>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}