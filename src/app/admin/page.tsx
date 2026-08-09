"use client";

import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { StatCard } from "@/components/admin/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/lib/formatPrice";
import { ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import { useGetDashboardStatsQuery } from "@/store/api/dashboardApi";
import type { OrderStatus } from "@/types";

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !stats) {
    return <p className="text-maroon-700">Couldn&apos;t load dashboard stats.</p>;
  }

  const statusChartData = (Object.keys(stats.orderCountsByStatus) as OrderStatus[]).map(
    (status) => ({
      status: ORDER_STATUS_LABELS[status],
      count: stats.orderCountsByStatus[status],
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-maroon-900 text-2xl">Dashboard</h1>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Revenue today" value={formatPrice(stats.revenue.today)} />
        <StatCard label="Revenue this week" value={formatPrice(stats.revenue.week)} />
        <StatCard label="Revenue this month" value={formatPrice(stats.revenue.month)} />
      </section>

      <section className="border-maroon-50 rounded-lg border bg-white p-4">
        <h2 className="font-heading text-maroon-900 mb-3 text-lg">Orders by status</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0C4CA" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#7A2635" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="border-maroon-50 rounded-lg border bg-white p-4">
        <h2 className="font-heading text-maroon-900 mb-3 text-lg">Low stock</h2>
        {stats.lowStockProducts.length === 0 ? (
          <p className="text-maroon-600 text-sm">Nothing is low on stock right now.</p>
        ) : (
          <ul className="divide-maroon-50 flex flex-col divide-y text-sm">
            {stats.lowStockProducts.map((product) => (
              <li key={product.id} className="flex justify-between py-2">
                <span className="text-maroon-800">
                  {product.name}
                  {product.sku ? ` (${product.sku})` : ""}
                </span>
                {/* text-maroon-700, not text-gold-600 — measured 3.99:1 on white (needs 4.5:1). */}
                <span className="text-maroon-700 font-medium">{product.stock} left</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-maroon-50 rounded-lg border bg-white p-4">
        <h2 className="font-heading text-maroon-900 mb-3 text-lg">Recent orders</h2>
        <ul className="divide-maroon-50 flex flex-col divide-y text-sm">
          {stats.recentOrders.map((order) => (
            <li key={order.id} className="flex justify-between py-2">
              <Link href={`/admin/orders/${order.id}`} className="text-maroon-800 underline">
                #{order.orderNumber}
              </Link>
              <span className="text-maroon-600">{ORDER_STATUS_LABELS[order.status]}</span>
              <span className="text-maroon-900 font-medium">{formatPrice(order.total)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
