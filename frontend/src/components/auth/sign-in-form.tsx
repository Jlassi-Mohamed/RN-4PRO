'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react/dist/ssr';
import { config } from '@/config';

const schema = zod.object({
  username: zod.string().min(1, { message: "Nom d'utilisateur requis" }),
  password: zod.string().min(1, { message: 'Mot de passe requis' }),
});

type Values = zod.infer<typeof schema>;

export function SignInForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: { username: '', password: '' },
    resolver: zodResolver(schema),
  });

const onSubmit = async (values: Values) => {
  setIsPending(true);
  setError(null);

  try {
    const response = await fetch(
      `${config.apiBaseUrl}/auth/login/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('Login failed:', text);
      setError('Nom d’utilisateur ou mot de passe incorrect');
      return;
    }

    const data = await response.json();

    // Save tokens + user
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    // Redirect based on role
    if (data.user?.role === 'stock') {
      router.replace('/dashboard/stock');
    } else {
      router.replace('/dashboard'); // admin or manager
    }
  } catch (error) {
    console.error('Login error:', error);
    setError("Erreur lors de la connexion. Veuillez réessayer.");
  } finally {
    setIsPending(false);
  }
};


  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Connexion</Typography>
        <Typography color="text.secondary" variant="body2">
          Système de gestion
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* Username */}
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <FormControl error={Boolean(errors.username)}>
                <InputLabel>Nom d&apos;utilisateur</InputLabel>
                <OutlinedInput {...field} label="Nom d'utilisateur" />
                {errors.username && (
                  <FormHelperText>{errors.username.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Mot de passe</InputLabel>
              <OutlinedInput
                {...field}
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                autoComplete="current-password" // tells browser this is login, not new password
                endAdornment={
                  showPassword ? (
                    <EyeIcon
                      cursor="pointer"
                      fontSize="var(--icon-fontSize-md)"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <EyeSlashIcon
                      cursor="pointer"
                      fontSize="var(--icon-fontSize-md)"
                      onClick={() => setShowPassword(true)}
                    />
                  )
                }
              />

                {errors.password && (
                  <FormHelperText>{errors.password.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* Error */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Submit */}
          <Button
            disabled={isPending}
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
          >
            {isPending ? 'Connexion...' : 'Se connecter'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
