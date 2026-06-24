"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ProductionTrendChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Batches Created (Last 14 Days)</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function InventoryLevelsChart({ data }: { data: { name: string; quantity: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Raw Material Stock Levels</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
            <Tooltip />
            <Bar dataKey="quantity" fill="var(--chart-3)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function QcResultPieChart({ data }: { data: { name: string; value: number }[] }) {
  const hasData = data.some((d) => d.value > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">QC Results (Last 20 Tests)</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No lab tests recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function IncidentBreakdownChart({ data }: { data: { type: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Safety Incidents by Type</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--chart-2)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No incidents recorded.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OrderStatusPieChart({ data }: { data: { status: string; count: number }[] }) {
  const chartData = data.map((d) => ({ name: d.status.replaceAll("_", " "), value: d.count }));
  const hasData = chartData.some((d) => d.value > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sales Orders by Status</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80} label>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No sales orders recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
