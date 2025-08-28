"use client";

import React, { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Menu,
} from '@mui/material';
import { config } from '@/config';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Swal from 'sweetalert2';
import Protected from '@/components/Protected';

type Client = {
  id: number;
  name: string;
  address: string;
  tax_identification: string;
  client_type: string;
  tax_regime: string;
  is_resident: boolean;
  is_vat_registered: boolean;
};

type ClientFormData = Omit<Client, 'id'>;

const API_BASE = config.apiBaseUrl;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    address: '',
    tax_identification: '',
    client_type: 'INDIVIDUAL',
    tax_regime: '',
    is_resident: true,
    is_vat_registered: false,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE}/clients/`);
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error('Erreur lors du chargement des clients', err);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des clients',
      });
    }
  };

  const showSuccessAlert = (message: string) => {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: message,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const showErrorAlert = (message: string) => {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: message,
    });
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${API_BASE}/clients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showSuccessAlert('Client créé avec succès');
        fetchClients();
        handleCloseDialog();
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (err) {
      console.error('Erreur lors de la création du client', err);
      showErrorAlert('Erreur lors de la création du client');
    }
  };

  const handleUpdate = async () => {
    if (!editingClient) return;

    try {
      const res = await fetch(`${API_BASE}/clients/${editingClient.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showSuccessAlert('Client modifié avec succès');
        fetchClients();
        handleCloseDialog();
      } else {
        throw new Error('Erreur lors de la modification');
      }
    } catch (err) {
      console.error('Erreur lors de la modification du client', err);
      showErrorAlert('Erreur lors de la modification du client');
    }
  };

  const handleDelete = async (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous vraiment supprimer le client "${client.name}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE}/clients/${clientId}/`, {
          method: 'DELETE',
        });

        if (res.ok) {
          showSuccessAlert('Client supprimé avec succès');
          fetchClients();
        } else {
          throw new Error('Erreur lors de la suppression');
        }
      } catch (err) {
        console.error('Erreur lors de la suppression du client', err);
        showErrorAlert('Erreur lors de la suppression du client');
      }
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      address: '',
      tax_identification: '',
      client_type: 'INDIVIDUAL',
      tax_regime: '',
      is_resident: true,
      is_vat_registered: false,
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      address: client.address,
      tax_identification: client.tax_identification,
      client_type: client.client_type,
      tax_regime: client.tax_regime,
      is_resident: client.is_resident,
      is_vat_registered: client.is_vat_registered,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClient(null);
  };

  const handleSubmit = () => {
    if (editingClient) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, clientId: number) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedClientId(clientId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClientId(null);
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.tax_identification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Protected allowedRoles={['admin', 'manager']}>
    <Box p={4}>
      <Stack spacing={3}>
        <Typography variant="h4">Clients</Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <TextField
            size="small"
            placeholder="Rechercher par nom, matricule, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: '300px' }}
          />

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none' }}
            onClick={handleOpenCreateDialog}
          >
            Ajouter Client
          </Button>
        </Stack>

        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Matricule Fiscal</TableCell>
                <TableCell>Régime Fiscal</TableCell>
                <TableCell>Résident</TableCell>
                <TableCell>TVA</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{getClientTypeLabel(client.client_type)}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell>{client.tax_identification || '-'}</TableCell>
                  <TableCell>{getTaxRegimeLabel(client.tax_regime)}</TableCell>
                  <TableCell>{client.is_resident ? 'Oui' : 'Non'}</TableCell>
                  <TableCell>{client.is_vat_registered ? 'Oui' : 'Non'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, client.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const client = clients.find(c => c.id === selectedClientId);
          if (client) {
            handleOpenEditDialog(client);
          }
          handleMenuClose();
        }}>
          Modifier
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedClientId) {
            handleDelete(selectedClientId);
          }
          handleMenuClose();
        }}>
          Supprimer
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingClient ? 'Modifier le client' : 'Ajouter un nouveau client'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nom"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Adresse"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              fullWidth
              multiline
              rows={3}
            />

            <TextField
              label="Matricule Fiscal"
              value={formData.tax_identification}
              onChange={(e) => handleInputChange('tax_identification', e.target.value)}
              fullWidth
            />

            <TextField
              label="Type de client"
              value={formData.client_type}
              onChange={(e) => handleInputChange('client_type', e.target.value)}
              fullWidth
              select
            >
              <MenuItem value="INDIVIDUAL">Particulier</MenuItem>
              <MenuItem value="COMPANY">Entreprise</MenuItem>
              <MenuItem value="GOVERNMENT">État/Collectivité locale</MenuItem>
              <MenuItem value="PUBLIC_ENTITY">Organisme public</MenuItem>
              <MenuItem value="NON_RESIDENT">Non-résident</MenuItem>
            </TextField>

            <TextField
              label="Régime Fiscal"
              value={formData.tax_regime}
              onChange={(e) => handleInputChange('tax_regime', e.target.value)}
              fullWidth
              select
            >
              <MenuItem value="">-</MenuItem>
              <MenuItem value="REAL">Régime réel</MenuItem>
              <MenuItem value="SIMPLIFIED">Régime simplifié</MenuItem>
              <MenuItem value="EXEMPT">Exonéré</MenuItem>
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_resident}
                  onChange={(e) => handleInputChange('is_resident', e.target.checked)}
                />
              }
              label="Résident"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_vat_registered}
                  onChange={(e) => handleInputChange('is_vat_registered', e.target.checked)}
                />
              }
              label="Assujetti à la TVA"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClient ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Protected>
  );
}

// Helpers to show readable labels
function getClientTypeLabel(type: string): string {
  switch (type) {
    case 'INDIVIDUAL':
      return 'Particulier';
    case 'COMPANY':
      return 'Entreprise';
    case 'GOVERNMENT':
      return 'État/Collectivité locale';
    case 'PUBLIC_ENTITY':
      return 'Organisme public';
    case 'NON_RESIDENT':
      return 'Non-résident';
    default:
      return type;
  }
}

function getTaxRegimeLabel(regime: string): string {
  switch (regime) {
    case 'REAL':
      return 'Régime réel';
    case 'SIMPLIFIED':
      return 'Régime simplifié';
    case 'EXEMPT':
      return 'Exonéré';
    default:
      return '-';
  }
}
