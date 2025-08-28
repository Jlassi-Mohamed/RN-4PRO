"use client"
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import type { SxProps } from '@mui/material/styles';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

export interface Product {
  id: string;
  code: string;
  designation: string;
  prix_unitaire?: number;
  tva?: number;
  categorie?: string;
}

export interface LatestProductsProps {
  products?: Product[];
  sx?: SxProps;
}

export function LatestProducts({ products = [], sx }: LatestProductsProps): React.JSX.Element {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: Product): void => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleViewAll = (): void => {
    router.push('/dashboard/articles');
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Derniers articles" />
      <Divider />
      <List>
        {products.map((product, index) => (
          <ListItem divider={index < products.length - 1} key={product.id}>
            {/* <ListItemAvatar>
              {product.image ? (
                <Box component="img" src={product.image} sx={{ borderRadius: 1, height: '48px', width: '48px' }} />
              ) : (
                <Box
                  sx={{
                    borderRadius: 1,
                    backgroundColor: 'var(--mui-palette-neutral-200)',
                    height: '48px',
                    width: '48px',
                  }}
                />
              )}
            </ListItemAvatar> */}
            <ListItemText
              primary={product.designation}
              secondary={`Code: ${product.code}`}
              primaryTypographyProps={{ variant: 'subtitle1' }}
              secondaryTypographyProps={{ variant: 'body2' }}
            />
            <IconButton edge="end" onClick={(event) => handleMenuOpen(event, product)}>
              <DotsThreeVerticalIcon weight="bold" />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
          onClick={handleViewAll}
        >
          Voir tout
        </Button>
      </CardActions>

      {/* Details Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {selectedProduct && (
          <Box sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="subtitle2" gutterBottom>
              Détails de l'article
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Désignation:</strong> {selectedProduct.designation}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Code:</strong> {selectedProduct.code}
            </Typography>
            {selectedProduct.prix_unitaire && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Prix unitaire:</strong> {selectedProduct.prix_unitaire.toFixed(2)} TND
              </Typography>
            )}
            {selectedProduct.tva && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>TVA:</strong> {selectedProduct.tva}%
              </Typography>
            )}
            {selectedProduct.categorie && (
              <Typography variant="body2" color="text.secondary">
                <strong>Catégorie:</strong> {selectedProduct.categorie}
              </Typography>
            )}
          </Box>
        )}
      </Menu>
    </Card>
  );
}
