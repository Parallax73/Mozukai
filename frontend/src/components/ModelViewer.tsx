import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import { Group } from 'three'
import { useFrame } from '@react-three/fiber'

type ModelViewerProps = {
  path: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  autoRotateOnly?: boolean
}

export default function ModelViewer({
  path,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotateOnly = false
}: ModelViewerProps) {
  const group = useRef<Group>(null)
  const { scene } = useGLTF(path)

  
  useFrame(() => {
    if (autoRotateOnly && group.current) {
      group.current.rotation.y += 0.005
    }
  })

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
    </group>
  )
}
