/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Product } from '../models/Product';
import { useEffect, useState } from 'react';
import { ProductService } from '../services/ProductService';

export default function BonsaiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await ProductService.getAllProducts();
        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error("Failed to fetch products:", err);
        setError(`Failed to load products: ${err.message || 'Unknown error'}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ px: 4, py: 6, pt: '10rem', textAlign: 'center' }}>
        <Typography variant="h5">Loading products...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: 4, py: 6, pt: '10rem', textAlign: 'center', color: 'error.main' }}>
        <Typography variant="h5">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 4, py: 6, pt: '10rem' }}>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr',
            lg: '1fr 1fr 1fr 1fr',
          },
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            displayMode="image" 
          />
        ))}
      </Box>
    </Box>
  );
}