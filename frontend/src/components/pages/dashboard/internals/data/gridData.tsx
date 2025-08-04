import Chip from '@mui/material/Chip';
import type { GridRowsProp, GridColDef } from '@mui/x-data-grid';
import type { Purchase } from '../../../../../models/Purchase';

function renderStatus(status: Purchase['status']) {
  const colors: { [key in Purchase['status']]: 'success' | 'warning' | 'info' | 'error' | 'default' } = {
    pending: 'warning',
    paid: 'success',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    canceled: 'error',
    refunded: 'warning',
    failed: 'error',
  };

  const labels: { [key in Purchase['status']]: string } = {
    pending: 'Pendente',
    paid: 'Pago',
    processing: 'Processando',
    shipped: 'Enviado',
    delivered: 'Entregue',
    canceled: 'Cancelado',
    refunded: 'Reembolsado',
    failed: 'Falhou',
  };

  return <Chip label={labels[status]} color={colors[status]} size="small" />;
}

export const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 80,
    type: 'number'
  },
  {
    field: 'name',
    headerName: 'Nome',
    flex: 1.5,
    minWidth: 150,
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1.5,
    minWidth: 200,
  },
  {
    field: 'product_id',
    headerName: 'Produto ID',
    width: 100,
    type: 'number',
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => renderStatus(params.value as Purchase['status']),
  },
  {
    field: 'city',
    headerName: 'Cidade',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'state',
    headerName: 'Estado',
    width: 80,
  },
  {
    field: 'cep',
    headerName: 'CEP',
    width: 100,
    type: 'number',
    valueFormatter: (value: number | null) => {
      if (value == null) return '';
      const cep = value.toString().padStart(8, '0');
      return `${cep.slice(0, 5)}-${cep.slice(5)}`;
    },
  },
  {
    field: 'date',
    headerName: 'Data',
    width: 120,
    type: 'date',
    valueFormatter: (value: string | Date | null) => {
      if (value == null) return '';
      const date = new Date(value);
      return date.toLocaleDateString('pt-BR');
    },
  },
];

// Function to convert Purchase objects to Grid rows
export function purchasesToGridRows(purchases: Purchase[]): GridRowsProp {
  return purchases.map(purchase => ({
    id: purchase.id,
    name: purchase.name,
    email: purchase.email,
    product_id: purchase.product_id,
    status: purchase.status,
    city: purchase.city,
    state: purchase.state,
    cep: purchase.cep,
    date: purchase.date,
    address: purchase.address,
    complement: purchase.complement,
  }));
}

// Empty rows array - this will be populated by the component
export const rows: GridRowsProp = [];
