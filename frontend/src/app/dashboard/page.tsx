import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { config } from '@/config';
import { Budget } from '@/components/dashboard/overview/budget';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { Sales } from '@/components/dashboard/overview/sales';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';
import Protected from '@/components/Protected';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

/**
 * Generic fetch that returns both data and an error (if any).
 * It does NOT substitute "nice" defaults — it returns real server values (including 0).
 */
async function fetchData<T>(url: string): Promise<{ data: T | null; error?: string }> {
  try {
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      // include server status + optional message
      let bodyText = '';
      try { bodyText = await response.text(); } catch {}
      const errMsg = `${response.status} ${response.statusText}${bodyText ? ` — ${bodyText}` : ''}`;
      return { data: null, error: errMsg };
    }

    const json = await response.json();
    return { data: json as T, error: undefined };
  } catch (err: any) {
    return { data: null, error: err?.message ?? String(err) };
  }
}

/**
 * Each getter returns { data, error } so caller can decide what to show.
 * We intentionally do not fill-in "nice" defaults for missing / falsy values returned by the server.
 */

async function getOrders(): Promise<{ data: any[] | null; error?: string }> {
  const res = await fetchData<any[]>(`${config.apiBaseUrl}/orders`);
  if (res.data === null) return res;

  const mapped = res.data.map((order: any) => ({
    id: order.reference ?? (order.id ? `ORD-${order.id}` : undefined),
    customer: { name: order.client_name ?? 'Client inconnu' },
    // keep server value even if it's 0 or "0.0"
    amount: order.items?.[0]?.total_ttc ? parseFloat(order.items[0].total_ttc) : (order.total_ttc ?? order.amount ?? 0),
    status: mapStatus(order.status),
    createdAt: order.created_at ? new Date(order.created_at) : undefined,
  }));

  return { data: mapped, error: undefined };
}

async function getArticles(): Promise<{ data: any[] | null; error?: string }> {
  const res = await fetchData<any[]>(`${config.apiBaseUrl}/products`);
  if (res.data === null) return res;

  const mapped = res.data.map((article: any) => ({
    id: article.id?.toString() ?? `ART-${Math.random().toString(36).substr(2, 9)}`,
    code: article.code ?? 'N/A',
    designation: article.name ?? 'Article sans nom',
    prix_unitaire: article.prix_unit !== undefined && article.prix_unit !== null ? parseFloat(article.prix_unit) : undefined,
    tva: article.tva_rate !== undefined && article.tva_rate !== null ? parseFloat(article.tva_rate) : undefined,
    categorie: article.categorie ?? 'Non catégorisé',
  }));

  return { data: mapped, error: undefined };
}

async function getSalesData(): Promise<{ data: { thisYear: number[]; lastYear: number[] } | null; error?: string }> {
  const res = await fetchData<any>(`${config.apiBaseUrl}/orders/sales/monthly/`);
  if (res.data === null) return res;

  // server may return keys like total_profit, current_year, previous_year, thisYear, lastYear
  const thisYear = Array.isArray(res.data.current_year) ? res.data.current_year
    : Array.isArray(res.data.thisYear) ? res.data.thisYear
    : (res.data.current_year_monthly ?? null);

  const lastYear = Array.isArray(res.data.previous_year) ? res.data.previous_year
    : Array.isArray(res.data.lastYear) ? res.data.lastYear
    : (res.data.previous_year_monthly ?? null);

  return {
    data: {
      thisYear: thisYear ?? Array(12).fill(0),
      lastYear: lastYear ?? Array(12).fill(0)
    },
    error: undefined
  };
}

async function getTotalCustomers(): Promise<{ data: { count: number | null; diff?: number } | null; error?: string }> {
  const res = await fetchData<any>(`${config.apiBaseUrl}/clients/count/`);
  if (res.data === null) return res;

  // use server-provided number even if it's 0
  const count = typeof res.data.total_clients === 'number'
    ? res.data.total_clients
    : (typeof res.data.count === 'number' ? res.data.count : null);

  return {
    data: {
      count: count,
      diff: typeof res.data.diff === 'number' ? res.data.diff : undefined
    },
    error: undefined
  };
}

