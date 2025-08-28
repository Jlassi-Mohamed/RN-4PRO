"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Stack,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  InputAdornment,
  Paper,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import { config } from "@/config";
import Swal from "sweetalert2";
import Protected from "@/components/Protected";

type Fournisseur = {
  id: number;
  nom: string;
  matricule_fiscal: string;
  adresse: string;
  telephone: string;
  email: string;
};

export default function FournisseursPage(): React.JSX.Element {
  const API_BASE = config.apiBaseUrl;

  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFournisseurId, setSelectedFournisseurId] = useState<number | null>(null);

  const [nom, setNom] = useState("");
  const [matriculeFiscal, setMatriculeFiscal] = useState("");
  const [adresse, setAdresse] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const showSuccessAlert = (message: string) => {
    Swal.fire({
      icon: "success",
      title: "Succès",
      text: message,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const showErrorAlert = (message: string) => {
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: message,
    });
  };

  const showConfirmDialog = async (title: string, text: string): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });
    return result.isConfirmed;
  };

  const fetchFournisseurs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/fournisseurs/`);
      if (!res.ok) throw new Error("Failed to fetch fournisseurs");
      const data = await res.json();
      setFournisseurs(data);
    } catch (error) {
      showErrorAlert("Erreur lors du chargement des fournisseurs");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const resetForm = () => {
    setNom("");
    setMatriculeFiscal("");
    setAdresse("");
    setEmail("");
    setTelephone("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fournisseurData = {
      nom,
      matricule_fiscal: matriculeFiscal,
      adresse,
      email,
      telephone,
    };

    try {
      const url = editingId
        ? `${API_BASE}/fournisseurs/${editingId}/`
        : `${API_BASE}/fournisseurs/`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fournisseurData),
      });

      if (!res.ok) throw new Error("Échec de la soumission");

      await fetchFournisseurs();
      handleCloseDialog();
      showSuccessAlert(
        editingId
          ? "Fournisseur modifié avec succès"
          : "Fournisseur ajouté avec succès"
      );
    } catch (error) {
      showErrorAlert("Erreur lors de l'enregistrement du fournisseur");
    }
  };

  const handleEdit = (f: Fournisseur) => {
    setNom(f.nom);
    setMatriculeFiscal(f.matricule_fiscal);
    setAdresse(f.adresse);
    setEmail(f.email);
    setTelephone(f.telephone);
    setEditingId(f.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmDialog(
      "Êtes-vous sûr ?",
      "Voulez-vous vraiment supprimer ce fournisseur ? Cette action est irréversible."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/fournisseurs/${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete fournisseur");
      fetchFournisseurs();
      showSuccessAlert("Fournisseur supprimé avec succès");
    } catch (error) {
      showErrorAlert("Erreur lors de la suppression");
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    resetForm();
    setDialogOpen(false);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, id: number) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFournisseurId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFournisseurId(null);
  };

  // Enhanced multi-field search filter
  const filteredFournisseurs = fournisseurs.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      f.nom.toLowerCase().includes(term) ||
      f.matricule_fiscal.toLowerCase().includes(term) ||
      f.adresse.toLowerCase().includes(term) ||
      f.email.toLowerCase().includes(term) ||
      f.telephone.toLowerCase().includes(term)
    );
  });

  return (
    <Protected allowedRoles={['admin', 'manager', 'stock']}>
    <Stack spacing={3} padding={3}>
      <Typography variant="h4" gutterBottom>
        Fournisseurs
      </Typography>

      <Button variant="contained" onClick={handleOpenDialog} sx={{ mb: 2, alignSelf: "flex-start" }}>
        Ajouter un fournisseur
      </Button>

      {/* Search Bar with better design */}
      <Paper
        component="form"
        sx={{
          p: "2px 8px",
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: 480,
          mb: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
        onSubmit={(e) => e.preventDefault()} // prevent submit refresh
      >
        <InputAdornment position="start" sx={{ mr: 1 }}>
          <SearchIcon color="action" />
        </InputAdornment>
        <TextField
          variant="standard"
          placeholder="Rechercher par nom, matricule, adresse, email ou téléphone"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ disableUnderline: true }}
          sx={{ fontSize: 16 }}
          aria-label="Rechercher fournisseurs"
        />
      </Paper>

      {loading ? (
        <Stack alignItems="center" mt={4}>
          <CircularProgress />
          <Typography mt={1}>Chargement...</Typography>
        </Stack>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Matricule Fiscal</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFournisseurs.length > 0 ? (
              filteredFournisseurs.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>{f.nom}</TableCell>
                  <TableCell>{f.matricule_fiscal}</TableCell>
                  <TableCell>{f.adresse}</TableCell>
                  <TableCell>{f.email}</TableCell>
                  <TableCell>{f.telephone}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, f.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  Aucun fournisseur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const fournisseur = fournisseurs.find(f => f.id === selectedFournisseurId);
          if (fournisseur) {
            handleEdit(fournisseur);
          }
          handleMenuClose();
        }}>
          Modifier
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedFournisseurId) {
            handleDelete(selectedFournisseurId);
          }
          handleMenuClose();
        }}>
          Supprimer
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ position: "relative", pr: 5 }}>
          {editingId ? "Modifier Fournisseur" : "Ajouter Fournisseur"}
          <Button
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              minWidth: "32px",
              minHeight: "32px",
              fontSize: "20px",
              padding: 0,
              lineHeight: 1,
              color: "#888",
            }}
          >
            ×
          </Button>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
              <TextField
                label="Matricule Fiscal"
                value={matriculeFiscal}
                onChange={(e) => setMatriculeFiscal(e.target.value)}
                required
              />
              <TextField label="Adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} required />
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
              <TextField
                label="Téléphone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                required
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained">
              {editingId ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
    </Protected>
  );
}
