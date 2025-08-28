"use client";

import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Menu,
  MenuItem,
  TablePagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Box,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import Swal from "sweetalert2";
import { config } from "@/config";

const API_BASE = `${config.apiBaseUrl}/stock`;

type Fournisseur = {
  id: number;
  nom: string;
};

type Document = {
  id: number;
  ref: string;
  date: string;
  description: string;
  fournisseur: Fournisseur | null;
  type: "BON" | "FACTURE";
  articles: Article[];
};

type Article = {
  id: number;
  code: string;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  description: string;
  document: number;
};

type Filters = {
  type: "BON" | "FACTURE" | "both";
  ref: string;
  fournisseur: string;
  dateFrom: string;
  dateTo: string;
};

export default function StockPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [articlesViewDialogOpen, setArticlesViewDialogOpen] = useState(false);

  // Selected items
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<"BON" | "FACTURE">("BON");

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Form states
  const [documentForm, setDocumentForm] = useState({
    ref: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    fournisseur: "",
    type: "BON" as "BON" | "FACTURE",
  });

  const [articleForm, setArticleForm] = useState({
    code: "",
    designation: "",
    quantite: 1,
    prix_unitaire: 0,
    description: "",
    document: "",
  });

  const [filters, setFilters] = useState<Filters>({
    type: "both",
    ref: "",
    fournisseur: "",
    dateFrom: "",
    dateTo: "",
  });

  // Menu state for actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<{ id: number; type: "BON" | "FACTURE" } | null>(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    fetchData();
    fetchFournisseurs();
  }, []);

  useEffect(() => {
    applyFilters(filters);
  }, [documents, filters]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/documents/`);
      if (!res.ok) throw new Error("Erreur chargement des documents");
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des données',
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchFournisseurs() {
    try {
      const res = await fetch(`${config.apiBaseUrl}/fournisseurs/`);
      if (!res.ok) throw new Error("Erreur chargement fournisseurs");
      const data = await res.json();
      setFournisseurs(data);
    } catch (error) {
      console.error("Error fetching fournisseurs:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des fournisseurs',
      });
    }
  }

  function applyFilters(filterValues: Filters) {
    const { ref, type, fournisseur, dateFrom, dateTo } = filterValues;

    const filterItems = (items: Document[]) => {
      return items.filter((item) => {
        if (ref && !item.ref.toLowerCase().includes(ref.toLowerCase())) return false;

        // FIXED: Proper null check for fournisseur
        if (fournisseur) {
          if (!item.fournisseur) return false;
          if (item.fournisseur.id.toString() !== fournisseur) return false;
        }

        if (type !== "both" && item.type !== type) return false;

        const itemDate = new Date(item.date).getTime();
        if (dateFrom && itemDate < new Date(dateFrom).getTime()) return false;
        if (dateTo && itemDate > new Date(dateTo).getTime()) return false;

        return true;
      });
    };

    const filtered = filterItems(documents);
    setFilteredDocuments(filtered);
  }

  async function handleViewArticles(document: Document) {
    try {
      const res = await fetch(`${API_BASE}/documents/${document.id}/`);
      if (!res.ok) throw new Error("Erreur chargement articles");
      const data = await res.json();
      setSelectedArticles(data.articles || []);
      setArticlesViewDialogOpen(true);
    } catch (error) {
      console.error("Error viewing articles:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des articles',
      });
    }
  }

  async function handleDeleteDocument(id: number) {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous ne pourrez pas annuler cette action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/documents/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      await fetchData();

      Swal.fire({
        icon: 'success',
        title: 'Supprimé!',
        text: 'Le document a été supprimé avec succès',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la suppression du document',
      });
    }
  }

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number,
    type: "BON" | "FACTURE"
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuItem({ id, type });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  const openAddDocumentDialog = (type: "BON" | "FACTURE") => {
    setSelectedDocumentType(type);
    setDocumentForm({
      ref: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      fournisseur: "",
      type: type,
    });
    setSelectedDocument(null);
    setDocumentDialogOpen(true);
  };

  // FIXED: Added missing arrow function syntax
  const openEditDocumentDialog = (document: Document) => {
    setSelectedDocument(document);
    setDocumentForm({
      ref: document.ref,
      date: document.date,
      description: document.description || "",
      fournisseur: document.fournisseur?.id?.toString() || "",
      type: document.type,
    });
    setDocumentDialogOpen(true);
  };

  const openAddArticleDialog = (documentId?: number) => {
    setArticleForm({
      code: "",
      designation: "",
      quantite: 1,
      prix_unitaire: 0,
      description: "",
      document: documentId?.toString() || (documents.length > 0 ? documents[0].id.toString() : ""),
    });
    setArticleDialogOpen(true);
  };

const handleSaveDocument = async () => {
  try {
    const method = selectedDocument ? "PUT" : "POST";
    const url = selectedDocument
      ? `${API_BASE}/documents/${selectedDocument.id}/`
      : `${API_BASE}/documents/`;

    // Send only the fournisseur ID (or null) as per backend expectation
    const fournisseurId = documentForm.fournisseur ? parseInt(documentForm.fournisseur) : null;

    const body = JSON.stringify({
      ref: documentForm.ref,
      date: documentForm.date,
      description: documentForm.description,
      fournisseur_id: fournisseurId, // Use fournisseur_id for write operations
      type: documentForm.type,
    });

    console.log("Saving document:", body);

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Server error:", errorData);
      throw new Error(errorData.message || "Erreur serveur");
    }

    setDocumentDialogOpen(false);
    await fetchData();

    Swal.fire({
      icon: 'success',
      title: 'Succès!',
      text: selectedDocument ? 'Document modifié avec succès' : 'Document ajouté avec succès',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error: any) {
    console.error("Error saving document:", error);
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: error.message || 'Erreur lors de la sauvegarde du document',
    });
  }
};

const handleSaveArticle = async () => {
  try {
    const documentId = parseInt(articleForm.document);
    if (isNaN(documentId)) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez sélectionner un document valide',
      });
      return;
    }

    const body = JSON.stringify({
      code: articleForm.code,
      designation: articleForm.designation,
      quantite: articleForm.quantite,
      prix_unitaire: articleForm.prix_unitaire,
      description: articleForm.description,
      document: documentId, // Changed from document_id to document
    });

    console.log("Saving article:", body);

    const res = await fetch(`${API_BASE}/articles/`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Server error:", errorData);
      throw new Error(errorData.message || "Erreur serveur");
    }

    setArticleDialogOpen(false);
    await fetchData();

    Swal.fire({
      icon: 'success',
      title: 'Succès!',
      text: 'Article ajouté avec succès',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error: any) {
    console.error("Error saving article:", error);
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: error.message || 'Erreur lors de l\'ajout de l\'article',
    });
  }
};

  const handleApplyFilters = (filterValues: Filters) => {
    setFilters(filterValues);
    setFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      type: "both",
      ref: "",
      fournisseur: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Stack spacing={4} maxWidth={1200} margin="auto" px={2} py={4}>
        <Typography variant="h4" mb={2}>
          Gestion de Stock
        </Typography>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} flexWrap="wrap" mb={3}>
          <Button variant="contained" onClick={() => openAddDocumentDialog("BON")}>
            Ajouter Bon de Livraison
          </Button>
          <Button variant="contained" onClick={() => openAddDocumentDialog("FACTURE")}>
            Ajouter Facture
          </Button>
          <Button variant="contained" onClick={() => openAddArticleDialog()}>
            Ajouter un Article
          </Button>
          <Button variant="outlined" onClick={() => setFilterDialogOpen(true)}>
            Filtrer
          </Button>
          {(filters.ref || filters.fournisseur || filters.dateFrom || filters.dateTo || filters.type !== "both") && (
            <Button variant="outlined" color="secondary" onClick={handleResetFilters}>
              Réinitialiser Filtres
            </Button>
          )}
        </Stack>

        {/* Active Filters Display */}
        {(filters.ref || filters.fournisseur || filters.dateFrom || filters.dateTo || filters.type !== "both") && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Filtres actifs:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {filters.type !== "both" && (
                <Chip
                  label={`Type: ${filters.type === "BON" ? "Bon de livraison" : "Facture"}`}
                  onDelete={() => setFilters({...filters, type: "both"})}
                />
              )}
              {filters.ref && (
                <Chip
                  label={`Référence: ${filters.ref}`}
                  onDelete={() => setFilters({...filters, ref: ""})}
                />
              )}
              {filters.fournisseur && (
                <Chip
                  label={`Fournisseur: ${fournisseurs.find(f => f.id.toString() === filters.fournisseur)?.nom}`}
                  onDelete={() => setFilters({...filters, fournisseur: ""})}
                />
              )}
              {filters.dateFrom && (
                <Chip
                  label={`À partir du: ${new Date(filters.dateFrom).toLocaleDateString()}`}
                  onDelete={() => setFilters({...filters, dateFrom: ""})}
                />
              )}
              {filters.dateTo && (
                <Chip
                  label={`Jusqu'au: ${new Date(filters.dateTo).toLocaleDateString()}`}
                  onDelete={() => setFilters({...filters, dateTo: ""})}
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Stack alignItems="center" mb={3}>
            <CircularProgress />
          </Stack>
        )}

        {/* Documents Table */}
        <Typography variant="h5">Documents</Typography>
        <Table size="small" sx={{ mb: 4 }}>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Référence</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Fournisseur</TableCell>
              <TableCell>Articles</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((document) => (
                <TableRow key={document.id} hover>
                  <TableCell>
                    <Chip
                      label={document.type === "BON" ? "Bon" : "Facture"}
                      color={document.type === "BON" ? "primary" : "secondary"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{document.ref}</TableCell>
                  <TableCell>{new Date(document.date).toLocaleDateString()}</TableCell>
                  <TableCell>{document.description || "—"}</TableCell>
                  <TableCell>{document.fournisseur?.nom || "Aucun"}</TableCell>
                  <TableCell>
                    {document.articles?.length || 0}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, document.id, document.type)}
                      aria-label="actions"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {filteredDocuments.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun document à afficher
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDocuments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />

        {/* Actions Menu */}
        <Menu
          id="actions-menu"
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem
            onClick={() => {
              if (!menuItem) return;
              const document = documents.find(d => d.id === menuItem.id);
              if (document) {
                handleViewArticles(document);
              }
              handleMenuClose();
            }}
          >
            Voir les articles
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (!menuItem) return;
              const document = documents.find(d => d.id === menuItem.id);
              if (document) {
                openAddArticleDialog(document.id);
              }
              handleMenuClose();
            }}
          >
            Ajouter un article
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (!menuItem) return;
              const document = documents.find(d => d.id === menuItem.id);
              if (document) {
                openEditDocumentDialog(document);
              }
              handleMenuClose();
            }}
          >
            Modifier
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (!menuItem) return;
              handleDeleteDocument(menuItem.id);
              handleMenuClose();
            }}
          >
            Supprimer
          </MenuItem>
        </Menu>

        {/* Document Dialog */}
        <Dialog open={documentDialogOpen} onClose={() => setDocumentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedDocument ? "Modifier le document" : selectedDocumentType === "BON" ? "Ajouter un bon de livraison" : "Ajouter une facture"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Référence"
                value={documentForm.ref}
                onChange={(e) => setDocumentForm({...documentForm, ref: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Date"
                type="date"
                value={documentForm.date}
                onChange={(e) => setDocumentForm({...documentForm, date: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <FormControl fullWidth>
                <InputLabel>Fournisseur</InputLabel>
                <Select
                  value={documentForm.fournisseur}
                  label="Fournisseur"
                  onChange={(e) => setDocumentForm({...documentForm, fournisseur: e.target.value})}
                >
                  <MenuItem value="">Aucun fournisseur</MenuItem>
                  {fournisseurs.map((fournisseur) => (
                    <MenuItem key={fournisseur.id} value={fournisseur.id.toString()}>
                      {fournisseur.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Description"
                value={documentForm.description}
                onChange={(e) => setDocumentForm({...documentForm, description: e.target.value})}
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDocumentDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveDocument} variant="contained" disabled={!documentForm.ref || !documentForm.date}>
              {selectedDocument ? "Modifier" : "Ajouter"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Article Dialog */}
        <Dialog open={articleDialogOpen} onClose={() => setArticleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Ajouter un article</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <FormControl fullWidth required>
                <InputLabel>Document</InputLabel>
                <Select
                  value={articleForm.document}
                  label="Document"
                  onChange={(e) => setArticleForm({...articleForm, document: e.target.value})}
                >
                  {documents.map((document) => (
                    <MenuItem key={document.id} value={document.id.toString()}>
                      {document.ref} ({document.type === "BON" ? "Bon" : "Facture"})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Code"
                value={articleForm.code}
                onChange={(e) => setArticleForm({...articleForm, code: e.target.value})}
                fullWidth
              />
              <TextField
                label="Désignation"
                value={articleForm.designation}
                onChange={(e) => setArticleForm({...articleForm, designation: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Quantité"
                type="number"
                value={articleForm.quantite}
                onChange={(e) => setArticleForm({...articleForm, quantite: parseInt(e.target.value) || 0})}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Prix unitaire"
                type="number"
                value={articleForm.prix_unitaire}
                onChange={(e) => setArticleForm({...articleForm, prix_unitaire: parseFloat(e.target.value) || 0})}
                fullWidth
                required
                inputProps={{ min: 0, step: "0.01" }}
              />
              <TextField
                label="Description"
                value={articleForm.description}
                onChange={(e) => setArticleForm({...articleForm, description: e.target.value})}
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setArticleDialogOpen(false)}>Annuler</Button>
            <Button
              onClick={handleSaveArticle}
              variant="contained"
              disabled={!articleForm.document || !articleForm.designation || articleForm.quantite <= 0 || articleForm.prix_unitaire < 0}
            >
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Filtrer les documents</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <FormControl fullWidth>
                <InputLabel>Type de document</InputLabel>
                <Select
                  value={filters.type}
                  label="Type de document"
                  onChange={(e) => setFilters({...filters, type: e.target.value as any})}
                >
                  <MenuItem value="both">Tous</MenuItem>
                  <MenuItem value="BON">Bon de livraison</MenuItem>
                  <MenuItem value="FACTURE">Facture</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Référence"
                value={filters.ref}
                onChange={(e) => setFilters({...filters, ref: e.target.value})}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Fournisseur</InputLabel>
                <Select
                  value={filters.fournisseur}
                  label="Fournisseur"
                  onChange={(e) => setFilters({...filters, fournisseur: e.target.value})}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {fournisseurs.map((fournisseur) => (
                    <MenuItem key={fournisseur.id} value={fournisseur.id.toString()}>
                      {fournisseur.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Date de début"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Date de fin"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilterDialogOpen(false)}>Annuler</Button>
            <Button onClick={() => handleApplyFilters(filters)} variant="contained">
              Appliquer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Articles View Dialog */}
        <Dialog open={articlesViewDialogOpen} onClose={() => setArticlesViewDialogOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Articles</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              {selectedArticles.length === 0 ? (
                <Typography>Aucun article.</Typography>
              ) : (
                selectedArticles.map((article) => (
                  <Stack
                    key={article.id}
                    spacing={0.5}
                    sx={{ border: "1px solid #ccc", p: 2, borderRadius: 2 }}
                  >
                    <Typography><strong>Code:</strong> {article.code || "—"}</Typography>
                    <Typography><strong>Désignation:</strong> {article.designation}</Typography>
                    <Typography><strong>Quantité:</strong> {article.quantite}</Typography>
                    <Typography><strong>Prix unitaire:</strong> {article.prix_unitaire} DT</Typography>
                    {article.description && (
                      <Typography><strong>Description:</strong> {article.description}</Typography>
                    )}
                  </Stack>
                ))
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setArticlesViewDialogOpen(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </LocalizationProvider>
  );
}
