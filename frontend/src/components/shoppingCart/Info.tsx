import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import CartService from '../../services/CartService';
import { Product } from '../../models/Product';
import { Button } from '@mui/material';

interface InfoProps {
  totalPrice: string;
}

export default function Info({ totalPrice }: InfoProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const cartProducts = await CartService.getProductsCart();
        setProducts(cartProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cart products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2">
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
        {totalPrice}
      </Typography>
      <List disablePadding>
        {products.length === 0 ? (
          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText primary="Your cart is empty" />
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
              <Button sx={{ml: 5 }}>X</Button>
            </ListItem>
          ))
        )}
      </List>
    </React.Fragment>
  );
}