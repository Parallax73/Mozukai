import Container from '@mui/material/Container';
import MainContent from '../components/pages/blog/MainContent';
import Footer from '../components/shared/Footer';


export default function BlogPage() {
  return (
  
      <><Container
      maxWidth="lg"
      component="main"
      sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
    >
      <MainContent />
    </Container><Footer /></>
  );
}
