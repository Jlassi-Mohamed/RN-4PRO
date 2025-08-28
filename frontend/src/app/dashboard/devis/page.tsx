"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  InputLabel,
  FormControl,
  Stack,
  Typography,
  Chip,
  Box,
  Tabs,
  Tab,
  // ❌ Remove Grid from named imports
} from "@mui/material";
// ✅ Add default import for Grid
import Grid from "@mui/material/Grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import { config } from "@/config";
import Swal from "sweetalert2";
import Protected from "@/components/Protected";

const API_BASE = `${config.apiBaseUrl}/orders`;
const PRODUCTS_API = `${config.apiBaseUrl}/products`;
const CATEGORIES_API = `${config.apiBaseUrl}/products/categories`;

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  remise: number;
  unit_price: number;
  total_ht: number;
  tva_amount: number;
  total_ttc: number;
};

type Order = {
  id: number;
  reference: string;
  client: number;
  client_name: string;
  status: string;
  order_type: string;
  notes: string;
  expected_finish_date: string | null;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  // Withholding tax fields
  withholding_tax_amount: number;
  withholding_tax_rate: number;
  withholding_tax_applied: boolean;
  withholding_tax_excluded: boolean;
  withholding_exclusion_reason: string;
};

type Product = {
  id: number;
  name: string;
  code: string;
  prix_unit: number;
  tva_rate: number;
  category_id: number | null;
};

type ProductCategory = {
  id: number;
  name: string;
};