async function getOrderStatusCount(): Promise<{ data: { draft: number; paid: number; cancelled: number } | null; error?: string }> {
  const res = await fetchData<any>(`${config.apiBaseUrl}/orders/status-count/`);
  if (res.data === null) return res;

  // use server values and default to 0 only if keys are missing (server may legitimately return 0)
  const draft = typeof res.data.DRAFT === 'number' ? res.data.DRAFT : (typeof res.data.draft === 'number' ? res.data.draft : 0);
  const paid = typeof res.data.PAID === 'number' ? res.data.PAID : (typeof res.data.paid === 'number' ? res.data.paid : 0);
  const cancelled = typeof res.data.CANCELLED === 'number' ? res.data.CANCELLED : (typeof res.data.cancelled === 'number' ? res.data.cancelled : 0);

  return { data: { draft, paid, cancelled }, error: undefined };
}

async function getDraftOrdersCount(): Promise<{ data: number | null; error?: string }> {
  const res = await fetchData<any>(`${config.apiBaseUrl}/orders/count/draft/`);
  if (res.data === null) return res;

  // server may return { draft_orders_count: 0 } or a raw number
  if (typeof res.data === 'number') return { data: res.data, error: undefined };
  if (typeof res.data.draft_orders_count === 'number') return { data: res.data.draft_orders_count, error: undefined };
  if (typeof res.data.count === 'number') return { data: res.data.count, error: undefined };

  return { data: null, error: 'Unexpected draft count response shape' };
}

async function getFournisseursCount(): Promise<{ data: { count: number | null; diff?: number } | null; error?: string }> {
  const res = await fetchData<any>(`${config.apiBaseUrl}/fournisseurs/count`);
  if (res.data === null) return res;

  const count = typeof res.data === 'number' ? res.data : (typeof res.data.total_fournisseurs === 'number' ? res.data.total_fournisseurs : (typeof res.data.count === 'number' ? res.data.count : null));

  return { data: { count, diff: typeof res.data.diff === 'number' ? res.data.diff : undefined }, error: undefined };
}

async function getTotalProfit(): Promise<{ data: { value: string; raw?: number } | null; error?: string }> {
  const res = await fetchData<any>(`${config.apiBaseUrl}/orders/total-profit/`);
  if (res.data === null) return res;

  // server may return { total_profit: 0.0 } or { profit: 15000 } etc.
  const profitRaw = typeof res.data.total_profit === 'number' ? res.data.total_profit : (typeof res.data.profit === 'number' ? res.data.profit : (typeof res.data.amount === 'number' ? res.data.amount : null));

  const formattedProfit = profitRaw !== null && profitRaw !== undefined
    ? (profitRaw >= 1000 ? `$${(profitRaw / 1000).toFixed(1)}k` : `$${profitRaw}`)
    : undefined;

  return { data: { value: formattedProfit ?? '—', raw: profitRaw ?? undefined }, error: undefined };
}

// Map API status to component status
function mapStatus(apiStatus: string): 'brouillon' | 'livré' | 'annulé' | 'confirmé' | 'payé' {
  const statusMap: Record<string, 'brouillon' | 'livé' | 'livré' | 'annulé' | 'confirmé' | 'payé'> = {
    'DRAFT': 'brouillon',
    'DELIVERED': 'livré',
    'CANCELLED': 'annulé',
    'CONFIRMED': 'confirmé',
    'PAID': 'payé',
    'PENDING': 'brouillon',
  };

  return statusMap[apiStatus?.toUpperCase()] || 'brouillon';
}

