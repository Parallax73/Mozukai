import * as React from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import { IconButton, Box, Paper, Typography, Button, Divider, Link } from '@mui/material';

type Step =
  | 'menu'
  | 'basic-care'
  | 'select-type'
  | 'select-region'
  | 'show-result';

export default function Chat() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>('menu');
  const [type, setType] = React.useState<'indoor' | 'outdoor' | null>(null);
  const [region, setRegion] = React.useState<string | null>(null);

  const paperRef = React.useRef<HTMLDivElement | null>(null);
  const iconButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        paperRef.current &&
        !paperRef.current.contains(event.target as Node) &&
        iconButtonRef.current &&
        !iconButtonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setStep('menu');
        setType(null);
        setRegion(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleOpen = () => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
    }
    setStep('menu');
    setType(null);
    setRegion(null);
  };

  const basicCareContent = (
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
      <Typography>
        Para mais informações leia nosso <Link href="/blog">blog</Link>
      </Typography>
    </Box>
  );

  const speciesByRegion: Record<
    string,
    {
      description: string;
      indoor: { name: string; reason: string }[];
      outdoor: { name: string; reason: string }[];
    }
  > = {
    'Sul': {
      description: 'Clima temperado com invernos rigorosos e verões amenos.',
      indoor: [
        { name: 'Ficus retusa', reason: 'Tolera bem ambientes internos e umidade.' },
        { name: 'Schefflera arboricola', reason: 'Folhagem bonita e fácil manutenção.' },
      ],
      outdoor: [
        { name: 'Juniperus', reason: 'Muito resistente ao frio e ao vento.' },
        { name: 'Acer buergerianum', reason: 'Apresenta belas cores no outono.' },
        { name: 'Pinheiro-negro', reason: 'Tradicional no estilo clássico japonês.' },
      ],
    },
    'Sudeste': {
      description: 'Clima tropical e subtropical com estações bem definidas.',
      indoor: [
        { name: 'Ficus microcarpa', reason: 'Adapta-se bem à variação de luz e umidade.' },
        { name: 'Jade (Crassula ovata)', reason: 'Suporta ambientes secos e pouca rega.' },
      ],
      outdoor: [
        { name: 'Piteira', reason: 'Resistente à seca e sol intenso.' },
        { name: 'Ipê amarelo', reason: 'Florada exuberante e símbolo nacional.' },
        { name: 'Bougainvillea', reason: 'Floresce abundantemente ao sol.' },
      ],
    },
    'Centro Oeste': {
      description: 'Clima tropical com estação seca prolongada e calor intenso.',
      indoor: [
        { name: 'Ficus benjamina', reason: 'Folhagem densa e adaptação à sombra.' },
        { name: 'Serissa', reason: 'Compacta, ideal para cultivo interno.' },
      ],
      outdoor: [
        { name: 'Piteira', reason: 'Tolera seca e calor extremo.' },
        { name: 'Ipê roxo', reason: 'Rústico e ornamental com floração intensa.' },
        { name: 'Bougainvillea', reason: 'Gosta de calor e pleno sol.' },
      ],
    },
    'Norte': {
      description: 'Clima equatorial quente e úmido durante todo o ano.',
      indoor: [
        { name: 'Ficus retusa', reason: 'Resistente à alta umidade do ambiente.' },
        { name: 'Schefflera', reason: 'Aceita bem ambientes úmidos e internos.' },
      ],
      outdoor: [
        { name: 'Tamareira', reason: 'Bem adaptada ao clima tropical úmido.' },
        { name: 'Pau-brasil', reason: 'Nativo e com ótima adaptação à região.' },
        { name: 'Bougainvillea', reason: 'Resistente e floresce bem ao calor.' },
      ],
    },
    'Nordeste': {
      description: 'Clima quente com longos períodos secos e sol intenso.',
      indoor: [
        { name: 'Jade (Crassula ovata)', reason: 'Armazena água e resiste à secura.' },
        { name: 'Ficus benjamina', reason: 'Adapta-se bem a ambientes iluminados.' },
      ],
      outdoor: [
        { name: 'Bougainvillea', reason: 'Floresce o ano inteiro com sol forte.' },
        { name: 'Piteira', reason: 'Ideal para locais áridos e ensolarados.' },
        { name: 'Flamboyant', reason: 'Muito ornamental e tolerante ao calor.' },
      ],
    },
  };

  const treeSelectionContent = () => {
    switch (step) {
      case 'select-type':
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 2 }}>
              Selecione uma opção
            </Typography>
            <Typography variant="subtitle1">
              • Indoor: Vivem dentro de casa com boa luz solar (4-6 horas)
            </Typography>
            <Typography variant="subtitle1">
              • Outdoor: Precisam ficar fora, com sol direto e passar pelo inverno
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button fullWidth variant="contained" onClick={() => { setType('indoor'); setStep('select-region'); }}>
                Indoor
              </Button>
              <Button fullWidth variant="contained" onClick={() => { setType('outdoor'); setStep('select-region'); }}>
                Outdoor
              </Button>
            </Box>
          </Box>
        );
      case 'select-region':
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Em qual parte você está localizado?
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.keys(speciesByRegion).map((reg) => (
                <Button key={reg} fullWidth variant="contained" onClick={() => { setRegion(reg); setStep('show-result'); }}>
                  {reg}
                </Button>
              ))}
            </Box>
          </Box>
        );
      case 'show-result': {
        if (!region || !type) return null;
        const data = speciesByRegion[region];
        const list = data[type];
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Região: {region}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>{data.description}</Typography>
            <Typography variant="subtitle1">Recomendações:</Typography>
            {list.map((item, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="body2"><strong>• {item.name}</strong>: {item.reason}</Typography>
              </Box>
            ))}
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
        <Button variant="contained" onClick={() => setStep('select-type')}>
          Escolher sua primeira árvore
        </Button>
        <Button variant="contained" onClick={() => setStep('basic-care')}>
          Cuidados básicos
        </Button>
      </Box>
    );
  } else if (step === 'basic-care') {
    content = basicCareContent;
    actions = (
      <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setStep('menu')}>
        Voltar
      </Button>
    );
  } else {
    content = treeSelectionContent();
    actions = (
      <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setStep('menu')}>
        Voltar ao início
      </Button>
    );
  }

  return (
    <>
      <IconButton
        ref={iconButtonRef}
        onClick={toggleOpen}
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
          <Box sx={{ mt: 2 }}>{actions}</Box>
        </Paper>
      )}
    </>
  );
}
