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

type BonDeLivraison = {
  id: number;
  ref: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onArticleAdded?: () => void;  // Add this prop here
};

export default function AjouterArticleDialog({ open, onClose, onArticleAdded }: Props) {
  const [bons, setBons] = useState<BonDeLivraison[]>([]);
  const [code, setCode] = useState("");
  const [designation, setDesignation] = useState("");
  const [description, setDescription] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [prix, setPrix] = useState(0);
  const [selectedBon, setSelectedBon] = useState("");

  const fetchBons = async () => {
    try {
      const res = await fetch(`${API_BASE}/stock/bons-de-livraison/`);
      const data = await res.json();
      setBons(data);
    } catch {
      alert("Erreur lors du chargement des bons");
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE}/stock/articles/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          designation,
          description,
          quantite,
          prix_unitaire: prix,
          bon_de_livraison: selectedBon ? parseInt(selectedBon) : null,
        }),
      });

      if (!res.ok) throw new Error();

      // Call the callback to notify parent that article was added
      if (onArticleAdded) onArticleAdded();

      onClose();
    } catch {
      alert("Erreur lors de l'ajout de l'article");
    }
  };

  useEffect(() => {
    if (open) fetchBons();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Ajouter un Article</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Code"
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <TextField
            label="Désignation"
            fullWidth
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Quantité"
            type="number"
            fullWidth
            value={quantite}
            onChange={(e) => setQuantite(Number(e.target.value))}
          />
          <TextField
            label="Prix unitaire (TND)"
            type="number"
            fullWidth
            value={prix}
            onChange={(e) => setPrix(Number(e.target.value))}
          />
          <TextField
            label="Bon de Livraison"
            select
            fullWidth
            value={selectedBon}
            onChange={(e) => setSelectedBon(e.target.value)}
          >
            {bons.map((bon) => (
              <MenuItem key={bon.id} value={bon.id}>
                {bon.ref}
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
