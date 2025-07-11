import { Box, Typography } from '@mui/material'
import ProductCard from '../components/ProductCard'
import type { ProductProps } from '../components/ProductCard'

const products: ProductProps[] = [
  {
    id: 1,
    name: 'Bonsai Tradicional',
    price: 'R$ 199,90',
    type: 'image',
    src: '/models/bonsai_tree/picture.png'
  },
  {
    id: 2,
    name: 'Ficus Bonsai',
    price: 'R$ 249,90',
    type: 'image',
    src: '/models/chinese_elm/picture.png'
  }
]

export default function BonsaiPage() {
  return (
    <Box sx={{ px: 4, py: 6 , pt: '10rem'}}>
      <Typography variant="h4" gutterBottom>
        Produtos
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr',
            lg: '1fr 1fr 1fr 1fr'
          }
        }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </Box>
    </Box>
  )
}
