"use client";

import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { config } from "@/config";
import Swal from "sweetalert2";
import Protected from "@/components/Protected";

type Employee = {
  id: number;
  name: string;
  position?: string;
  hire_date?: string;
  phone?: string;
  address?: string;
  salary?: number | string;
  is_active: boolean;
};

const API_URL = `${config.apiBaseUrl}/employees/`;

export default function EmployesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setEmployees(data);
      setFiltered(data);
    } catch (error) {
      showError("Erreur lors du chargement des employés");
    }
  };

  const showSuccess = (message: string) => {
    Swal.fire({
      icon: "success",
      title: "Succès",
      text: message,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const showError = (message: string) => {
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: message,
    });
  };

  const showConfirm = async (title: string, text: string): Promise<boolean> => {
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

  const handleSearch = (value: string) => {
    setSearch(value);
    setFiltered(
      employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(value.toLowerCase()) ||
          emp.position?.toLowerCase().includes(value.toLowerCase()) ||
          emp.phone?.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleSave = async () => {
    try {
      // Convert salary to number before sending
      const employeeData = {
        ...currentEmployee,
        salary: currentEmployee.salary ? Number(currentEmployee.salary) : undefined
      };

      const method = currentEmployee.id ? "PUT" : "POST";
      const url = currentEmployee.id ? `${API_URL}${currentEmployee.id}/` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });

      if (res.ok) {
        setDialogOpen(false);
        setCurrentEmployee({});
        fetchEmployees();
        setSelectedEmployeeId(null);
        showSuccess(
          currentEmployee.id
            ? "Employé modifié avec succès"
            : "Employé ajouté avec succès"
        );
      } else {
        throw new Error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      showError("Erreur lors de la sauvegarde de l'employé");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm(
      "Êtes-vous sûr ?",
      "Voulez-vous vraiment supprimer cet employé ? Cette action est irréversible."
    );

    if (confirmed) {
      try {
        const res = await fetch(`${API_URL}${id}/`, { method: "DELETE" });
        if (res.ok) {
          fetchEmployees();
          setSelectedEmployeeId(null);
          showSuccess("Employé supprimé avec succès");
        } else {
          throw new Error("Erreur lors de la suppression");
        }
      } catch (error) {
        showError("Erreur lors de la suppression de l'employé");
      }
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    id: number
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedEmployeeId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployeeId(null);
  };

  const formatSalary = (salary?: number | string): string => {
    if (salary === undefined || salary === null || salary === "") return "-";

    // Convert to number if it's a string
    const numericSalary = typeof salary === 'string' ? parseFloat(salary) : salary;

    // Check if it's a valid number
    if (isNaN(numericSalary)) return "-";

    return `${numericSalary.toFixed(3)} TND`;
  };

  return (
    <Protected allowedRoles={['admin', 'manager']}>
    <Stack spacing={4} p={4}>
      <Typography variant="h4">Gestion des Employés</Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          size="small"
          label="Rechercher"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher par nom, poste ou téléphone"
        />
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setCurrentEmployee({});
            setDialogOpen(true);
          }}
        >
          Ajouter Employé
        </Button>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nom</TableCell>
            <TableCell>Poste</TableCell>
            <TableCell>Date d&apos;embauche</TableCell>
            <TableCell>Téléphone</TableCell>
            <TableCell>Adresse</TableCell>
            <TableCell>Salaire</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((emp) => (
            <TableRow key={emp.id} hover>
              <TableCell>{emp.name}</TableCell>
              <TableCell>{emp.position || "-"}</TableCell>
              <TableCell>{emp.hire_date || "-"}</TableCell>
              <TableCell>{emp.phone || "-"}</TableCell>
              <TableCell>{emp.address || "-"}</TableCell>
              <TableCell>{formatSalary(emp.salary)}</TableCell>
              <TableCell>{emp.is_active ? "Actif" : "Inactif"}</TableCell>
              <TableCell>
                <IconButton
                  onClick={(e) => handleMenuClick(e, emp.id)}
                  size="small"
                >
                  <MoreVertIcon />
                </IconButton>
                {selectedEmployeeId === emp.id && (
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      onClick={() => {
                        setCurrentEmployee(emp);
                        setDialogOpen(true);
                        handleMenuClose();
                      }}
                    >
                      Modifier
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDelete(emp.id);
                        handleMenuClose();
                      }}
                    >
                      Supprimer
                    </MenuItem>
                  </Menu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentEmployee.id ? "Modifier Employé" : "Ajouter Employé"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nom complet"
              fullWidth
              required
              value={currentEmployee.name || ""}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, name: e.target.value })}
            />
            <TextField
              label="Poste"
              fullWidth
              value={currentEmployee.position || ""}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, position: e.target.value })}
            />
            <TextField
              label="Date d'embauche"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={currentEmployee.hire_date || ""}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, hire_date: e.target.value })}
            />
            <TextField
              label="Téléphone"
              fullWidth
              value={currentEmployee.phone || ""}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, phone: e.target.value })}
            />
            <TextField
              label="Adresse"
              fullWidth
              multiline
              rows={2}
              value={currentEmployee.address || ""}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, address: e.target.value })}
            />
            <TextField
              label="Salaire (TND)"
              type="number"
              fullWidth
              inputProps={{ step: "0.001" }}
              value={currentEmployee.salary ?? ""}
              onChange={(e) =>
                setCurrentEmployee({
                  ...currentEmployee,
                  salary: e.target.value
                })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!currentEmployee.name}
          >
            {currentEmployee.id ? "Modifier" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
    </Protected>
  );
}
