import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import type { Product } from '../../../models/Product';
import CartService from '../../../services/CartService';

export default function PaymentForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function loadCart() {
      try {
        const products = await CartService.getProductsCart();
        setCartProducts(products);
        const sum = products.reduce((acc, product) => acc + parseFloat(product.price), 0);
        setTotal(sum);
      } catch {
        setError("Erro ao carregar carrinho.");
      }
    }

    loadCart();
  }, []);

  const handlePayment = async (method: 'card' | 'boleto') => {
    if (cartProducts.length === 0) {
      setError('Seu carrinho está vazio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await CartService.initiateCheckout(method, cartProducts, total);
      window.location.href = url;
    } catch (err: any) {
      setError('Erro ao redirecionar para o checkout.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4} display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h5" mb={2}>
        Escolha a forma de pagamento
      </Typography>

      <Stack spacing={2} direction="column" width="100%" maxWidth="400px">
        <Card
          sx={{ cursor: 'pointer', border: '1px solid #ccc', '&:hover': { boxShadow: 3 } }}
          onClick={() => handlePayment('card')}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <CreditCardIcon sx={{ mr: 2 }} />
            <Typography variant="body1">Cartão de Crédito</Typography>
          </CardContent>
        </Card>

        <Card
          sx={{ cursor: 'pointer', border: '1px solid #ccc', '&:hover': { boxShadow: 3 } }}
          onClick={() => handlePayment('boleto')}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptLongIcon sx={{ mr: 2 }} />
            <Typography variant="body1">Boleto Bancário</Typography>
          </CardContent>
        </Card>

        {loading && <CircularProgress />}
        {error && (
          <Typography color="error" textAlign="center">
            {error}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