type Client = {
  id: number;
  name: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [newOrder, setNewOrder] = useState({
    reference: "",
    client: "",
    status: "DRAFT",
    order_type: "GOODS", // Always set to 'GOODS'
    notes: "",
    expected_finish_date: ""
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    code: "",
    prix_unit: 0,
    tva_rate: 19.00,
    category_id: null as number | null
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuOrder, setMenuOrder] = useState<Order | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openViewProductsDialog, setOpenViewProductsDialog] = useState(false);

  const [openAddProductDialog, setOpenAddProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(1);
  const [remise, setRemise] = useState<number>(0);
  const [productDialogTab, setProductDialogTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [openEditOrderDialog, setOpenEditOrderDialog] = useState(false);
  const [editOrderData, setEditOrderData] = useState({
    reference: "",
    client: "",
    status: "DRAFT",
    order_type: "GOODS", // Always set to 'GOODS'
    notes: "",
    expected_finish_date: ""
  });

  useEffect(() => {
    fetchOrders();
    fetchClients();
  }, []);

  useEffect(() => {
    if (openAddProductDialog) {
      fetchProducts();
      fetchCategories();
    }
  }, [openAddProductDialog]);

  const fetchOrders = () => {
    fetch(`${API_BASE}/`)
      .then((res) => res.json())
      .then((data) => {
        const processedOrders = data.map((order: any) => ({
          ...order,
          total_ht: Number(order.total_ht || 0),
          total_tva: Number(order.total_tva || 0),
          total_ttc: Number(order.total_ttc || 0),
          withholding_tax_amount: Number(order.withholding_tax_amount || 0),
          withholding_tax_rate: Number(order.withholding_tax_rate || 0),
          items: order.items.map((item: any) => ({
            ...item,
            total_ht: Number(item.total_ht || 0),
            tva_amount: Number(item.tva_amount || 0),
            total_ttc: Number(item.total_ttc || 0),
          }))
        }));
        setOrders(processedOrders);
      });
  };

  const fetchClients = () => {
    fetch(`${config.apiBaseUrl}/clients/`).then((res) => res.json()).then(setClients);
  };

  const fetchProducts = () => {
    fetch(`${config.apiBaseUrl}/products/`).then((res) => res.json()).then((data) => {
      const processedProducts = data.map((product: any) => ({
        ...product,
        prix_unit: Number(product.prix_unit),
        tva_rate: Number(product.tva_rate)
      }));
      setProducts(processedProducts);
    });
  };

  const fetchCategories = () => {
    fetch(CATEGORIES_API).then((res) => {
      if (res.ok) {
        return res.json().then(setCategories);
      }
      console.error("Failed to fetch categories");
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, order: Order) => {
    setAnchorEl(event.currentTarget);
    setMenuOrder(order);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const showAlert = (
    title: string,
    text: string,
    icon: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    Swal.fire({
      title,
      text,
      icon,
      timer: 1500,
      showConfirmButton: false,
      position: "center",
      didOpen: () => {
        const swal = Swal.getPopup();
        if (swal) swal.style.zIndex = "2500";
      }
    });
  };

  const handleCreateOrder = async () => {
    const res = await fetch(`${API_BASE}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newOrder,
        client: Number(newOrder.client),
        total_ht: 0,
        total_tva: 0,
        total_ttc: 0
      }),
    });
    if (res.ok) {
      const order = await res.json();
      setOrders([order, ...orders]);
      setNewOrder({
        reference: "",
        client: "",
        status: "DRAFT",
        order_type: "GOODS",
        notes: "",
        expected_finish_date: ""
      });
      showAlert("Succès", "Commande créée avec succès");
    } else {
      console.error("Failed to create order:", res.statusText);
      showAlert("Erreur", "Échec de la création de la commande", "error");
    }
  };

  const handleCreateProduct = async () => {
    setError(null);

    if (!newProduct.name) {
      setError("Product name is required");
      return;
    }

    if (!newProduct.prix_unit || newProduct.prix_unit <= 0) {
      setError("Valid price is required");
      return;
    }

    if (!newProduct.category_id) {
      setError("Category is required");
      return;
    }

    const productData: any = {
      name: newProduct.name,
      code: newProduct.code || undefined,
      prix_unit: Number(newProduct.prix_unit),
      tva_rate: Number(newProduct.tva_rate),
      category_id: newProduct.category_id
    };

    const res = await fetch(`${PRODUCTS_API}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    if (res.ok) {
      const product = await res.json();
      setProducts((prev) => [{
        ...product,
        prix_unit: Number(product.prix_unit),
        tva_rate: Number(product.tva_rate)
      }, ...prev]);

      // Redirect to "Sélectionner un produit" tab and select the new product
      setSelectedProduct(product.id);
      setProductDialogTab(0);

      // Reset product form but keep quantity and remise
      setNewProduct({
        name: "",
        code: "",
        prix_unit: 0,
        tva_rate: 19.00,
        category_id: null
      });

      showAlert("Succès", "Produit créé avec succès");
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error("Failed to create product:", res.status, errorData);
      setError(`Failed to create product: ${JSON.stringify(errorData)}`);
      showAlert("Erreur", "Échec de la création du produit", "error");
    }
  };

  const handleDeleteOrder = async () => {
    if (!menuOrder || !menuOrder.id) return;

    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous ne pourrez pas annuler cette action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler',
      didOpen: () => {
        const swal = Swal.getPopup();
        if (swal) swal.style.zIndex = "2500";
      }
    });

    if (!result.isConfirmed) return;

    const res = await fetch(`${API_BASE}/${menuOrder.id}/`, { method: "DELETE" });
    if (res.ok) {
      setOrders(orders.filter((o) => o.id !== menuOrder.id));
      if (selectedOrder?.id === menuOrder.id) setSelectedOrder(null);
      handleMenuClose();
      showAlert("Supprimé", "Commande supprimée avec succès");
    } else {
      console.error("Failed to delete order:", res.statusText);
      showAlert("Erreur", "Échec de la suppression de la commande", "error");
    }
  };

  const handleAddProduct = async () => {
    if (!selectedOrder || !selectedOrder.id || !selectedProduct) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    try {
      Swal.fire({
        title: 'Ajout en cours...',
        text: 'Veuillez patienter',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const res = await fetch(`${API_BASE}/${selectedOrder.id}/items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: selectedProduct,
          quantity,
          remise,
          unit_price: product.prix_unit,
        }),
      });

      if (res.ok) {
        fetchOrders();
        setSelectedProduct("");
        setQuantity(1);
        setRemise(0);
        setOpenAddProductDialog(false);

        Swal.fire({
          title: 'Succès!',
          text: 'Produit ajouté à la commande',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to add product:", res.status, errorData);

        Swal.fire({
          title: 'Erreur!',
          text: `Échec de l'ajout du produit: ${errorData.detail || JSON.stringify(errorData)}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error("Network error:", error);

      Swal.fire({
        title: 'Erreur réseau!',
        text: 'Impossible de se connecter au serveur',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEditOrder = async () => {
    if (!selectedOrder || !selectedOrder.id) return;
    const res = await fetch(`${API_BASE}/${selectedOrder.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editOrderData,
        client: Number(editOrderData.client)
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
      setSelectedOrder(updated);
      setOpenEditOrderDialog(false);
      showAlert("Succès", "Commande mise à jour avec succès");
    } else {
      console.error("Failed to update order:", res.statusText);
      showAlert("Erreur", "Échec de la mise à jour de la commande", "error");
    }
  };

  const handlePrintOrder = (order: Order) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Commande ${order.reference}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .totals { margin-top: 20px; text-align: right; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          @media print {
            body { margin: 0; padding: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Commande ${order.reference}</h1>
        </div>

        <div class="info">
          <p><strong>Client:</strong> ${order.client_name}</p>
          <p><strong>Statut:</strong> ${order.status}</p>
          <p><strong>Date de création:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          ${order.expected_finish_date ? `<p><strong>Date de fin prévue:</strong> ${order.expected_finish_date}</p>` : ''}
          ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix Unitaire</th>
              <th>Remise (%)</th>
              <th>Total HT</th>
              <th>TVA</th>
              <th>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>${formatNumber(item.unit_price)} TND</td>
                <td>${item.remise}%</td>
                <td>${formatNumber(item.total_ht)} TND</td>
                <td>${formatNumber(item.tva_amount)} TND</td>
                <td>${formatNumber(item.total_ttc)} TND</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Total HT:</strong> ${formatNumber(order.total_ht)} TND</p>
          <p><strong>Total TVA:</strong> ${formatNumber(order.total_tva)} TND</p>
          <p><strong>Total TTC:</strong> ${formatNumber(order.total_ttc)} TND</p>
          ${order.withholding_tax_applied ? `
            <p><strong>Retenue à la source (${order.withholding_tax_rate}%):</strong> ${formatNumber(order.withholding_tax_amount)} TND</p>
            <p><strong>Net à payer:</strong> ${formatNumber(order.total_ttc - order.withholding_tax_amount)} TND</p>
          ` : order.withholding_tax_excluded ? `
            <p><strong>Retenue à la source:</strong> Exclue (${order.withholding_exclusion_reason})</p>
          ` : ''}
        </div>

        <div class="footer">
          <p>Document généré le ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Immediately trigger print and close the window
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case "DRAFT": return <Chip label="Brouillon" color="default" />;
      case "CONFIRMED": return <Chip label="Confirmé" color="primary" />;
      case "PAID": return <Chip label="Payé" color="success" />;
      case "DELIVERED": return <Chip label="Livré" color="info" />;
      case "CANCELLED": return <Chip label="Annulé" color="error" />;
      default: return <Chip label={status} />;
    }
  };

  const formatNumber = (value: any): string => {
    const num = Number(value || 0);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <Protected allowedRoles={['admin', 'manager']}>
    <div className="p-6">
      <Typography variant="h4" gutterBottom>Gestion des Commandes</Typography>

      {/* Création commande */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Nouvelle commande</Typography>
        <Stack direction="row" spacing={2} mt={2} alignItems="flex-end" flexWrap="wrap">
          <TextField
            label="Référence"
            value={newOrder.reference}
            onChange={(e) => setNewOrder({ ...newOrder, reference: e.target.value })}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Client</InputLabel>
            <Select
              native
              value={newOrder.client}
              onChange={(e) => setNewOrder({ ...newOrder, client: e.target.value })}
              label="Client"
            >
              <option aria-label="None" value="" />
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              native
              value={newOrder.status}
              onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
              label="Status"
            >
              <option value="DRAFT">Brouillon</option>
              <option value="CONFIRMED">Confirmé</option>
              <option value="PAID">Payé</option>
              <option value="DELIVERED">Livré</option>
              <option value="CANCELLED">Annulé</option>
            </Select>
          </FormControl>
          <TextField
            label="Notes"
            value={newOrder.notes}
            onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
          />
          <TextField
            label="Date fin prévue"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newOrder.expected_finish_date}
            onChange={(e) => setNewOrder({ ...newOrder, expected_finish_date: e.target.value })}
          />
          <Button variant="contained" onClick={handleCreateOrder}>Créer</Button>
        </Stack>
      </Paper>

      {/* Tableau commandes */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Référence</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total HT</TableCell>
              <TableCell>Total TVA</TableCell>
              <TableCell>Total TTC</TableCell>
              <TableCell>Retenue à la source</TableCell>
              <TableCell>Net à payer</TableCell>
              <TableCell>Date fin prévue</TableCell>
              <TableCell>Créé le</TableCell>
              <TableCell>Mis à jour le</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.reference}</TableCell>
                <TableCell>{order.client_name}</TableCell>
                <TableCell>{renderStatus(order.status)}</TableCell>
                <TableCell>{formatNumber(order.total_ht)} TND</TableCell>
                <TableCell>{formatNumber(order.total_tva)} TND</TableCell>
                <TableCell>{formatNumber(order.total_ttc)} TND</TableCell>
                <TableCell>
                  {order.withholding_tax_applied
                    ? `${formatNumber(order.withholding_tax_amount)} TND (${order.withholding_tax_rate}%)`
                    : order.withholding_tax_excluded
                      ? "Exclue"
                      : "Non applicable"
                  }
                </TableCell>
                <TableCell>
                  {formatNumber(order.total_ttc - order.withholding_tax_amount)} TND
                </TableCell>
                <TableCell>{order.expected_finish_date || 'N/A'}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(order.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => { handleMenuOpen(e, order); }}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu Actions commande */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => {
          if (menuOrder && menuOrder.id) {
            setSelectedOrder(menuOrder);
            setOpenViewProductsDialog(true);
            handleMenuClose();
          }
        }}>
          Consulter Produits
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuOrder && menuOrder.id) {
            setSelectedOrder(menuOrder);
            setOpenAddProductDialog(true);
            handleMenuClose();
          }
        }}>
          Ajouter Produits
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuOrder && menuOrder.id) {
            setSelectedOrder(menuOrder);
            setEditOrderData({
              reference: menuOrder.reference,
              client: String(menuOrder.client),
              status: menuOrder.status,
              order_type: menuOrder.order_type,
              notes: menuOrder.notes,
              expected_finish_date: menuOrder.expected_finish_date || ""
            });
            setOpenEditOrderDialog(true);
            handleMenuClose();
          }
        }}>
          Modifier Commande
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuOrder) {
            handlePrintOrder(menuOrder);
            handleMenuClose();
          }
        }}>
          <PrintIcon sx={{ mr: 1 }} /> Imprimer
        </MenuItem>
        <MenuItem onClick={handleDeleteOrder}>Supprimer</MenuItem>
      </Menu>

      {/* --- Modale consultation produits --- */}
      <Dialog open={openViewProductsDialog} onClose={() => setOpenViewProductsDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
          Produits de la commande {selectedOrder?.reference}
          {selectedOrder && (
            <Box sx={{ mt: 1 }}>
              <Grid display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                {/* Left column */}
                <Box gridColumn="span 6">
                  <Typography variant="body2">
                    Total HT: {formatNumber(selectedOrder.total_ht)} TND
                  </Typography>
                  <Typography variant="body2">
                    Total TVA: {formatNumber(selectedOrder.total_tva)} TND
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    Total TTC: {formatNumber(selectedOrder.total_ttc)} TND
                  </Typography>
                </Box>
        
                {/* Right column */}
                <Box gridColumn="span 6">
                  {selectedOrder.withholding_tax_applied && (
                    <>
                      <Typography variant="body2">
                        Retenue à la source ({selectedOrder.withholding_tax_rate}%): {formatNumber(selectedOrder.withholding_tax_amount)} TND
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        Net à payer: {formatNumber(selectedOrder.total_ttc - selectedOrder.withholding_tax_amount)} TND
                      </Typography>
                    </>
                  )}
                  {selectedOrder.withholding_tax_excluded && (
                    <Typography variant="body2">
                      Retenue à la source: Exclue ({selectedOrder.withholding_exclusion_reason})
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedOrder?.items && selectedOrder.items.length ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produit</TableCell>
                  <TableCell>Quantité</TableCell>
                  <TableCell>Remise (%)</TableCell>
                  <TableCell>PU HT</TableCell>
                  <TableCell>Total HT</TableCell>
                  <TableCell>TVA</TableCell>
                  <TableCell>Total TTC</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedOrder.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.remise}%</TableCell>
                    <TableCell>{formatNumber(item.unit_price)} TND</TableCell>
                    <TableCell>{formatNumber(item.total_ht)} TND</TableCell>
                    <TableCell>{formatNumber(item.tva_amount)} TND</TableCell>
                    <TableCell>{formatNumber(item.total_ttc)} TND</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>Aucun produit</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewProductsDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* --- Modale ajouter produit --- */}
      <Dialog open={openAddProductDialog} onClose={() => {
        setOpenAddProductDialog(false);
        setError(null);
        setProductDialogTab(0);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={productDialogTab} onChange={(e, newValue) => setProductDialogTab(newValue)}>
              <Tab label="Sélectionner un produit" />
              <Tab label="Créer un nouveau produit" />
            </Tabs>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {productDialogTab === 0 ? (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel>Produit</InputLabel>
                <Select
                  native
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(Number(e.target.value))}
                  label="Produit"
                >
                  <option aria-label="None" value="" />
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.code && `(${p.code})`} - {Number(p.prix_unit).toFixed(2)} TND (TVA: {p.tva_rate}%)
                    </option>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Quantité"
                type="number"
                fullWidth
                margin="dense"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Remise (%)"
                type="number"
                fullWidth
                margin="dense"
                value={remise}
                onChange={(e) => setRemise(Number(e.target.value))}
                inputProps={{ min: 0, max: 100 }}
              />
            </>
          ) : (
            <>
              <TextField
                label="Désignation *"
                fullWidth
                margin="dense"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                error={!newProduct.name}
                helperText={!newProduct.name ? "Ce champ est requis" : ""}
              />
              <TextField
                label="Code produit"
                fullWidth
                margin="dense"
                value={newProduct.code}
                onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
              />
              <TextField
                label="Prix unitaire *"
                type="number"
                fullWidth
                margin="dense"
                value={newProduct.prix_unit}
                onChange={(e) => setNewProduct({ ...newProduct, prix_unit: Number(e.target.value) })}
                inputProps={{ step: "0.01", min: "0.01" }}
                error={!newProduct.prix_unit || newProduct.prix_unit <= 0}
                helperText={(!newProduct.prix_unit || newProduct.prix_unit <= 0) ? "Prix doit être supérieur à 0" : ""}
              />
              <TextField
                label="Taux de TVA (%)"
                type="number"
                fullWidth
                margin="dense"
                value={newProduct.tva_rate}
                onChange={(e) => setNewProduct({ ...newProduct, tva_rate: Number(e.target.value) })}
                inputProps={{ step: "0.01", min: "0", max: "100" }}
              />
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Catégorie *</InputLabel>
                <Select
                  native
                  value={newProduct.category_id || ""}
                  onChange={(e) => setNewProduct({
                    ...newProduct,
                    category_id: e.target.value ? Number(e.target.value) : null
                  })}
                  error={!newProduct.category_id}
                  label="Catégorie *"
                >
                  <option aria-label="None" value="" />
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                {!newProduct.category_id && (
                  <Typography variant="caption" color="error">
                    La catégorie est requise
                  </Typography>
                )}
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenAddProductDialog(false);
            setError(null);
          }}>Annuler</Button>
          {productDialogTab === 0 ? (
            <Button
              variant="contained"
              onClick={handleAddProduct}
              disabled={!selectedProduct}
            >
              Ajouter
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleCreateProduct}
              disabled={!newProduct.name || !newProduct.prix_unit || newProduct.prix_unit <= 0 || !newProduct.category_id}
            >
              Créer et ajouter
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* --- Modale modifier commande --- */}
      <Dialog open={openEditOrderDialog} onClose={() => setOpenEditOrderDialog(false)}>
        <DialogTitle>Modifier Commande</DialogTitle>
        <DialogContent>
          <TextField
            label="Référence"
            fullWidth
            margin="dense"
            value={editOrderData.reference}
            onChange={(e) => setEditOrderData({ ...editOrderData, reference: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Client</InputLabel>
            <Select
              native
              value={editOrderData.client}
              onChange={(e) => setEditOrderData({ ...editOrderData, client: e.target.value })}
              label="Client"
            >
              <option aria-label="None" value="" />
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              native
              value={editOrderData.status}
              onChange={(e) => setEditOrderData({ ...editOrderData, status: e.target.value })}
              label="Status"
            >
              <option value="DRAFT">Brouillon</option>
              <option value="CONFIRMED">Confirmé</option>
              <option value="PAID">Payé</option>
              <option value="DELIVERED">Livré</option>
              <option value="CANCELLED">Annulé</option>
            </Select>
          </FormControl>
          <TextField
            label="Notes"
            fullWidth
            margin="dense"
            value={editOrderData.notes}
            onChange={(e) => setEditOrderData({ ...editOrderData, notes: e.target.value })}
          />
          <TextField
            label="Date fin prévue"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={editOrderData.expected_finish_date}
            onChange={(e) => setEditOrderData({ ...editOrderData, expected_finish_date: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditOrderDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleEditOrder}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </div>
    </Protected>
  );
}
