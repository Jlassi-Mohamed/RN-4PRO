"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
} from "@mui/material";
import { config } from "@/config";

const API_BASE = config.apiBaseUrl;

type Fournisseur = {
  id: number;
  nom: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onFactureAdded?: () => void; // optional callback after add
};

export default function AjouterFactureDialog({ open, onClose, onFactureAdded }: Props) {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [ref, setRef] = useState("");
  const [date, setDate] = useState("");
  const [fournisseur, setFournisseur] = useState("");
  const [montant, setMontant] = useState<number | "">(0);

  useEffect(() => {
    if (open) {
      fetchFournisseurs();
      resetFields();
    }
  }, [open]);

  const resetFields = () => {
    setRef("");
    setDate("");
    setFournisseur("");
    setMontant(0);
  };

  const fetchFournisseurs = async () => {
    try {
      const res = await fetch(`${API_BASE}/fournisseurs/`);
      const data = await res.json();
      setFournisseurs(data);
    } catch (error) {
      alert("Erreur lors du chargement des fournisseurs");
    }
  };

  const handleSubmit = async () => {
    if (!ref || !date || !fournisseur || montant === "" || montant <= 0) {
      alert("Merci de remplir tous les champs correctement.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/stock/factures/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref,
          date,
          fournisseur: parseInt(fournisseur),
          montant,
        }),
      });

      if (!res.ok) throw new Error();

      if (onFactureAdded) onFactureAdded();

      onClose();
    } catch {
      alert("Erreur lors de l'ajout de la facture");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Ajouter une Facture</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Référence"
            fullWidth
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
          <TextField
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <TextField
            label="Fournisseur"
            select
            fullWidth
            value={fournisseur}
            onChange={(e) => setFournisseur(e.target.value)}
          >
            {fournisseurs.map((f) => (
              <MenuItem key={f.id} value={f.id.toString()}>
                {f.nom}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Montant (TND)"
            type="number"
            fullWidth
            value={montant}
            onChange={(e) => setMontant(Number(e.target.value))}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
