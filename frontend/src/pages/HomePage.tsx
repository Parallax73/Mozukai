import { Box, Button } from '@mui/material'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import RotatingText from '../components/RotatingText'
import ModelViewer from '../components/ModelViewer'

export default function HomePage() {
  const words = ['Natureza', 'Arte', 'Vida', 'Mozukai']
  const autoRotateOnly = true

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          pt: '5vh',
          fontSize: '4rem'
        }}
      >
        <div className="rotating-text-demo">
          <LayoutGroup>
            <motion.p className="rotating-text-ptag" layout>
              <motion.span
                layout
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              >
                Bonsai é
              </motion.span>
              <RotatingText
                texts={words}
                mainClassName="rotating-text-main"
                staggerFrom={'last'}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-120%' }}
                staggerDuration={0.025}
                splitLevelClassName="rotating-text-split"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
            </motion.p>
          </LayoutGroup>
        </div>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          pb: '4rem'
        }}
      >
        <Button component={Link} to="/bonsai" variant="contained" endIcon={<ArrowOutwardIcon />}>
          Produtos
        </Button>
        <Button component={Link} to="/blog" variant="outlined">Saiba mais</Button>
      </Box>

      <Box
        sx={{
          width: '100%',
          height: '60vh',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Canvas camera={{ position: [3, 4, 14], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Suspense fallback={null}>
            <ModelViewer
              path="/models/bonsai_tree/scene.gltf"
              scale={0.7}
              position={[0, -1.5, 0]}
              autoRotateOnly={autoRotateOnly}
            />
            {!autoRotateOnly && (
              <OrbitControls
                enableZoom={false}
                minDistance={14}
                maxDistance={14}
                target={[0, 0, 0]}
              />
            )}
          </Suspense>
        </Canvas>
      </Box>
    </>
  )
}
