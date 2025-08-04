import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomizedDataGrid from './CustomizedDataGrid';
import HighlightedCard from './HighlightedCard';
import StatCard from './StatCard';
import SellsChart from './SellsChart';
import DashboardService from '../../../../services/DashboardService';
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface StatData {
  title: string;
  value: string | number;
  error?: boolean;
}

export default function MainGrid() {
  const [stats, setStats] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results = await Promise.allSettled([
          DashboardService.getUserCount(),
          DashboardService.getPurchaseCount(),
          DashboardService.getProductCount()
        ]);

        const [userResult, purchaseResult, productResult] = results;

        const newStats: StatData[] = [
          {
            title: 'Clientes',
            value: userResult.status === 'fulfilled' 
              ? userResult.value.toLocaleString() 
              : 'Error',
            error: userResult.status === 'rejected'
          },
          {
            title: 'Vendas',
            value: purchaseResult.status === 'fulfilled' 
              ? purchaseResult.value.toLocaleString() 
              : 'Error',
            error: purchaseResult.status === 'rejected'
          },
          {
            title: 'Produtos',
            value: productResult.status === 'fulfilled' 
              ? productResult.value.toLocaleString() 
              : 'Error',
            error: productResult.status === 'rejected'
          }
        ];

        setStats(newStats);

        // Log individual errors for debugging
        if (userResult.status === 'rejected') {
          console.error('User count error:', userResult.reason);
        }
        if (purchaseResult.status === 'rejected') {
          console.error('Purchase count error:', purchaseResult.reason);
        }
        if (productResult.status === 'rejected') {
          console.error('Product count error:', productResult.reason);
        }

        // Set a general error message if any critical services failed
        const hasAuthError = [userResult, purchaseResult, productResult].some(
          result => result.status === 'rejected' && 
                   result.reason?.message?.includes('Authentication required')
        );

        if (hasAuthError) {
          setError('Authentication required. Please log in again.');
        } else {
          const failedServices = [userResult, purchaseResult, productResult]
            .filter(result => result.status === 'rejected').length;
          
          if (failedServices > 0) {
            setError(`${failedServices} of 3 services failed to load. Some data may be unavailable.`);
          }
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
        setError(errorMessage);
        console.error('Unexpected error in fetchStats:', err);
        
        // Set fallback stats
        setStats([
          { title: 'Clientes', value: 'Error', error: true },
          { title: 'Vendas', value: 'Error', error: true },
          { title: 'Produtos', value: 'Error', error: true }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Resumo
      </Typography>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {stats.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <SellsChart />
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Compras
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ justifyContent: 'center' }}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <CustomizedDataGrid />
        </Grid>
      </Grid>
    </Box>
  );
}