import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import type { GridRowsProp } from '@mui/x-data-grid';
import { columns, purchasesToGridRows } from '../internals/data/gridData';
import DashboardService from '../../../../services/DashboardService';
import type { Purchase } from '../../../../models/Purchase';

export default function CustomizedDataGrid() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const purchases: Purchase[] = await DashboardService.getPurchases(undefined, 'desc', 0, 1000);
        const gridRows = purchasesToGridRows(purchases);
        setRows(gridRows);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load purchases';
        setError(errorMessage);
        console.error('Error fetching purchases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box sx={{ minWidth: 1000 }}>
        <DataGrid
          autoHeight
          checkboxSelection
          rows={rows}
          columns={columns}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
          }
          initialState={{
            pagination: { paginationModel: { pageSize: 20 } },
          }}
          pageSizeOptions={[10, 20, 50]}
          disableColumnResize
          density="compact"
          slotProps={{
            filterPanel: {
              filterFormProps: {
                logicOperatorInputProps: {
                  variant: 'outlined' as const,
                  size: 'small' as const,
                },
                columnInputProps: {
                  variant: 'outlined' as const,
                  size: 'small' as const,
                  sx: { mt: 'auto' },
                },
                operatorInputProps: {
                  variant: 'outlined' as const,
                  size: 'small' as const,
                  sx: { mt: 'auto' },
                },
                valueInputProps: {
                  InputComponentProps: {
                    variant: 'outlined' as const,
                    size: 'small' as const,
                  },
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
