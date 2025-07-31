import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';



interface CardData {
  id: string;
  img: string;
  tag: string;
  title: string;
  description: string;
}

const SyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  height: '100%',
  backgroundColor: (theme.vars || theme).palette.background.paper,
  '&:hover': {
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '2px',
  },
}));

const SyledCardContent = styled(CardContent)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 16,
  flexGrow: 1,
  '&:last-child': {
    paddingBottom: 16,
  },
});

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export function Search({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (value: string) => void }) {
  return (
    <FormControl sx={{ width: { xs: '100%', md: '25ch' } }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Busque..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.primary' }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{ 'aria-label': 'search' }}
      />
    </FormControl>
  );
}

const CategoryChips = ({
  selectedCategory,
  handleClick,
}: {
  selectedCategory: string;
  handleClick: (category: string) => void;
}) => {
  const categories = ['Todas categorias', 'Bonsai', 'Cuidados', 'Estilos'];
  return (
    <>
      {categories.map((cat) => (
        <Chip
          key={cat}
          onClick={() => handleClick(cat)}
          size="medium"
          label={cat}
          sx={{
            backgroundColor: selectedCategory === cat ? 'primary.main' : 'transparent',
            color: selectedCategory === cat ? 'primary.contrastText' : 'inherit',
            border: selectedCategory === cat ? 'none' : '1px solid',
            borderColor: selectedCategory === cat ? 'transparent' : 'divider',
          }}
        />
      ))}
    </>
  );
};

const SearchBarWithRSS = ({
  searchTerm,
  onSearchChange,
  display,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  display: any;
}) => (
  <Box
    sx={{
      display,
      flexDirection: 'row',
      gap: 1,
      width: { xs: '100%', md: 'fit-content' },
      overflow: 'auto',
    }}
  >
    <Search searchTerm={searchTerm} onSearchChange={onSearchChange} />
    <IconButton size="small" aria-label="RSS feed">
      <RssFeedRoundedIcon />
    </IconButton>
  </Box>
);

export default function MainContent() {
  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(null);
  const [cardData, setCardData] = React.useState<CardData[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Todas categorias');
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  React.useEffect(() => {
    fetch('/cardData.json')
      .then((response) => response.json())
      .then((data) => setCardData(data))
      .catch((error) => console.error('Error loading card data:', error));
  }, []);

  const handleFocus = (index: number) => setFocusedCardIndex(index);
  const handleBlur = () => setFocusedCardIndex(null);
  const handleClick = (category: string) => setSelectedCategory(category);
  const handleSearchChange = (value: string) => setSearchTerm(value);

  const filteredCardData = React.useMemo(() => {
    let filtered =
      selectedCategory === 'Todas categorias'
        ? cardData
        : cardData.filter((card) => card.tag === selectedCategory);

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (card) =>
          card.title.toLowerCase().includes(searchLower) ||
          card.description.toLowerCase().includes(searchLower) ||
          card.tag.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [cardData, selectedCategory, searchTerm]);

  if (cardData.length === 0) {
    return <div>Loading...</div>;
  }

  if (filteredCardData.length === 0 && (selectedCategory !== 'Todas categorias' || searchTerm.trim())) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div>
          <Typography variant="h1" gutterBottom>
            Blog
          </Typography>
          <Typography>Fique atento em nosso posts</Typography>
        </div>
        <SearchBarWithRSS
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          display={{ xs: 'flex', sm: 'none' }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', md: 'row' },
            width: '100%',
            justifyContent: 'space-between',
            alignItems: { xs: 'start', md: 'center' },
            gap: 4,
            overflow: 'auto',
          }}
        >
          <Box sx={{ display: 'inline-flex', flexDirection: 'row', gap: 3, overflow: 'auto' }}>
            <CategoryChips selectedCategory={selectedCategory} handleClick={handleClick} />
          </Box>
          <SearchBarWithRSS
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            display={{ xs: 'none', sm: 'flex' }}
          />
        </Box>
        <Typography>
          {searchTerm.trim()
            ? 'Não foi possível encontrar um resultado pra sua pesquisa'
            : `No articles found for category: ${selectedCategory}`}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div>
        <Typography variant="h1" gutterBottom>
          Blog
        </Typography>
        <Typography>Fique atentos em nossos posts.</Typography>
      </div>
      <SearchBarWithRSS
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        display={{ xs: 'flex', sm: 'none' }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          width: '100%',
          justifyContent: 'space-between',
          alignItems: { xs: 'start', md: 'center' },
          gap: 4,
          overflow: 'auto',
        }}
      >
        <Box sx={{ display: 'inline-flex', flexDirection: 'row', gap: 3, overflow: 'auto' }}>
          <CategoryChips selectedCategory={selectedCategory} handleClick={handleClick} />
        </Box>
        <SearchBarWithRSS
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          display={{ xs: 'none', sm: 'flex' }}
        />
      </Box>
      <Grid container spacing={2} columns={12}>
  {filteredCardData.map((card, index) => (
    <Grid size={{ xs: 12, md: index < 2 ? 6 : 4 }} key={index}>
      <SyledCard
        variant="outlined"
        onFocus={() => handleFocus(index)}
        onBlur={handleBlur}
        onClick={() => window.location.href = `blog/${card.id}`}
        tabIndex={0}
        className={focusedCardIndex === index ? 'Mui-focused' : ''}
        sx={{
          ...(index >= 2 ? { height: '100%' } : undefined),
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 2,
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <CardMedia
          component="img"
          alt={card.title}
          image={card.img}
          sx={
            index >= 2
              ? {
                  height: { sm: 'auto', md: '50%' },
                  aspectRatio: { sm: '16 / 9', md: '' },
                }
              : {
                  aspectRatio: '16 / 9',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }
          }
        />
        <SyledCardContent>
          <Typography gutterBottom variant="caption" component="div">
            {card.tag}
          </Typography>
          <Typography gutterBottom variant="h6" component="div">
            {card.title}
          </Typography>
          <StyledTypography variant="body2" color="text.secondary" gutterBottom>
            {card.description}
          </StyledTypography>
        </SyledCardContent>
      </SyledCard>
    </Grid>
  ))}
</Grid>
    </Box>
  );
}
