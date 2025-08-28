"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Stack,
  Typography,
  Button,
  TextField,
  Paper,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Chip,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { config } from "@/config";
import Swal from "sweetalert2";
import Protected from "@/components/Protected";

type CompanyInfo = {
  id: number;
  name: string;
  legal_name: string;
  company_type: string;
  tax_identification: string;
  trade_register: string;
  address: string;
  phone_number: string;
  email: string;
  website: string;
  founding_date: string;
  capital: string;
  bank_name: string;
  bank_account: string;
  bank_rib: string;
  logo: string;
  created_at: string;
  updated_at: string;
};

const COMPANY_TYPES = [
  { value: "SARL", label: "SARL (Société à Responsabilité Limitée)" },
  { value: "SA", label: "SA (Société Anonyme)" },
  { value: "SNC", label: "SNC (Société en Nom Collectif)" },
  { value: "SCS", label: "SCS (Société en Commandite Simple)" },
  { value: "SCA", label: "SCA (Société en Commandite par Actions)" },
  { value: "SUARL", label: "SUARL (Société Unipersonnelle à Responsabilité Limitée)" },
  { value: "EURL", label: "EURL (Entreprise Unipersonnelle à Responsabilité Limitée)" },
  { value: "OTHER", label: "Autre" },
];

export default function CompanyInfoPage(): React.JSX.Element {
  const API_BASE = `${config.apiBaseUrl}/company/`;
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CompanyInfo>>({
    name: "",
    legal_name: "",
    company_type: "",
    tax_identification: "",
    trade_register: "",
    address: "",
    phone_number: "",
    email: "",
    website: "",
    founding_date: "",
    capital: "",
    bank_name: "",
    bank_account: "",
    bank_rib: "",
  });

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

  const fetchCompanyInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setCompany(data[0]);
          setFormData(data[0]);
        }
      } else if (res.status === 404) {
        setCompany(null);
      } else {
        throw new Error("Failed to fetch company info");
      }
    } catch (error) {
      showErrorAlert("Erreur lors du chargement des informations de l'entreprise");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = company ? "PUT" : "POST";
      const url = company ? `${API_BASE}${company.id}/` : API_BASE;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showSuccessAlert(
          company
            ? "Informations mises à jour avec succès"
            : "Informations enregistrées avec succès"
        );
        setEditMode(false);
        fetchCompanyInfo();
      } else {
        throw new Error("Échec de l'enregistrement");
      }
    } catch (error) {
      showErrorAlert("Erreur lors de l'enregistrement des informations");
    }
  };

  const handleInputChange = (field: keyof CompanyInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditToggle = () => {
    if (editMode) {
      setFormData(company || {});
    }
    setEditMode(!editMode);
  };

  const handleCancelEdit = () => {
    setFormData(company || {});
    setEditMode(false);
  };

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" height="50vh">
        <Typography>Chargement...</Typography>
      </Stack>
    );
  }

  return (
    <Protected allowedRoles={['admin', 'manager']}>
    <Stack spacing={3} padding={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" gutterBottom>
          Informations de l'Entreprise
        </Typography>

        {company ? (
          <Button
            variant="contained"
            startIcon={editMode ? <SaveIcon /> : <EditIcon />}
            onClick={editMode ? handleSubmit : handleEditToggle}
          >
            {editMode ? "Enregistrer" : "Modifier"}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => setEditMode(true)}
          >
            Ajouter Informations
          </Button>
        )}

        {editMode && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleCancelEdit}
            sx={{ ml: 2 }}
          >
            Annuler
          </Button>
        )}
      </Box>

      {!company && !editMode ? (
        <Alert severity="info">
          Aucune information d'entreprise n'a été enregistrée. Cliquez sur "Ajouter Informations" pour commencer.
        </Alert>
      ) : (
        <Paper elevation={2} sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Typography variant="h6" gutterBottom>
                Informations de base
              </Typography>

              <TextField
                label="Nom de l'entreprise"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                disabled={!editMode}
                fullWidth
              />

              <TextField
                label="Dénomination sociale"
                value={formData.legal_name || ""}
                onChange={(e) => handleInputChange("legal_name", e.target.value)}
                disabled={!editMode}
                fullWidth
              />

              <FormControl fullWidth disabled={!editMode}>
                <InputLabel>Type de société</InputLabel>
                <Select
                  value={formData.company_type || ""}
                  label="Type de société"
                  onChange={(e) => handleInputChange("company_type", e.target.value)}
                  required
                >
                  {COMPANY_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Matricule Fiscal"
                value={formData.tax_identification || ""}
                onChange={(e) => handleInputChange("tax_identification", e.target.value)}
                required
                disabled={!editMode}
                fullWidth
              />

              <TextField
                label="Registre de Commerce"
                value={formData.trade_register || ""}
                onChange={(e) => handleInputChange("trade_register", e.target.value)}
                disabled={!editMode}
                fullWidth
              />

              <TextField
                label="Date de création"
                type="date"
                value={formData.founding_date || ""}
                onChange={(e) => handleInputChange("founding_date", e.target.value)}
                disabled={!editMode}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label="Capital social"
                type="number"
                value={formData.capital || ""}
                onChange={(e) => handleInputChange("capital", e.target.value)}
                disabled={!editMode}
                fullWidth
              />

              <Divider />

              <Typography variant="h6" gutterBottom>
                Contact
              </Typography>

              <TextField
                label="Adresse"
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
                disabled={!editMode}
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                label="Téléphone"
                value={formData.phone_number || ""}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                required
                disabled={!editMode}
                fullWidth
              />

              <TextField
                label="Email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={!editMode}
                fullWidth
              />

              <TextField
                label="Site web"
                value={formData.website || ""}
                onChange={(e) => handleInputChange("website", e.target.value)}
                disabled={!editMode}
                fullWidth
              />

              <Divider />

              <Typography variant="h6" gutterBottom>
                Informations bancaires
              </Typography>

              <TextField
                label="Nom de la banque"
                value={formData.bank_name || ""}
                onChange={(e) => handleInputChange("bank_name", e.target.value)}
                disabled={!editMode}
                fullWidth
              />

              <TextField
                label="Numéro de compte"
                value={formData.bank_account || ""}
                onChange={(e) => handleInputChange("bank_account", e.target.value)}
                disabled={!editMode}
                fullWidth
              />

              <TextField
                label="RIB"
                value={formData.bank_rib || ""}
                onChange={(e) => handleInputChange("bank_rib", e.target.value)}
                disabled={!editMode}
                fullWidth
              />
            </Stack>

            {editMode && (
              <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" color="error" onClick={handleCancelEdit}>
                  Annuler
                </Button>
                <Button type="submit" variant="contained">
                  {company ? "Mettre à jour" : "Créer"}
                </Button>
              </Box>
            )}
          </form>
        </Paper>
      )}
    </Stack>
    </Protected>
  );
}
