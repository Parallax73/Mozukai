/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography, Button, Card, CardMedia } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ModelViewer from '../components/shared/ModelViewer';
import { Product } from '../models/Product';
import ProductService from '../services/ProductService';
import Alert from '@mui/material/Alert';


export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedProduct = await ProductService.getProductById(id);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          setError('Product not found.');
        }
      } catch (err: any) {
        console.error("Failed to fetch product:", err);
        setError(`Failed to load product details: ${err.message || 'Unknown error'}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ pt: '10rem', textAlign: 'center' }}>
        <Typography variant="h5">Carregando detalhes do produto</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pt: '10rem', textAlign: 'center', color: 'error.main' }}>
        <Typography variant="h5">{error}</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ pt: '10rem', textAlign: 'center' }}>
        <Typography variant="h5">Produto não encontrado</Typography>
      </Box>
    );
  }

  const has3DModel = product.sourceModel && product.sourceModel !== '';

  return (
    
    <Box
      sx={{
        pt: '10rem',
        px: 4,
        pb: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
    
  
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
        }}
      >
       
        <Box
          sx={{
            flex: 2,
            height: '70vh',
            border: '1px solid',
            borderColor: 'grey.800',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: "#eadfc8"
          }}
        >
          {has3DModel ? (
            <><Typography>Talvez precise diminuir o zoom para visualizar o modelo</Typography><Canvas camera={{ position: [3, 4, 9], fov: 45 }}>
              <ambientLight intensity={1} />
              <directionalLight position={[10, 10, 10]} intensity={1.2} />
              <Suspense fallback={null}>
                <ModelViewer
                  path={product.sourceModel}
                  scale={0.7}
                  position={[0, -1.5, 0]}
                  autoRotateOnly={false} />
                <OrbitControls
                  enableZoom={true}
                  enablePan={false}
                  enableRotate={true}
                  target={[0, 0, 0]}
                  minDistance={3}
                  maxDistance={50} />
              </Suspense>
            </Canvas></>
          ) : (
            <CardMedia
              component="img"
              height="100%"
              image={product.sourceImage}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          )}
        </Box>

       
        <Box
          sx={{
            flex: 1,
            border: '1px solid',
            borderColor: 'grey.800',
            borderRadius: 2,
            backgroundColor: "#eadfc8",
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: { xs: 'auto', md: '30vh' },
          }}
        >
          <Typography variant="h5">{product.name}</Typography>
          <Typography variant="h6" color="text.secondary">
            R${product.price}
          </Typography>
          <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" fullWidth>
              Comprar agora
            </Button>
            <Button variant="outlined" color="primary" fullWidth>
              Adicionar ao carrinho
            </Button>
          </Box>
          <Alert severity="success" color="success">
            Produto adicionado ao carrinho com sucesso.
          </Alert>
        </Box>
      </Box>

      
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'grey.800',
          borderRadius: 2,
          backgroundColor: "#eadfc8",
          p: 3,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Descrição do Produto
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          {product.description}
        </Typography>

        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'grey.300',
            pt: 2,
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Fotos
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            <Card sx={{ minWidth: 150 }}>
              <CardMedia
                component="img"
                height="100"
                image={product.sourceImage}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}