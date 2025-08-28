"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

const statusMap = {
  brouillon: { label: 'Brouillon', color: 'default' },
  livré: { label: 'Livré', color: 'success' },
  annulé: { label: 'Annulé', color: 'error' },
  confirmé: { label: 'Confirmé', color: 'info' },
  payé: { label: 'Payé', color: 'success' },
} as const;

export interface Order {
  id: string;
  customer: { name: string };
  amount: number;
  status: 'brouillon' | 'livré' | 'annulé' | 'confirmé' | 'payé';
  createdAt: Date;
}

export interface LatestOrdersProps {
  orders?: Order[];
  sx?: SxProps;
}

export function LatestOrders({ orders = [], sx }: LatestOrdersProps): React.JSX.Element {
  const router = useRouter();

  const handleViewAll = (): void => {
    router.push('/dashboard/devis');
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Dernières commandes" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Commande</TableCell>
              <TableCell>Client</TableCell>
              <TableCell sortDirection="desc">Date</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const { label, color } = statusMap[order.status] ?? { label: 'Inconnu', color: 'default' };

              return (
                <TableRow hover key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>{dayjs(order.createdAt).format('D MMM YYYY')}</TableCell>
                  <TableCell>
                    <Chip color={color} label={label} size="small" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
          onClick={handleViewAll}
        >
          Voir tout
        </Button>
      </CardActions>
    </Card>
  );
}
