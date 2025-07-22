import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Chip } from '@mui/material';
import Footer from '../components/shared/Footer';

interface CardData {
  id: string;
  img: string;
  tag: string;
  title: string;
  description: string;
  text: string;
}

export default function BlogItemPage() {
  const { id } = useParams<{ id: string }>();
  const [cardData, setCardData] = React.useState<CardData | null>(null);

  React.useEffect(() => {
    fetch('/cardData.json')
      .then((response) => response.json())
      .then((data: CardData[]) => {
        const found = data.find((item) => item.id === id);
        if (found) {
          setCardData(found);
        }
      })
      .catch((error) => console.error('Error loading blog item:', error));
  }, [id]);

  if (!cardData) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4, mt: '5rem' }}>
        <Chip label={cardData.tag} sx={{ mb: 3 }} />
        
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          {cardData.title}
        </Typography>

        <Box
          component="img"
          src={`/${cardData.img}`}
          alt={cardData.title}
          sx={{ 
            width: '100%', 
            height: 'auto',
            maxHeight: '500px',
            objectFit: 'cover',
            borderRadius: 2, 
            mb: 4,
            display: 'block'
          }}
        />

        <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: '1.1rem' }}>
          {cardData.description}
        </Typography>

        <Box sx={{ 
          '& h3': { 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            mt: 4, 
            mb: 2,
            color: 'primary.main'
          },
          '& p': { 
            lineHeight: 1.8, 
            mb: 2,
            fontSize: '1rem'
          },
          '& ul': {
            mb: 3,
            pl: 3
          },
          '& li': {
            mb: 1,
            lineHeight: 1.6
          }
        }}>
          <div dangerouslySetInnerHTML={{ 
            __html: cardData.text
              .replace(/### (.*)/g, '<h3>$1</h3>')
              .replace(/\* \*\*(.*?):\*\* (.*)/g, '<li><strong>$1:</strong> $2</li>')
              .replace(/(?<!<\/li>)\n(?=<li>)/g, '<ul>')
              .replace(/(<\/li>)(?!\n<li>)/g, '$1</ul>')
              .replace(/\n\n/g, '</p><p>')
              .replace(/^(?!<[h|u|l])/g, '<p>')
              .replace(/(?<![>])$/g, '</p>')
              .replace(/<p><\/p>/g, '')
              .replace(/<p><h3>/g, '<h3>')
              .replace(/<\/h3><\/p>/g, '</h3>')
              .replace(/<p><ul>/g, '<ul>')
              .replace(/<\/ul><\/p>/g, '</ul>')
          }} />
        </Box>
      </Container>
      <Footer />
    </>
  );
}