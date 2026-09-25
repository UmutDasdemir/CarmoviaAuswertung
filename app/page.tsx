'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarRange,
  ChevronRight,
  CircleAlert,
  Gauge,
  LayoutDashboard,
  Minus,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type MonthlyRecord = {
  month: string;
  customerId: string;
  customerName: string;
  orders: number;
  revenue: number;
  cost: number;
};

type Trend = 'growth' | 'stable' | 'watch' | 'decline';

const demoCustomers = [
  {
    id: 'atlas',
    name: 'Atlas Autohaus',
    orders: [12, 13, 14, 16, 18, 20, 23, 27],
    revenue: [18400, 19700, 21800, 25100, 28700, 32200, 37400, 45100],
    margin: [0.184, 0.191, 0.196, 0.204, 0.211, 0.216, 0.223, 0.229],
  },
  {
    id: 'elbe',
    name: 'Elbe Mobility',
    orders: [31, 30, 28, 27, 24, 20, 17, 13],
    revenue: [49800, 48300, 45100, 43800, 38900, 32100, 27400, 20500],
    margin: [0.218, 0.216, 0.208, 0.203, 0.194, 0.181, 0.169, 0.154],
  },
  {
    id: 'rhein',
    name: 'Rhein Fleet Services',
    orders: [22, 23, 21, 24, 23, 25, 24, 25],
    revenue: [35200, 36900, 34100, 38800, 37500, 40700, 39600, 41200],
    margin: [0.207, 0.204, 0.211, 0.209, 0.213, 0.208, 0.215, 0.212],
  },
  {
    id: 'main',
    name: 'MainDrive Handel',
    orders: [18, 20, 19, 21, 19, 18, 16, 15],
    revenue: [28600, 31800, 30400, 34200, 30900, 29600, 26500, 24700],
    margin: [0.201, 0.207, 0.203, 0.198, 0.187, 0.176, 0.165, 0.158],
  },
  {
    id: 'nord',
    name: 'Nordstern Automotive',
    orders: [8, 9, 11, 13, 15, 17, 20, 22],
    revenue: [12100, 13900, 17200, 20600, 24100, 27800, 33400, 36900],
    margin: [0.162, 0.168, 0.177, 0.186, 0.193, 0.201, 0.209, 0.217],
  },
  {
    id: 'west',
    name: 'Westpark Fleet',
    orders: [3, 5, 7, 8, 10, 12, 14, 17],
    revenue: [4800, 7900, 11200, 13100, 16400, 20100, 23600, 28900],
    margin: [0.148, 0.155, 0.161, 0.169, 0.176, 0.184, 0.191, 0.199],
  },
];

const demoMonths = [
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
];

const demoRecords: MonthlyRecord[] = demoCustomers.flatMap((customer) =>
  demoMonths.map((month, index) => ({
    month,
    customerId: customer.id,
    customerName: customer.name,
    orders: customer.orders[index],
    revenue: customer.revenue[index],
    cost: Math.round(customer.revenue[index] * (1 - customer.margin[index])),
  })),
);

const chartConfig = {
  revenue: { label: 'Umsatz', color: 'var(--chart-1)' },
  margin: { label: 'Marge', color: 'var(--chart-2)' },
  orders: { label: 'Aufträge', color: 'var(--chart-3)' },
} satisfies ChartConfig;

const euro = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat('de-DE');

function currentCalendarMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string, long = false) {
  const [year, value] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('de-DE', {
    month: long ? 'long' : 'short',
    year: long ? 'numeric' : undefined,
  }).format(new Date(year, value - 1, 1));
}

function change(current: number, previous: number) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function sum(rows: MonthlyRecord[]) {
  const revenue = rows.reduce((total, row) => total + row.revenue, 0);
  const cost = rows.reduce((total, row) => total + row.cost, 0);
  const margin = revenue - cost;
  return {
    orders: rows.reduce((total, row) => total + row.orders, 0),
    revenue,
    cost,
    margin,
    marginPercent: revenue ? (margin / revenue) * 100 : 0,
  };
}

function classify(
  data: MonthlyRecord[],
  customerId: string,
): { trend: Trend; score: number } {
  const currentMonth = currentCalendarMonth();
  const customerRows = data
    .filter(
      (row) => row.customerId === customerId && row.month < currentMonth,
    )
    .sort((a, b) => a.month.localeCompare(b.month));
  const prior = sum(customerRows.slice(-6, -3));
  const recent = sum(customerRows.slice(-3));
  const orderChange = change(recent.orders, prior.orders);
  const revenueChange = change(recent.revenue, prior.revenue);
  const score = orderChange * 0.55 + revenueChange * 0.45;
  if (score >= 15) return { trend: 'growth', score };
  if (score <= -30) return { trend: 'decline', score };
  if (score <= -12 || recent.marginPercent < prior.marginPercent - 2)
    return { trend: 'watch', score };
  return { trend: 'stable', score };
}

