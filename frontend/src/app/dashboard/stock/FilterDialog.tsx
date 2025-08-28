"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";

type Fournisseur = {
  id: number;
  nom: string;
};

type FilterValues = {
  type: "bon" | "facture" | "both";
  ref: string;
  fournisseur: string; 
  dateFrom: string;
  dateTo: string;
};

type FilterDialogProps = {
  open: boolean;
  onClose: () => void;
  fournisseurs: Fournisseur[];
  onApply: (filters: FilterValues) => void;
  initialFilters: FilterValues;
};

export default function FilterDialog({
  open,
  onClose,
  fournisseurs,
  onApply,
  initialFilters,
}: FilterDialogProps) {
  const [type, setType] = useState<"bon" | "facture" | "both">(initialFilters.type);
  const [ref, setRef] = useState(initialFilters.ref);
  const [fournisseur, setFournisseur] = useState(initialFilters.fournisseur);
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom);
  const [dateTo, setDateTo] = useState(initialFilters.dateTo);

  // Reset local state to initialFilters when dialog re-opens
  useEffect(() => {
    if (open) {
      setType(initialFilters.type);
      setRef(initialFilters.ref);
      setFournisseur(initialFilters.fournisseur);
      setDateFrom(initialFilters.dateFrom);
      setDateTo(initialFilters.dateTo);
    }
  }, [open, initialFilters]);

  const handleApply = () => {
    onApply({ type, ref, fournisseur, dateFrom, dateTo });
    onClose();
  };

  const handleReset = () => {
    setType("both");
    setRef("");
    setFournisseur("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Filtrer les données</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <MenuItem value="both">Bons & Factures</MenuItem>
              <MenuItem value="bon">Bons de Livraison</MenuItem>
              <MenuItem value="facture">Factures</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Référence"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            fullWidth
            placeholder="Chercher par référence"
          />

          <FormControl fullWidth>
            <InputLabel>Fournisseur</InputLabel>
            <Select
              label="Fournisseur"
              value={fournisseur}
              onChange={(e) => setFournisseur(e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              {fournisseurs.map((f) => (
                <MenuItem key={f.id} value={f.id.toString()}>
                  {f.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Date de début"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Date de fin"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => {
            handleReset();
            onApply({ type: "both", ref: "", fournisseur: "", dateFrom: "", dateTo: "" });
            onClose();
          }}
        >
          Réinitialiser
        </Button>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleApply}>
          Appliquer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
