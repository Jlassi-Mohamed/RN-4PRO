export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password'
  },
  dashboard: {
    overview: '/dashboard',
    fournisseurs: '/dashboard/fournisseurs',
    clients: '/dashboard/clients',
    stock: '/dashboard/stock',
    devis: '/dashboard/devis',
    employes: '/dashboard/employes',
    outils: '/dashboard/outils',
    parametres: '/dashboard/settings',
    rapports: '/dashboard/rapports',
    articles: '/dashboard/articles',
    // account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
