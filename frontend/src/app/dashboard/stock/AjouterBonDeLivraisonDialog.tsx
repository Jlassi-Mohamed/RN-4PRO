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
  onBonAdded?: () => void;
};

export default function AjouterBonDeLivraisonDialog({ open, onClose, onBonAdded }: Props) {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [ref, setRef] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [fournisseur, setFournisseur] = useState("");

  useEffect(() => {
    if (open) {
      fetchFournisseurs();
      resetFields();
    }
  }, [open]);

  const resetFields = () => {
    setRef("");
    setDate("");
    setDescription("");
    setFournisseur("");
  };

  const fetchFournisseurs = async () => {
    try {
      const res = await fetch(`${API_BASE}/fournisseurs/`);
      const data = await res.json();
      setFournisseurs(data);
    } catch {
      alert("Erreur lors du chargement des fournisseurs");
    }
  };

  const handleSubmit = async () => {
    if (!ref || !date || !fournisseur) {
      alert("Merci de remplir tous les champs obligatoires.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/stock/bons-de-livraison/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref,
          date,
          description,
          fournisseur: parseInt(fournisseur),
        }),
      });

      if (!res.ok) throw new Error();

      if (onBonAdded) onBonAdded();

      onClose();
    } catch {
      alert("Erreur lors de l'ajout du bon de livraison");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Ajouter un Bon de Livraison</DialogTitle>
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
            label="Description"
            multiline
            minRows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
