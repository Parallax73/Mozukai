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
      main: '#4A5B4E', // Deep, natural green-brown for primary actions/text
      light: '#6E7F71', // Lighter shade for subtle emphasis
      dark: '#2F3C31',  // Darker shade for accents and hover
      contrastText: '#F5F5F5', // Off-white for contrast
    },
    secondary: { // Used for a different accent or interaction color
      main: '#967969', // A warm, natural brown
      light: '#B2978A',
      dark: '#6A4F41',
      contrastText: '#F5F5F5',
    },
    background: {
      default: '#E0E0E0', // Soft, light grey background for the app
      paper: '#FFFFFF',   // White for cards, etc.
    },
    text: {
      primary: '#2F3C31', // Dark brown for general text
      secondary: '#6E7F71', // Muted green-brown for secondary text
    }
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    logo: {
      fontSize: '2rem',
      fontWeight: 700,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        text: ({ theme }) => ({
          fontFamily: '"M PLUS 1", sans-serif',
          color: theme.palette.primary.contrastText, // White text
          '&:hover': {
            backgroundColor: theme.palette.primary.dark, // Darker green-brown on hover
          },
        }),
        contained: ({ theme }) => ({
          color: theme.palette.primary.contrastText, // White text
          backgroundColor: theme.palette.secondary.main, // Warm brown for contained
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark, // Darker brown on hover
            boxShadow: 'none',
          },
        }),
      },
    },
    MuiIconButton:{
      styleOverrides:{
        root: ({ theme }) => ({
          color: theme.palette.primary.contrastText, // White icon
          '&:hover':{
             backgroundColor: theme.palette.primary.dark, // Darker green-brown on hover
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