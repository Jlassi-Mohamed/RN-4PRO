"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  MenuItem,
  InputAdornment,
  Box,
} from "@mui/material";
import { Add, Delete, Search } from "@mui/icons-material";
import { config } from "@/config";
import Swal from "sweetalert2";
import Protected from "@/components/Protected";

// 🔗 Base URL pour les produits
const API_BASE = `${config.apiBaseUrl}/products`;

// Types côté UI
type Categorie = {
  id: number;
  name: string;
  description: string;
};

type ApiArticle = {
  id: number;
  code: string;
  name: string;
  prix_unit: string | number;
  tva_rate: string | number;
  category: Categorie | null;
};

type Article = {
  id: number;
  code: string;
  name: string;
  prix_unit: string;
  tva_rate: string;
  categoryId: number | null;
};

export default function ArticlesPage() {
  // --- State
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"categorie" | "article" | null>(null);

  // Form state (catégorie OU article selon le mode)
  const [formData, setFormData] = useState<any>({});

  // --- Fetchers
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories/`);
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      Swal.fire("Erreur", "Impossible de charger les catégories", "error");
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API_BASE}/`);
      if (!res.ok) return;
      const data: ApiArticle[] = await res.json();

      // Adapter à notre shape UI (category_id en write-only)
      const mapped: Article[] = data.map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        prix_unit: String(a.prix_unit ?? ""),
        tva_rate: String(a.tva_rate ?? "19.00"),
        categoryId: a.category ? a.category.id : null,
      }));
      setArticles(mapped);
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
      Swal.fire("Erreur", "Impossible de charger les articles", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  // --- Helpers
  const num = (v: string | number | undefined | null) =>
    typeof v === "number" ? v : parseFloat(v || "0");

  const filteredArticles = useMemo(
    () =>
      articles.filter(
        (a) =>
          (!selectedCategorie || a.categoryId === selectedCategorie) &&
          (`${a.name} ${a.code}`.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [articles, selectedCategorie, searchQuery]
  );

  // --- Dialog handlers
  const handleOpenDialog = (mode: "categorie" | "article") => {
    setDialogMode(mode);

    if (mode === "categorie") {
      setFormData({
        name: "",
        description: "",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        prix_unit: "0.00",
        tva_rate: "19.00",
        categoryId: null, // Category is not set by default
      });
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogMode(null);
    setFormData({});
  };

  // --- CRUD
  const handleSave = async () => {
    if (!dialogMode) return;

    if (dialogMode === "categorie") {
      const url = `${API_BASE}/categories/`;
      const payload = {
        name: formData.name,
        description: formData.description ?? "",
      };

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Erreur Catégorie:", errorData);
          Swal.fire("Erreur", "Impossible de sauvegarder la catégorie", "error");
          return;
        }

        await fetchCategories();
        handleCloseDialog();
        Swal.fire("Succès", "Catégorie créée avec succès", "success");
      } catch (error) {
        console.error("Erreur:", error);
        Swal.fire("Erreur", "Une erreur s'est produite", "error");
      }
      return;
    }

    // Article (utilise category_id en write)
    const url = `${API_BASE}/`;
    const payload = {
      code: formData.code,
      name: formData.name,
      prix_unit: String(formData.prix_unit ?? "0.00"),
      tva_rate: String(formData.tva_rate ?? "19.00"),
      category_id: formData.categoryId, // 🔑 write-only côté DRF
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erreur Article:", errorData);
        Swal.fire("Erreur", "Impossible de sauvegarder l'article", "error");
        return;
      }

      await fetchArticles();
      handleCloseDialog();
      Swal.fire("Succès", "Article créé avec succès", "success");
    } catch (error) {
      console.error("Erreur:", error);
      Swal.fire("Erreur", "Une erreur s'est produite", "error");
    }
  };

  const handleDelete = async (mode: "categorie" | "article", id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Voulez-vous vraiment supprimer ${mode === "categorie" ? "la catégorie" : "l'article"} "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    const url =
      mode === "categorie"
        ? `${API_BASE}/categories/${id}/`
        : `${API_BASE}/${id}/`;

    try {
      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok) {
        // Check if the error is because the article is used in an order
        if (res.status === 409 || res.status === 400) {
          Swal.fire(
            "Cet article est utilisé dans une ou plusieurs commandes et ne peut pas être supprimé !",
            "",
            "error"
          );
          return;
        }

        console.error("Erreur suppression:", await res.text());
        Swal.fire("Erreur", "Cet article est utilisé dans une ou plusieurs commandes et ne peut pas être supprimé.", "error");
        return;
      }

      mode === "categorie" ? await fetchCategories() : await fetchArticles();
      Swal.fire("Supprimé!", `La suppression a été effectuée avec succès.`, "success");
    } catch (error) {
      console.error("Erreur:", error);
      Swal.fire("Erreur", "Une erreur s'est produite lors de la suppression", "error");
    }
  };

  return (
    <Protected allowedRoles={['admin', 'manager']}>
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Articles
      </Typography>

      {/* ===================== CATÉGORIES ===================== */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Catégories</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog("categorie")}>
          Nouvelle Catégorie
        </Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nom</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((c) => (
            <TableRow
              key={c.id}
              hover
              selected={selectedCategorie === c.id}
              sx={{ cursor: "pointer" }}
              onClick={() => setSelectedCategorie((prev) => (prev === c.id ? null : c.id))}
            >
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.description}</TableCell>
              <TableCell align="right">
                <IconButton
                  color="error"
                  onClick={() => handleDelete("categorie", c.id, c.name)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ===================== ARTICLES ===================== */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Articles</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog("article")}>
            Nouvel Article
          </Button>
        </Stack>

        {/* Barre de recherche améliorée */}
        <TextField
          placeholder="Rechercher par code, désignation ou catégorie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {/* Filtres de recherche */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <Button
            variant={selectedCategorie === null ? "contained" : "outlined"}
            size="small"
            onClick={() => setSelectedCategorie(null)}
          >
            Toutes les catégories
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={selectedCategorie === c.id ? "contained" : "outlined"}
              size="small"
              onClick={() => setSelectedCategorie(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </Stack>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Désignation</TableCell>
            <TableCell>Prix Unitaire</TableCell>
            <TableCell>TVA (%)</TableCell>
            <TableCell>Catégorie</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredArticles.map((a) => {
            const catName = categories.find((c) => c.id === a.categoryId)?.name || "—";
            return (
              <TableRow key={a.id} hover>
                <TableCell>{a.code}</TableCell>
                <TableCell>{a.name}</TableCell>
                <TableCell>{num(a.prix_unit).toFixed(2)}</TableCell>
                <TableCell>{num(a.tva_rate).toFixed(2)}</TableCell>
                <TableCell>{catName}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="error"
                    onClick={() => handleDelete("article", a.id, a.name)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* ===================== DIALOG ===================== */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>
          {dialogMode === "categorie" ? "Nouvelle Catégorie" : "Nouvel Article"}
        </DialogTitle>

        <DialogContent>
          {dialogMode === "categorie" ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nom"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
              />
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Code"
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                fullWidth
              />
              <TextField
                label="Désignation"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
              />
              <TextField
                type="number"
                label="Prix Unitaire (HT)"
                value={formData.prix_unit ?? "0.00"}
                onChange={(e) => setFormData({ ...formData, prix_unit: e.target.value })}
                fullWidth
                inputProps={{ step: "0.01", min: "0" }}
              />
              <TextField
                type="number"
                label="TVA (%)"
                value={formData.tva_rate ?? "19.00"}
                onChange={(e) => setFormData({ ...formData, tva_rate: e.target.value })}
                fullWidth
                inputProps={{ step: "0.01", min: "0", max: "100" }}
              />
              <TextField
                select
                label="Catégorie"
                value={formData.categoryId ?? ""}
                onChange={(e) => setFormData({
                  ...formData,
                  categoryId: e.target.value ? Number(e.target.value) : null
                })}
                fullWidth
              >
                <MenuItem value="">
                  <em>Aucune catégorie</em>
                </MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Protected>
  );
}
