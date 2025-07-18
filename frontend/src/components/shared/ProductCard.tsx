import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import ModelViewer from './ModelViewer'
import { Product } from '../../models/Product'

type ProductCardProps = {
  product: Product
  displayMode: 'image' | '3d'
}

export default function ProductCard({ product, displayMode }: ProductCardProps) {
  const navigate = useNavigate()

  const show3D = displayMode === '3d' && !!product.sourceModel

  return (
    <Card
      onClick={() => navigate(`/item/${product.id}`)}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#F5F0E5',
        border: '1px solid',
        borderColor: 'grey.300',
        boxShadow: 'none',
        transition: 'border-color 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'grey.900',
          backgroundColor: '#E8DDCB',
        },
      }}
    >
      {show3D ? (
        <CardMedia sx={{ height: 250, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 0, 30], fov: 90 }}>
              <ambientLight intensity={1} />
              <directionalLight position={[10, 10, 10]} intensity={1.2} />
              <Suspense fallback={null}>
                <ModelViewer path={product.sourceModel} scale={0.7} position={[0, -1.5, 0]} autoRotateOnly={false} />

                <OrbitControls
                  enableZoom={true}
                  enablePan={false}
                  enableRotate={true}
                  minDistance={5}
                  maxDistance={50}
                />
              </Suspense>
            </Canvas>
          </Box>
        </CardMedia>
      ) : (
        <CardMedia
          component="img"
          height="250"
          image={product.sourceImage}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
      )}

      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography color="text.secondary">{product.price}</Typography>
      </CardContent>
    </Card>
  )
}
