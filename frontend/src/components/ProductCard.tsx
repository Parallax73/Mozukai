import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import ModelViewer from './ModelViewer'

export type ProductProps = {
  id: number
  name: string
  price: string
  src: string
  type: '3d' | 'image'
}

export default function ProductCard({ name, price, src, type }: ProductProps) {
  return (
    <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
      {type === '3d' ? (
        <CardMedia sx={{ height: 250, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [3, 4, 9], fov: 45 }}>

              <ambientLight intensity={1} />
              <directionalLight position={[10, 10, 10]} intensity={1.2} />
              <Suspense fallback={null}>
                <ModelViewer
                  path={src}
                  scale={0.7}
                  position={[0, -1.5, 0]}
                  autoRotateOnly={false}
                />
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  enableRotate={false}
                  target={[0, 0, 0]}
                  minDistance={9}
                  maxDistance={9}
                />
              </Suspense>
            </Canvas>
          </Box>
        </CardMedia>
      ) : (
        <CardMedia
          component="img"
          height="250"
          image={src}
          alt={name}
          sx={{ objectFit: 'cover' }}
        />
      )}

      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <Typography color="text.secondary">{price}</Typography>
      </CardContent>
    </Card>
  )
}