export default async function Page(): Promise<React.JSX.Element> {
  // Fetch everything in parallel
  const [
    ordersRes,
    articlesRes,
    salesRes,
    customersRes,
    statusCountRes,
    draftCountRes,
    fournisseursRes,
    profitRes
  ] = await Promise.all([
    getOrders(),
    getArticles(),
    getSalesData(),
    getTotalCustomers(),
    getOrderStatusCount(),
    getDraftOrdersCount(),
    getFournisseursCount(),
    getTotalProfit()
  ]);

  // Collect errors to show user
  const errors: string[] = [];
  [ordersRes, articlesRes, salesRes, customersRes, statusCountRes, draftCountRes, fournisseursRes, profitRes].forEach((r, idx) => {
    if ((r as any)?.error) {
      const prefix = ['orders', 'articles', 'sales', 'customers', 'statusCount', 'draftCount', 'fournisseurs', 'profit'][idx];
      errors.push(`${prefix}: ${(r as any).error}`);
    }
  });

  const orders = ordersRes.data ?? [];
  const articles = articlesRes.data ?? [];
  const salesData = salesRes.data ?? { thisYear: Array(12).fill(0), lastYear: Array(12).fill(0) };

  const customersData = customersRes.data ?? { count: null, diff: undefined };
  const statusCount = statusCountRes.data ?? { draft: 0, paid: 0, cancelled: 0 };
  const draftCount = draftCountRes.data ?? null;
  const fournisseursData = fournisseursRes.data ?? { count: null, diff: undefined };
  const profitData = profitRes.data ?? { value: '—', raw: undefined };

  const latestOrders = (orders as any[]).slice(0, 7);
  const latestArticles = (articles as any[]).slice(0, 5);

  // Format the customer count for display; show '—' when count is null to indicate missing data / error
  const formattedCustomerCount = typeof customersData.count === 'number'
    ? (customersData.count >= 1000 ? `${(customersData.count / 1000).toFixed(1)}k` : customersData.count.toString())
    : '—';

  // Format the fournisseurs count similarly
  const formattedFournisseursCount = typeof fournisseursData.count === 'number'
    ? (fournisseursData.count >= 1000 ? `${(fournisseursData.count / 1000).toFixed(1)}k` : fournisseursData.count.toString())
    : '—';

  // Calculate total orders for traffic chart (if statusCount came from server)
  const totalOrders = (statusCount.draft ?? 0) + (statusCount.paid ?? 0) + (statusCount.cancelled ?? 0);
  const trafficData = totalOrders > 0 ? [
    Math.round(((statusCount.draft ?? 0) / totalOrders) * 100),
    Math.round(((statusCount.paid ?? 0) / totalOrders) * 100),
    Math.round(((statusCount.cancelled ?? 0) / totalOrders) * 100)
  ] : [0, 0, 0];

  return (
    <Protected allowedRoles={['admin', 'manager']}>
    <Box>
      {/* tiny message area for server errors */}
      {errors.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Alert severity="warning" variant="outlined">
              Certaines données n'ont pas pu être chargées : {errors.join(' · ')}
            </Alert>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid
          size={{
            lg: 3,
            sm: 6,
            xs: 12,
          }}
        >
          <Budget
            diff={fournisseursData.diff}
            trend="up"
            sx={{ height: '100%' }}
            value={`${formattedFournisseursCount}`}
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            sm: 6,
            xs: 12,
          }}
        >
          <TotalCustomers
            diff={customersData.diff}
            trend={typeof customersData.diff === 'number' && customersData.diff >= 0 ? "up" : "down"}
            sx={{ height: '100%' }}
            value={formattedCustomerCount}
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            sm: 6,
            xs: 12,
          }}
        >
          <TasksProgress
            sx={{ height: '100%' }}
            // show the real draft count if available, otherwise display 0 to avoid crash inside component
            value={typeof draftCount === 'number' ? draftCount : 0}
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            sm: 6,
            xs: 12,
          }}
        >
          <TotalProfit
            sx={{ height: '100%' }}
            value={profitData.value}
          />
        </Grid>
        <Grid
          size={{
            lg: 8,
            xs: 12,
          }}
        >
          <Sales
            chartSeries={[
              { name: 'This year', data: salesData.thisYear },
              { name: 'Last year', data: salesData.lastYear },
            ]}
            sx={{ height: '100%' }}
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 6,
            xs: 12,
          }}
        >
          <Traffic
            chartSeries={trafficData}
            labels={['Brouillon', 'Payé', 'Annulé']}
            sx={{ height: '100%' }}
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 6,
            xs: 12,
          }}
        >
          <LatestProducts
            products={latestArticles}
            sx={{ height: '100%' }}
          />
        </Grid>
        <Grid
          size={{
            lg: 8,
            md: 12,
            xs: 12,
          }}
        >
          <LatestOrders
            orders={latestOrders}
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>
    </Box>
    </Protected>
  );
}