const trendMeta: Record<
  Trend,
  { label: string; className: string; icon: typeof TrendingUp }
> = {
  growth: {
    label: 'Hochlauf',
    className: 'trend-growth',
    icon: TrendingUp,
  },
  stable: { label: 'Stabil', className: 'trend-stable', icon: Minus },
  watch: {
    label: 'Schwächelt',
    className: 'trend-watch',
    icon: CircleAlert,
  },
  decline: {
    label: 'Rückgang',
    className: 'trend-decline',
    icon: TrendingDown,
  },
};

function Delta({ value }: { value: number }) {
  const positive = value > 0.05;
  const negative = value < -0.05;
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  return (
    <span
      className={`delta ${positive ? 'positive' : negative ? 'negative' : ''}`}
    >
      <Icon aria-hidden="true" />
      {Math.abs(value).toLocaleString('de-DE', { maximumFractionDigits: 1 })}%
    </span>
  );
}

export default function Home() {
  const [records, setRecords] = useState<MonthlyRecord[]>(demoRecords);
  const [dataMode, setDataMode] = useState<'demo' | 'live'>('demo');
  const [selectedMonth, setSelectedMonth] = useState(demoMonths.at(-1)!);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [trendFilter, setTrendFilter] = useState<Trend | 'all'>('all');

  useEffect(() => {
    const url = new URL('data/customer-monthly.json', window.location.href);
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('Kein Carmovia-Datenexport gefunden.');
        return response.json();
      })
      .then((payload) => {
        const parsed = payload as { records?: MonthlyRecord[] };
        if (Array.isArray(parsed.records) && parsed.records.length > 0) {
          setRecords(parsed.records);
          const availableMonths = [
            ...new Set(parsed.records.map((row) => row.month)),
          ].sort();
          const latestFullMonth =
            availableMonths
              .filter((month) => month < currentCalendarMonth())
              .at(-1) ?? availableMonths.at(-1);
          if (latestFullMonth) setSelectedMonth(latestFullMonth);
          setDataMode('live');
        }
      })
      .catch(() => undefined);
  }, []);

  const months = useMemo(
    () => [...new Set(records.map((row) => row.month))].sort(),
    [records],
  );
  const customers = useMemo(() => {
    const byId = new Map<string, { id: string; name: string }>();
    records.forEach((row) =>
      byId.set(row.customerId, { id: row.customerId, name: row.customerName }),
    );
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }, [records]);

  const latestFullMonth =
    months.filter((month) => month < currentCalendarMonth()).at(-1) ??
    months.at(-1) ??
    selectedMonth;

  const activeMonth = months.includes(selectedMonth)
    ? selectedMonth
    : (months.at(-1) ?? selectedMonth);
  const monthIndex = months.indexOf(activeMonth);
  const previousMonth = months[Math.max(0, monthIndex - 1)];
  const selectedRows = records.filter((row) => row.month === activeMonth);
  const previousRows = records.filter((row) => row.month === previousMonth);
  const totals = sum(selectedRows);
  const previousTotals = sum(previousRows);

  const tableRows = useMemo(
    () =>
      customers
        .map((customer) => {
          const current = records.find(
            (row) =>
              row.month === activeMonth && row.customerId === customer.id,
          )!;
          const previous = records.find(
            (row) =>
              row.month === previousMonth && row.customerId === customer.id,
          )!;
          const metrics = sum([current]);
          const { trend, score } = classify(records, customer.id);
          return {
            ...customer,
            current,
            metrics,
            trend,
            score,
            orderChange: change(current.orders, previous.orders),
            revenueChange: change(current.revenue, previous.revenue),
          };
        })
        .filter(
          (row) =>
            row.name.toLowerCase().includes(query.toLowerCase()) &&
            (trendFilter === 'all' || row.trend === trendFilter),
        )
        .sort((a, b) => a.score - b.score),
    [activeMonth, customers, previousMonth, query, records, trendFilter],
  );

  const trendData = months.map((month) => {
    const monthRows = records.filter(
      (row) =>
        row.month === month &&
        (selectedCustomer === 'all' || row.customerId === selectedCustomer),
    );
    const metrics = sum(monthRows);
    return { month: monthLabel(month), ...metrics };
  });

  const selectedName =
    selectedCustomer === 'all'
      ? 'Gesamtentwicklung'
      : customers.find((customer) => customer.id === selectedCustomer)?.name;
  const riskCount = customers.filter((customer) =>
    ['watch', 'decline'].includes(classify(records, customer.id).trend),
  ).length;
  const growthCount = customers.filter(
    (customer) => classify(records, customer.id).trend === 'growth',
  ).length;

  const metricCards = [
    {
      label: 'Aufträge',
      value: number.format(totals.orders),
      delta: change(totals.orders, previousTotals.orders),
      caption: `vs. ${monthLabel(previousMonth)}`,
      icon: BarChart3,
    },
    {
      label: 'Umsatz',
      value: euro.format(totals.revenue),
      delta: change(totals.revenue, previousTotals.revenue),
      caption: `vs. ${monthLabel(previousMonth)}`,
      icon: Gauge,
    },
    {
      label: 'Marge',
      value: euro.format(totals.margin),
      delta: change(totals.margin, previousTotals.margin),
      caption: `vs. ${monthLabel(previousMonth)}`,
      icon: Sparkles,
    },
    {
      label: 'Marge %',
      value: `${totals.marginPercent.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`,
      delta: totals.marginPercent - previousTotals.marginPercent,
      caption: 'Prozentpunkte',
      icon: TrendingUp,
    },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">C</span>
          <span>
            <strong>carmovia</strong>
            <small>Customer Intelligence</small>
          </span>
        </div>
        <nav aria-label="Hauptnavigation">
          <a className="nav-item active" href="#overview">
            <LayoutDashboard aria-hidden="true" /> Überblick
          </a>
          <a className="nav-item" href="#customers">
            <UsersRound aria-hidden="true" /> Kunden
          </a>
          <a className="nav-item" href="#development">
            <BarChart3 aria-hidden="true" /> Entwicklung
          </a>
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          <div>
            <strong>{dataMode === 'live' ? 'Carmovia-Daten' : 'Beispieldaten'}</strong>
            <small>
              Letzter voller Monat: {monthLabel(latestFullMonth, true)}
            </small>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Kundenaktivität</p>
            <h1>Monatliche Performance</h1>
          </div>
          <div className="topbar-actions">
            <Badge variant="outline" className="source-badge">
              <span className="status-dot" /> Hauptübersicht
            </Badge>
            <NativeSelect
              aria-label="Auswertungsmonat"
              value={activeMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            >
              {months.slice(1).map((month) => (
                <NativeSelectOption key={month} value={month}>
                  {monthLabel(month, true)}
                  {month === currentCalendarMonth() ? ' (laufend)' : ''}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </header>

        <div className="content" id="overview">
          <section className="signal-strip" aria-label="Zusammenfassung">
            <div>
              <span className="signal-icon signal-icon-negative">
                <TrendingDown aria-hidden="true" />
              </span>
              <p>
                <strong>{riskCount} Kunden</strong>
                <span>mit nachlassender Aktivität</span>
              </p>
            </div>
            <div>
              <span className="signal-icon signal-icon-positive">
                <TrendingUp aria-hidden="true" />
              </span>
              <p>
                <strong>{growthCount} Kunden</strong>
                <span>im deutlichen Hochlauf</span>
              </p>
            </div>
            <p className="signal-explanation">
              Bewertung aus Auftrags- und Umsatztrend der letzten drei vollen
              Monate gegenüber den drei Monaten davor.
            </p>
          </section>

          <section className="metric-grid" aria-label="Monatskennzahlen">
            {metricCards.map((metric) => (
              <Card key={metric.label} className="metric-card">
                <CardHeader>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardAction>
                    <metric.icon aria-hidden="true" />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="metric-value">{metric.value}</p>
                  <div className="metric-foot">
                    <Delta value={metric.delta} />
                    <span>{metric.caption}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="analysis-grid" id="development">
            <Card className="chart-card">
              <CardHeader>
                <CardTitle>{selectedName}</CardTitle>
                <CardDescription>
                  Umsatz, Marge und Auftragsvolumen nach Monat
                </CardDescription>
                <CardAction>
                  <NativeSelect
                    aria-label="Kunde für Verlaufsdiagramm"
                    value={selectedCustomer}
                    onChange={(event) => setSelectedCustomer(event.target.value)}
                  >
                    <NativeSelectOption value="all">
                      Alle Kunden
                    </NativeSelectOption>
                    {customers.map((customer) => (
                      <NativeSelectOption key={customer.id} value={customer.id}>
                        {customer.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </CardAction>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[310px] w-full aspect-auto"
                >
                  <ComposedChart data={trendData} margin={{ left: 0, right: 4 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      yAxisId="money"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                      width={38}
                    />
                    <YAxis
                      yAxisId="orders"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'var(--muted)' }}
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <>
                              <span className="text-muted-foreground">
                                {chartConfig[name as keyof typeof chartConfig]?.label}
                              </span>
                              <span className="ml-auto font-mono font-medium tabular-nums">
                                {name === 'orders'
                                  ? number.format(Number(value))
                                  : euro.format(Number(value))}
                              </span>
                            </>
                          )}
                        />
                      }
                    />
                    <Bar
                      yAxisId="money"
                      dataKey="revenue"
                      fill="var(--color-revenue)"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={42}
                    />
                    <Bar
                      yAxisId="money"
                      dataKey="margin"
                      fill="var(--color-margin)"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={42}
                    />
                    <Line
                      yAxisId="orders"
                      dataKey="orders"
                      stroke="var(--color-orders)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: 'var(--color-orders)' }}
                    />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="focus-card">
              <CardHeader>
                <CardTitle>Handlungsfokus</CardTitle>
                <CardDescription>
                  Kunden mit der stärksten Veränderung
                </CardDescription>
              </CardHeader>
              <CardContent className="focus-list">
                {tableRows.slice(0, 4).map((row) => {
                  const meta = trendMeta[row.trend];
                  const Icon = meta.icon;
                  return (
                    <button
                      className="focus-row"
                      key={row.id}
                      onClick={() => setSelectedCustomer(row.id)}
                    >
                      <span className={`trend-icon ${meta.className}`}>
                        <Icon aria-hidden="true" />
                      </span>
                      <span>
                        <strong>{row.name}</strong>
                        <small>{meta.label} · 6-Monatsvergleich</small>
                      </span>
                      <Delta value={row.score} />
                      <ChevronRight aria-hidden="true" />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          <Card className="customer-card" id="customers">
            <CardHeader>
              <CardTitle>Kundenvergleich</CardTitle>
              <CardDescription>
                {monthLabel(activeMonth, true)} · sortiert nach schwächster
                Entwicklung
              </CardDescription>
              <CardAction className="table-actions">
                <div className="search-field">
                  <Search aria-hidden="true" />
                  <Input
                    aria-label="Kunde suchen"
                    placeholder="Kunde suchen"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <NativeSelect
                  aria-label="Trend filtern"
                  value={trendFilter}
                  onChange={(event) =>
                    setTrendFilter(event.target.value as Trend | 'all')
                  }
                >
                  <NativeSelectOption value="all">Alle Trends</NativeSelectOption>
                  <NativeSelectOption value="decline">Rückgang</NativeSelectOption>
                  <NativeSelectOption value="watch">Schwächelt</NativeSelectOption>
                  <NativeSelectOption value="stable">Stabil</NativeSelectOption>
                  <NativeSelectOption value="growth">Hochlauf</NativeSelectOption>
                </NativeSelect>
              </CardAction>
            </CardHeader>
            <CardContent className="table-content">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aufträge</TableHead>
                    <TableHead className="text-right">Umsatz</TableHead>
                    <TableHead className="text-right">Marge EUR</TableHead>
                    <TableHead className="text-right">Marge %</TableHead>
                    <TableHead className="text-right">6M-Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableRows.map((row) => {
                    const meta = trendMeta[row.trend];
                    const Icon = meta.icon;
                    return (
                      <TableRow
                        key={row.id}
                        className="customer-row"
                        data-state={selectedCustomer === row.id ? 'selected' : undefined}
                        onClick={() => setSelectedCustomer(row.id)}
                      >
                        <TableCell>
                          <button className="customer-name">
                            <span>
                              <Building2 aria-hidden="true" />
                            </span>
                            {row.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={meta.className}>
                            <Icon aria-hidden="true" /> {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <strong>{number.format(row.metrics.orders)}</strong>
                          <Delta value={row.orderChange} />
                        </TableCell>
                        <TableCell className="text-right">
                          <strong>{euro.format(row.metrics.revenue)}</strong>
                          <Delta value={row.revenueChange} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {euro.format(row.metrics.margin)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {row.metrics.marginPercent.toLocaleString('de-DE', {
                            maximumFractionDigits: 1,
                          })}{' '}
                          %
                        </TableCell>
                        <TableCell className="text-right">
                          <Delta value={row.score} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <footer className="page-footer">
            <span>
              <CalendarRange aria-hidden="true" /> Grundlage: volle Kalendermonate
            </span>
            <span>
              Umsatz = VK · Marge EUR = VK − EK · Marge % = Marge / Umsatz
            </span>
          </footer>
        </div>
      </section>
    </main>
  );
}
