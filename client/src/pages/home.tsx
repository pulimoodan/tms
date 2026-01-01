import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  ShippingTruck02Icon,
  PackageIcon,
  UserGroupIcon,
  ArrowUp01Icon,
  DashboardSquare02Icon,
} from '@hugeicons/core-free-icons';
import { PageTitle } from '@/components/ui/page-title';
import { HugeiconsIcon } from '@hugeicons/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import { api } from '@/lib/api';

const ordersChartConfig = {
  orders: {
    label: 'Orders',
    color: 'hsl(var(--chart-1))',
  },
  delivered: {
    label: 'Delivered',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

const tripsChartConfig = {
  active: {
    label: 'Active Trips',
    color: 'hsl(var(--chart-4))',
  },
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

const fleetChartConfig = {
  utilization: {
    label: 'Fleet Utilization',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const mockOrdersData = [
  { month: 'Jan', orders: 45, delivered: 38 },
  { month: 'Feb', orders: 52, delivered: 45 },
  { month: 'Mar', orders: 48, delivered: 42 },
  { month: 'Apr', orders: 61, delivered: 55 },
  { month: 'May', orders: 55, delivered: 50 },
  { month: 'Jun', orders: 67, delivered: 62 },
  { month: 'Jul', orders: 72, delivered: 68 },
  { month: 'Aug', orders: 68, delivered: 65 },
  { month: 'Sep', orders: 75, delivered: 71 },
  { month: 'Oct', orders: 80, delivered: 76 },
  { month: 'Nov', orders: 85, delivered: 81 },
  { month: 'Dec', orders: 92, delivered: 88 },
];

const mockRevenueData = [
  { month: 'Jan', revenue: 125000 },
  { month: 'Feb', revenue: 145000 },
  { month: 'Mar', revenue: 138000 },
  { month: 'Apr', revenue: 165000 },
  { month: 'May', revenue: 152000 },
  { month: 'Jun', revenue: 178000 },
  { month: 'Jul', revenue: 195000 },
  { month: 'Aug', revenue: 188000 },
  { month: 'Sep', revenue: 210000 },
  { month: 'Oct', revenue: 225000 },
  { month: 'Nov', revenue: 240000 },
  { month: 'Dec', revenue: 265000 },
];

const mockTripsData = [
  { month: 'Jan', active: 12, completed: 45 },
  { month: 'Feb', active: 15, completed: 52 },
  { month: 'Mar', active: 18, completed: 48 },
  { month: 'Apr', active: 22, completed: 61 },
  { month: 'May', active: 20, completed: 55 },
  { month: 'Jun', active: 25, completed: 67 },
  { month: 'Jul', active: 28, completed: 72 },
  { month: 'Aug', active: 26, completed: 68 },
  { month: 'Sep', active: 30, completed: 75 },
  { month: 'Oct', active: 32, completed: 80 },
  { month: 'Nov', active: 35, completed: 85 },
  { month: 'Dec', active: 38, completed: 92 },
];

const mockFleetData = [
  { month: 'Jan', utilization: 68 },
  { month: 'Feb', utilization: 72 },
  { month: 'Mar', utilization: 70 },
  { month: 'Apr', utilization: 75 },
  { month: 'May', utilization: 73 },
  { month: 'Jun', utilization: 78 },
  { month: 'Jul', utilization: 82 },
  { month: 'Aug', utilization: 80 },
  { month: 'Sep', utilization: 85 },
  { month: 'Oct', utilization: 88 },
  { month: 'Nov', utilization: 90 },
  { month: 'Dec', utilization: 92 },
];

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const [ordersRes, tripsRes, vehiclesRes, driversRes] = await Promise.all([
          api.get('/orders?limit=1'),
          api.get('/trips?limit=1'),
          api.get('/vehicles?limit=1'),
          api.get('/drivers?limit=1'),
        ]);

        return {
          totalOrders: ordersRes.data?.pagination?.total || 823,
          activeTrips: tripsRes.data?.results?.length || 28,
          totalVehicles: vehiclesRes.data?.pagination?.total || 45,
          totalDrivers: driversRes.data?.pagination?.total || 67,
        };
      } catch {
        return {
          totalOrders: 823,
          activeTrips: 28,
          totalVehicles: 45,
          totalDrivers: 67,
        };
      }
    },
  });

  const analytics = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 823,
      change: '+12.5%',
      trend: 'up',
      icon: PackageIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      gradient: 'from-blue-500/10 via-blue-400/5 to-transparent',
    },
    {
      title: 'Active Trips',
      value: stats?.activeTrips || 28,
      change: '+8.2%',
      trend: 'up',
      icon: ShippingTruck02Icon,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      gradient: 'from-emerald-500/10 via-emerald-400/5 to-transparent',
    },
    {
      title: 'Fleet Size',
      value: stats?.totalVehicles || 45,
      change: '+5.0%',
      trend: 'up',
      icon: ShippingTruck02Icon,
      color: 'text-primary dark:text-primary',
      bgColor: 'bg-primary/10 dark:bg-primary/20',
      gradient: 'from-primary/10 via-primary/5 to-transparent',
    },
    {
      title: 'Active Drivers',
      value: stats?.totalDrivers || 67,
      change: '+3.1%',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      gradient: 'from-amber-500/10 via-amber-400/5 to-transparent',
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <PageTitle
        title="Dashboard"
        description="Welcome back! Here's what's happening with your operations today."
        icon={DashboardSquare02Icon}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analytics.map((item) => (
          <Card
            key={item.title}
            className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <div
                className={`${item.bgColor} p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <HugeiconsIcon icon={item.icon} className={`h-5 w-5 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{item.value.toLocaleString()}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded-md">
                  <HugeiconsIcon
                    icon={ArrowUp01Icon}
                    className="h-3 w-3 text-emerald-600 dark:text-emerald-400"
                  />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {item.change}
                  </span>
                </div>
                <span className="text-xs">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Orders Overview</CardTitle>
            <CardDescription className="text-sm">
              Monthly orders and deliveries trend
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pr-4 pb-4">
            <ChartContainer config={ordersChartConfig} className="h-[280px] w-full">
              <LineChart data={mockOrdersData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  className="text-xs"
                  width={40}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--color-orders)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  stroke="var(--color-delivered)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
            <CardDescription className="text-sm">Monthly revenue in SAR</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pr-4 pb-4">
            <ChartContainer config={revenueChartConfig} className="h-[280px] w-full">
              <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  className="text-xs"
                  width={50}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [`SAR ${value.toLocaleString()}`, 'Revenue']}
                  cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Trip Activity</CardTitle>
            <CardDescription className="text-sm">
              Active and completed trips per month
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pr-4 pb-4">
            <ChartContainer config={tripsChartConfig} className="h-[280px] w-full">
              <LineChart data={mockTripsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  className="text-xs"
                  width={40}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="var(--color-active)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--color-completed)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Fleet Utilization</CardTitle>
            <CardDescription className="text-sm">Percentage of fleet in active use</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pr-4 pb-4">
            <ChartContainer config={fleetChartConfig} className="h-[280px] w-full">
              <AreaChart data={mockFleetData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fleetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-utilization)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-utilization)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  className="text-xs"
                  width={50}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [`${value}%`, 'Utilization']}
                  cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="utilization"
                  stroke="var(--color-utilization)"
                  strokeWidth={2.5}
                  fill="url(#fleetGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
