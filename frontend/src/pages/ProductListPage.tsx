import { Box, Typography } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Product } from '../models/Product';
import { useEffect, useState } from 'react';
import ProductService from '../services/ProductService';
import { useLocation } from 'react-router-dom';

interface ProductListProps {
  productType?: 'bonsai' | 'pot' | 'accessory' | 'tools' | 'supply';
  title?: string;
}

export default function ProductList({ productType, title }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('query') || '';

  const displayTitle = title || (searchTerm ? `Results for "${searchTerm}"` : 'All products');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedProducts = await ProductService.getAllProducts(productType, searchTerm);
        setProducts(fetchedProducts);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error while fetching products');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productType, searchTerm]);

  if (loading) {
    return (
      <Box sx={{ px: 4, py: 6, pt: '10rem', textAlign: 'center' }}>
        <Typography variant="h5">Carregando {displayTitle.toLowerCase()}...</Typography>
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
        {displayTitle}
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
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              displayMode="image"
            />
          ))
        ) : (
          <Typography variant="h6" sx={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            {searchTerm ? `0 products found for: "${searchTerm}".` : 'No products avaiable.'}
          </Typography>
        )}
      </Box>
    </Box>
  );
}