import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
  interface TypographyVariants {
    logo: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    logo?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    logo: true;
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#A78A7F',
      light: '#D7C8B6',
      dark: '#5C4B3D',
      contrastText: '#F5F0E5',
    },
    secondary: {
      main: '#C67B5A',
      light: '#E3A98E',
      dark: '#8A4B32',
      contrastText: '#F5F0E5',
    },
    background: {
      default: '#F5F0E5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#5C4B3D',
      secondary: '#A78A7F',
    }
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    logo: {
      fontSize: '2rem',
      fontWeight: 700
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        text: ({ theme }) => ({
          fontFamily: '"M PLUS 1", sans-serif',
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
          },
        }),
        contained: ({ theme }) => ({
          color: theme.palette.primary.contrastText,
          backgroundColor: theme.palette.secondary.main,
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
            boxShadow: 'none',
          },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
          }
        })
      }
    }
  },
});

interface CustomStylesProps {
  children: ReactNode;
}

export default function CustomStyles({ children }: CustomStylesProps) {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}