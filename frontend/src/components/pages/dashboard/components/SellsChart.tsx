import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { LineChart } from '@mui/x-charts/LineChart';
import { useEffect, useState } from 'react';
import DashboardService from '../../../../services/DashboardService';
import type { Purchase } from '../../../../models/Purchase';

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

interface DailySales {
  date: string;
  paid: number;
  pending: number;
  processing: number;
  total: number;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function getLast30Days(): string[] {
  const days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(formatDate(date));
  }
  
  return days;
}

function groupPurchasesByDate(purchases: Purchase[]): Map<string, DailySales> {
  const grouped = new Map<string, DailySales>();
  
  // Initialize all days with zero values
  const last30Days = getLast30Days();
  last30Days.forEach(day => {
    grouped.set(day, {
      date: day,
      paid: 0,
      pending: 0,
      processing: 0,
      total: 0
    });
  });
  
  // Group purchases by date
  purchases.forEach(purchase => {
    const purchaseDate = new Date(purchase.date);
    const dateKey = formatDate(purchaseDate);
    
    if (grouped.has(dateKey)) {
      const current = grouped.get(dateKey)!;
      current.total += 1;
      
      // Count by status
      if (purchase.status === 'paid' || purchase.status === 'delivered') {
        current.paid += 1;
      } else if (purchase.status === 'pending') {
        current.pending += 1;
      } else if (purchase.status === 'processing' || purchase.status === 'shipped') {
        current.processing += 1;
      }
    }
  });
  
  return grouped;
}

export default function SellsChart() {
  const theme = useTheme();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<DailySales[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [growthPercentage, setGrowthPercentage] = useState(0);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        // Fetch more purchases to get last 30 days data
        const data = await DashboardService.getPurchases(undefined, 'desc', 0, 1000);
        
        // Filter purchases from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentPurchases = data.filter(purchase => 
          new Date(purchase.date) >= thirtyDaysAgo
        );
        
        setPurchases(recentPurchases);
        
        // Process data for chart
        const grouped = groupPurchasesByDate(recentPurchases);
        const chartData = Array.from(grouped.values());
        setSalesData(chartData);
        
        // Calculate total sales and growth
        const total = recentPurchases.length;
        setTotalSales(total);
        
        // Calculate growth (compare last 15 days vs previous 15 days)
        const last15Days = chartData.slice(-15);
        const previous15Days = chartData.slice(-30, -15);
        
        const last15Total = last15Days.reduce((sum, day) => sum + day.total, 0);
        const previous15Total = previous15Days.reduce((sum, day) => sum + day.total, 0);
        
        if (previous15Total > 0) {
          const growth = ((last15Total - previous15Total) / previous15Total) * 100;
          setGrowthPercentage(Math.round(growth));
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load sales data';
        setError(errorMessage);
        console.error('Error fetching purchases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const colorPalette = [
    theme.palette.success.light,  // Paid/Delivered
    theme.palette.warning.light,  // Pending
    theme.palette.info.light,     // Processing/Shipped
  ];

  if (loading) {
    return (
      <Card variant="outlined" sx={{ width: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ width: '100%' }}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Vendas (Últimos 30 dias)
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {totalSales.toLocaleString()}
            </Typography>
            <Chip 
              size="small" 
              color={growthPercentage >= 0 ? "success" : "error"} 
              label={`${growthPercentage >= 0 ? '+' : ''}${growthPercentage}%`} 
            />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Vendas por dia nos últimos 30 dias
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'point',
              data: salesData.map(item => item.date),
              tickInterval: (i) => (i + 1) % 5 === 0,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={[
            {
              id: 'paid',
              label: 'Pagas',
              showMark: false,
              curve: 'linear',
              stack: 'total',
              area: true,
              stackOrder: 'ascending',
              data: salesData.map(item => item.paid),
            },
            {
              id: 'processing',
              label: 'Processando',
              showMark: false,
              curve: 'linear',
              stack: 'total',
              area: true,
              stackOrder: 'ascending',
              data: salesData.map(item => item.processing),
            },
            {
              id: 'pending',
              label: 'Pendentes',
              showMark: false,
              curve: 'linear',
              stack: 'total',
              area: true,
              stackOrder: 'ascending',
              data: salesData.map(item => item.pending),
            },
          ]}
          height={250}
          margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-series-paid': {
              fill: "url('#paid')",
            },
            '& .MuiAreaElement-series-processing': {
              fill: "url('#processing')",
            },
            '& .MuiAreaElement-series-pending': {
              fill: "url('#pending')",
            },
          }}
          hideLegend
        >
          <AreaGradient color={theme.palette.success.light} id="paid" />
          <AreaGradient color={theme.palette.info.light} id="processing" />
          <AreaGradient color={theme.palette.warning.light} id="pending" />
        </LineChart>
      </CardContent>
    </Card>
  );
}