import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AddressForm from '../components/shoppingCart/AddressForm';
import Info from '../components/shoppingCart/Info';
import InfoMobile from '../components/shoppingCart/InfoMobile';
import PaymentForm from '../components/shoppingCart/PaymentForm';
import Review from '../components/shoppingCart/Review';
import { MozukaiIcon } from '../components/common/CustomIcons';

const steps = ['Endereço de entrega', 'Detalhes do pagamento', 'Revisar seu pedido'];
function getStepContent(step: number) {
  switch (step) {
    case 0:
      return <AddressForm />;
    case 1:
      return <PaymentForm />;
    case 2:
      return <Review />;
    default:
      throw new Error('Etapa desconhecida');
  }
}
export default function ShoppingCart() {
  const [activeStep, setActiveStep] = React.useState(0);
  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };
  return (
    <Grid
      container
      sx={{
        height: {
          xs: '100%',
          sm: 'calc(100dvh - var(--template-frame-height, 0px))',
        },
        mt: {
          xs: 4,
          sm: 0,
        },
      }}
    >
      <Grid
        size={{ xs: 12, sm: 5, lg: 4 }}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          backgroundColor: 'background.paper',
          borderRight: { sm: 'none', md: '1px solid' },
          borderColor: { sm: 'none', md: 'divider' },
          alignItems: 'start',
          pt: 16,
          px: 10,
          gap: 4,
        }}
      >
        <MozukaiIcon />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            width: '100%',
            maxWidth: 500,
          }}
        >
          <Info totalPrice={activeStep >= 2 ? 'R$144,97' : 'R$134,98'} />
        </Box>
      </Grid>
      <Grid
        size={{ sm: 12, md: 7, lg: 8 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          width: '100%',
          backgroundColor: { xs: 'transparent', sm: 'background.default' },
          alignItems: 'start',
          pt: { xs: 0, sm: 16 },
          px: { xs: 2, sm: 10 },
          gap: { xs: 4, md: 8 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: { sm: 'space-between', md: 'flex-end' },
            alignItems: 'center',
            width: '100%',
            maxWidth: { sm: '100%', md: 600 },
          }}
        >
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexGrow: 1,
            }}
          >
            <Stepper
              id="desktop-stepper"
              activeStep={activeStep}
              sx={{ width: '100%', height: 40 }}
            >
              {steps.map((label) => (
                <Step
                  sx={{ ':first-of-type': { pl: 0 }, ':last-of-type': { pr: 0 } }}
                  key={label}
                >
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Box>
        <Card sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}>
          <CardContent
            sx={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Produtos selecionados
              </Typography>
              <Typography variant="body1">
                {activeStep >= 2 ? 'R$144,97' : 'R$134,98'}
              </Typography>
            </div>
            <InfoMobile totalPrice={activeStep >= 2 ? 'R$144,97' : 'R$134,98'} />
          </CardContent>
        </Card>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            width: '100%',
            maxWidth: { sm: '100%', md: 600 },
            maxHeight: '720px',
            gap: { xs: 5, md: 'none' },
          }}
        >
          <Stepper
            id="mobile-stepper"
            activeStep={activeStep}
            alternativeLabel
            sx={{ display: { sm: 'flex', md: 'none' } }}
          >
            {steps.map((label) => (
              <Step
                sx={{
                  ':first-of-type': { pl: 0 },
                  ':last-of-type': { pr: 0 },
                  '& .MuiStepConnector-root': { top: { xs: 6, sm: 12 } },
                }}
                key={label}
              >
                <StepLabel
                  sx={{ '.MuiStepLabel-labelContainer': { maxWidth: '70px' } }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <Stack spacing={2} useFlexGap>
              <Typography variant="h1">📦</Typography>
              <Typography variant="h5">Obrigado pelo seu pedido!</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Seu número de pedido é
                <strong>&nbsp;#140396</strong>. Enviamos a confirmação do seu pedido por e-mail e avisaremos quando ele for enviado.
              </Typography>
              <Button
                variant="contained"
                sx={{ alignSelf: 'start', width: { xs: '100%', sm: 'auto' } }}
              >
                Ir para meus pedidos
              </Button>
            </Stack>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box
                sx={[
                  {
                    display: 'flex',
                    flexDirection: { xs: 'column-reverse', sm: 'row' },
                    alignItems: 'end',
                    flexGrow: 1,
                    gap: 1,
                    pb: { xs: 12, sm: 0 },
                    mt: { xs: 2, sm: 0 },
                    mb: '60px',
                  },
                  activeStep !== 0
                    ? { justifyContent: 'space-between' }
                    : { justifyContent: 'flex-end' },
                ]}
              >
                {activeStep !== 0 && (
                  <Button
                    startIcon={<ChevronLeftRoundedIcon />}
                    onClick={handleBack}
                    variant="text"
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    Anterior
                  </Button>
                )}
                {activeStep !== 0 && (
                  <Button
                    startIcon={<ChevronLeftRoundedIcon />}
                    onClick={handleBack}
                    variant="outlined"
                    fullWidth
                    sx={{ display: { xs: 'flex', sm: 'none' } }}
                  >
                    Anterior
                  </Button>
                )}
                <Button
                  variant="contained"
                  endIcon={<ChevronRightRoundedIcon />}
                  onClick={handleNext}
                  sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                >
                  {activeStep === steps.length - 1 ? 'Fazer pedido' : 'Próximo'}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
