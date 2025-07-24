import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import CartService from '../../../services/CartService';
import { Product } from '../../../models/Product';
import { Button } from '@mui/material';

export default function Info() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState<number>(0);
  const [removingId, setRemovingId] = React.useState<number | null>(null);

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const cartProducts = await CartService.getProductsCart();
      setProducts(cartProducts);
      const sum = cartProducts.reduce((acc, p) => acc + parseFloat(p.price), 0);
      setTotal(sum);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart products');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRemove = async (id: number) => {
    setRemovingId(id);
    setError(null);

    try {
      await CartService.removeProductFromCart(id);
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      const sum = updatedProducts.reduce((acc, p) => acc + parseFloat(p.price), 0);
      setTotal(sum);
    } catch (err: any) {
      setError('Erro ao remover o produto do carrinho.');
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2" sx={{ mb: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <React.Fragment>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        Total
      </Typography>
      <Typography variant="h4" gutterBottom>
        R${total.toFixed(2)}
      </Typography>
      <List disablePadding>
        {products.length === 0 ? (
          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText primary="Seu carrinho está vazio" />
          </ListItem>
        ) : (
          products.map((product) => (
            <ListItem key={product.id} sx={{ py: 1, px: 0 }}>
              <ListItemText
                sx={{ mr: 2 }}
                primary={product.name}
                secondary={product.description || product.type || ''}
              />
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                R${product.price}
              </Typography>
              <Button
                sx={{ ml: 5 }}
                color="error"
                onClick={() => handleRemove(product.id)}
                disabled={removingId === product.id}
              >
                {removingId === product.id ? <CircularProgress size={20} /> : 'X'}
              </Button>
            </ListItem>
          ))
        )}
      </List>
    </React.Fragment>
  );
}
