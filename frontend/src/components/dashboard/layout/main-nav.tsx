'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { usePopover } from '@/hooks/use-popover';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import { useRouter } from 'next/navigation';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [role, setRole] = React.useState<string | null>(null);

  const userPopover = usePopover<HTMLDivElement>();
  const router = useRouter();

  // read role from localStorage.user (expected shape: { username: 'stock', role: 'stock' })
  React.useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      setRole(user?.role ?? null);
    } catch (err) {
      setRole(null);
    }
  }, []);

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
          </Stack>

          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            {/* Clients button: hidden for role === 'stock' */}
            {role !== 'stock' && (
              <Tooltip title="Clients">
<IconButton> <UsersIcon onClick={() => router.push('/dashboard/clients')}/> </IconButton>
              </Tooltip>
            )}

            {/* Devis / Orders button: hidden for role === 'stock' */}
            {role !== 'stock' && (
              <Tooltip title="Devis / Orders">
                <IconButton onClick={() => router.push('/dashboard/devis')}>
                  <Badge badgeContent={4} color="success" variant="dot">
                    <ShoppingCartIcon className="w-5 h-5" />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src="/assets/avatar.png"
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>

      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />

      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
