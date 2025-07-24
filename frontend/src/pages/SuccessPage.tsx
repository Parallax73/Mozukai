import { Box, Typography, Container, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function SuccessPage() {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        textAlign="center"
      >
        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Obrigado pela compra!
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Mais informações serão enviadas para o seu e-mail. 
          Fique atento à sua caixa de entrada e spam.
        </Typography>
        <Button variant="contained" color="primary" href="/">
          Voltar para a página inicial
        </Button>
      </Box>
    </Container>
  );
}
