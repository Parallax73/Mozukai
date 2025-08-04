import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { useState } from 'react';
import ProductService from '../../../../services/ProductService';


export default function HighlightedCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [sourceImage, setSourceImage] = useState('');
  const [sourceModel, setSourceModel] = useState('');
  const [type, setType] = useState<'bonsai' | 'pot' | 'accessory' | 'tools' | 'supply'>('bonsai');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const productData = {
        name,
        price: parseFloat(price),
        description,
        sourceImage,
        sourceModel,
        type,
      };

      const created = await ProductService.createProduct(productData);
      console.log('Product created:', created);
      handleClose();
    } catch (err) {
      console.error('Error creating product:', err);
      alert(err instanceof Error ? err.message : 'Unknown error occurred while creating product');
    }
  };

  const handleTransformModel = () => {
    window.open('/pipeline', '_blank');
  };

  const inputStyle = {
    borderRadius: '12px',
  };

  return (
    <>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Button
            variant="contained"
            size="small"
            color="primary"
            endIcon={<AddIcon />}
            fullWidth={isSmallScreen}
            onClick={handleOpen}
          >
            Add a product
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Novo produto
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              sx={{ flex: 1, input: inputStyle }}
            />
            <TextField
              label="Preço"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              fullWidth
              sx={{ flex: 1, input: inputStyle }}
              type="number"
              inputProps={{ step: "0.01" }}
            />
          </Box>

          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={5}
            sx={{
              mb: 2,
              textarea: { ...inputStyle, overflowY: 'auto' },
            }}
          />

          <TextField
            label="Image URL"
            value={sourceImage}
            onChange={(e) => setSourceImage(e.target.value)}
            fullWidth
            sx={{ mb: 2, input: inputStyle }}
          />

          <TextField
            label="Model URL"
            value={sourceModel}
            onChange={(e) => setSourceModel(e.target.value)}
            fullWidth
            sx={{ mb: 1.5, input: inputStyle }}
          />

          <Button
            variant="outlined"
            onClick={handleTransformModel}
            sx={{ mb: 3 }}
          >
            Transforme 3D
          </Button>

          <FormControl fullWidth>
            <InputLabel id="product-type-label">Type</InputLabel>
            <Select
              labelId="product-type-label"
              value={type}
              label="Tipo"
              onChange={(e) => setType(e.target.value as typeof type)}
              sx={{
                borderRadius: '12px',
              }}
            >
              <MenuItem value="bonsai">Bonsai</MenuItem>
              <MenuItem value="pot">Vaso</MenuItem>
              <MenuItem value="accessory">Acessório</MenuItem>
              <MenuItem value="tools">Ferramentas</MenuItem>
              <MenuItem value="supply">Insumos</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancele</Button>
          <Button onClick={handleSubmit} variant="contained">Crie</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
