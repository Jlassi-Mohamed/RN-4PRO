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
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import { config } from "@/config";
import Swal from "sweetalert2";

type Tool = {
  id: number;
  name: string;
  type: string;
  description: string;
  supplier: string;
  purchase_date: string;
  quantity: number;
  condition: string;
  location: string;
  last_maintenance: string;
};

export default function ToolsPage(): React.JSX.Element {
  const API_BASE = config.apiBaseUrl;

  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [supplier, setSupplier] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState("good");
  const [location, setLocation] = useState("");
  const [lastMaintenance, setLastMaintenance] = useState("");

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

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tools/`);
      if (!res.ok) throw new Error("Failed to fetch tools");
      const data = await res.json();
      setTools(data);
    } catch (error) {
      showErrorAlert("Erreur lors du chargement des outils");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const resetForm = () => {
    setName("");
    setType("");
    setDescription("");
    setSupplier("");
    setPurchaseDate("");
    setQuantity("1");
    setCondition("good");
    setLocation("");
    setLastMaintenance("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toolData = {
      name,
      type,
      description,
      supplier,
      purchase_date: purchaseDate || null,
      quantity: parseInt(quantity),
      condition,
      location,
      last_maintenance: lastMaintenance || null,
    };

    try {
      const url = editingId
        ? `${API_BASE}/tools/${editingId}/`
        : `${API_BASE}/tools/`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toolData),
      });

      if (!res.ok) throw new Error("Échec de la soumission");

      await fetchTools();
      handleCloseDialog();
      showSuccessAlert(
        editingId
          ? "Outil modifié avec succès"
          : "Outil ajouté avec succès"
      );
    } catch (error) {
      showErrorAlert("Erreur lors de l'enregistrement de l'outil");
    }
  };

  const handleEdit = (t: Tool) => {
    setName(t.name);
    setType(t.type || "");
    setDescription(t.description || "");
    setSupplier(t.supplier || "");
    setPurchaseDate(t.purchase_date || "");
    setQuantity(t.quantity.toString());
    setCondition(t.condition);
    setLocation(t.location || "");
    setLastMaintenance(t.last_maintenance || "");
    setEditingId(t.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmDialog(
      "Êtes-vous sûr ?",
      "Voulez-vous vraiment supprimer cet outil ? Cette action est irréversible."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/tools/${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete tool");
      fetchTools();
      showSuccessAlert("Outil supprimé avec succès");
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
    setSelectedToolId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedToolId(null);
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case "good": return "Bon état";
      case "repair": return "Besoin de réparation";
      case "broken": return "Cassé";
      default: return condition;
    }
  };

  // Enhanced multi-field search filter
  const filteredTools = tools.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.type?.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term) ||
      t.supplier?.toLowerCase().includes(term) ||
      t.location?.toLowerCase().includes(term)
    );
  });

  return (
    <Stack spacing={3} padding={3}>
      <Typography variant="h4" gutterBottom>
        Gestion des Outils
      </Typography>

      <Button variant="contained" onClick={handleOpenDialog} sx={{ mb: 2, alignSelf: "flex-start" }}>
        Ajouter un outil
      </Button>

      {/* Search Bar */}
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
        onSubmit={(e) => e.preventDefault()}
      >
        <InputAdornment position="start" sx={{ mr: 1 }}>
          <SearchIcon color="action" />
        </InputAdornment>
        <TextField
          variant="standard"
          placeholder="Rechercher par nom, type, description, fournisseur ou emplacement"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ disableUnderline: true }}
          sx={{ fontSize: 16 }}
          aria-label="Rechercher outils"
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
              <TableCell>Type</TableCell>
              <TableCell>Fournisseur</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>État</TableCell>
              <TableCell>Emplacement</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTools.length > 0 ? (
              filteredTools.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.type || "-"}</TableCell>
                  <TableCell>{t.supplier || "-"}</TableCell>
                  <TableCell>{t.quantity}</TableCell>
                  <TableCell>{getConditionLabel(t.condition)}</TableCell>
                  <TableCell>{t.location || "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, t.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  Aucun outil trouvé.
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
          const tool = tools.find(t => t.id === selectedToolId);
          if (tool) {
            handleEdit(tool);
          }
          handleMenuClose();
        }}>
          Modifier
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedToolId) {
            handleDelete(selectedToolId);
          }
          handleMenuClose();
        }}>
          Supprimer
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: "relative", pr: 5 }}>
          {editingId ? "Modifier l'outil" : "Ajouter un outil"}
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
            <Stack spacing={2} mt={1}>
              <TextField
                label="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                fullWidth
              />

              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                label="Fournisseur"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                fullWidth
              />

              <TextField
                label="Date d'achat"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label="Quantité"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                inputProps={{ min: 1 }}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>État</InputLabel>
                <Select
                  value={condition}
                  label="État"
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <MenuItem value="good">Bon état</MenuItem>
                  <MenuItem value="repair">Besoin de réparation</MenuItem>
                  <MenuItem value="broken">Cassé</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Emplacement"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                fullWidth
              />

              <TextField
                label="Dernière maintenance"
                type="date"
                value={lastMaintenance}
                onChange={(e) => setLastMaintenance(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
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
  );
}
