/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Product } from '../models/Product';
import { useEffect, useState } from 'react';

interface ProductListProps {
  productType?: 'bonsai' | 'pot' | 'accessory' | 'tools' | 'supply';
  title: string;
}

const ProductService = {
  baseUrl: 'http://localhost:8000',

  async getAllProducts(productType?: string): Promise<Product[]> {
    const url = new URL(this.baseUrl + '/products');
    if (productType) {
      url.searchParams.append('type', productType);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
     
      throw new Error(`Erro ao buscar produtos: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  },
};

export default function ProductList({ productType, title }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedProducts = await ProductService.getAllProducts(productType);
        setProducts(fetchedProducts);
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido ao carregar produtos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productType]);

  if (loading) {
    return (
      <Box sx={{ px: 4, py: 6, pt: '10rem', textAlign: 'center' }}>
        <Typography variant="h5">Carregando {title.toLowerCase()}...</Typography>
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
        {title}
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
    Sem produtos disponíveis
  </Typography>
)}

      </Box>
    </Box>
  );
}
