import * as React from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import { IconButton, Box, Paper, Typography, Button, Divider } from '@mui/material';

type Step =
  | 'menu'
  | 'cuidados'
  | 'option-1'
  | 'option-2'
  | 'option-3'
  | 'resultado';

export default function Chat() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>('menu');


  const [indoorOutdoor, setIndoorOutdoor] = React.useState<'indoor' | 'outdoor' | null>(null);
  const [region, setRegion] = React.useState<string | null>(null);

  const paperRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (paperRef.current && !paperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setStep('menu');
        setIndoorOutdoor(null);
        setRegion(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleClickOpen = () => {
    setOpen(true);
    setStep('menu');
    setIndoorOutdoor(null);
    setRegion(null);
  };

  const handleClose = () => {
    setOpen(false);
    setStep('menu');
    setIndoorOutdoor(null);
    setRegion(null);
  };

 
  const cuidadosBasicosContent = (
    <Box>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Cuidados básicos
      </Typography>
      <Typography variant="body2">
        Aqui vão algumas dicas para cuidar bem da sua árvore:
        <ul>
          <li>Regue adequadamente conforme a espécie.</li>
          <li>Ofereça luz solar na medida certa.</li>
          <li>Proteja de pragas e ventos fortes.</li>
          <li>Adube na época correta.</li>
        </ul>
      </Typography>
    </Box>
  );

 
  const escolherTreeContent = () => {
    switch (step) {
      case 'option-1':
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Indoor ou Outdoor?
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                color={indoorOutdoor === 'indoor' ? 'primary' : 'secondary'}
                onClick={() => {
                  setIndoorOutdoor('indoor');
                  setStep('option-2');
                }}
              >
                Indoor
              </Button>
              <Button
                fullWidth
                variant="contained"
                color={indoorOutdoor === 'outdoor' ? 'primary' : 'secondary'}
                onClick={() => {
                  setIndoorOutdoor('outdoor');
                  setStep('option-2');
                }}
              >
                Outdoor
              </Button>
            </Box>
          </Box>
        );
      case 'option-2':
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Em qual parte você está localizado?
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['Sul', 'Sudeste', 'Centro Oeste', 'Norte', 'Nordeste'].map((reg) => (
                <Button
                  fullWidth
                  variant="contained"
                  color={region === reg ? 'primary' : 'secondary'}
                  key={reg}
                  onClick={() => {
                    setRegion(reg);
                    setStep('option-3');
                  }}
                >
                  {reg}
                </Button>
              ))}
            </Box>
          </Box>
        );
      case 'option-3': {
        let recomendacao = '';
        if (indoorOutdoor === 'indoor') {
          recomendacao = `Recomendamos espécies de sombra e que se adaptam bem a ambientes internos na região ${region}.`;
        } else if (indoorOutdoor === 'outdoor') {
          recomendacao = `Espécies resistentes ao clima da região ${region} são ideais para o plantio externo.`;
        }
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Sugestão de árvore
            </Typography>
            <Typography variant="body2">{recomendacao}</Typography>
          </Box>
        );
      }
      default:
        return null;
    }
  };

  
  let content;
  let actions;
  if (step === 'menu') {
    content = (
      <Typography variant="body2" sx={{ mt: 1 }}>
        Olá, como posso te ajudar?
      </Typography>
    );
    actions = (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button variant="contained" onClick={() => setStep('option-1')}>
          Escolher sua primeira árvore
        </Button>
        <Button variant="contained" onClick={() => setStep('cuidados')}>
          Cuidados básicos
        </Button>
      </Box>
    );
  } else if (step === 'cuidados') {
    content = cuidadosBasicosContent;
    actions = (
      <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setStep('menu')}>
        Voltar
      </Button>
    );
  } else if (step === 'option-1' || step === 'option-2') {
    content = escolherTreeContent();
    actions = (
      <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setStep('menu')}>
        Voltar
      </Button>
    );
  } else if (step === 'option-3') {
    content = escolherTreeContent();
    actions = (
      <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setStep('menu')}>
        Voltar ao início
      </Button>
    );
  }

  return (
    <>
      <IconButton
        onClick={open ? handleClose : handleClickOpen}
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 50,
          zIndex: 9999,
          backgroundColor: 'primary.dark',
          color: 'white',
          boxShadow: 4,
          '&:hover': {
            backgroundColor: 'secondary.dark',
          },
        }}
      >
        <ChatIcon />
      </IconButton>

      {open && (
        <Paper
          ref={paperRef}
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 50,
            zIndex: 9998,
            width: 300,
            height: 400,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 3,
            backgroundColor: 'background.paper',
            overflow: 'auto',
          }}
        >
          <Box>
            <Typography variant="h6">Chat</Typography>
            <Divider />
            {content}
          </Box>
          <Box sx={{ mt: 2 }}>
            {actions}
          </Box>
        </Paper>
      )}
    </>
  );
}