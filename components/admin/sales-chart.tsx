"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CUSTOMER_ORDERS_STORAGE_KEY, type CustomerOrder } from "@/lib/api";
import { readJSON } from "@/lib/storage";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const createOptions = (maxValue: number): ApexOptions => ({
  chart: {
    type: "bar",
    height: 200,
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "inherit",
    foreColor: "#8fa6c2",
  },
  colors: ["#4da6ff", "#16c7a5"],
  dataLabels: { enabled: false },
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: "42%",
      distributed: true,
    },
  },
  grid: {
    borderColor: "#244466",
    strokeDashArray: 4,
    padding: { left: 8, right: 8 },
  },
  xaxis: {
    categories: ["บัตร", "เสื้อ"],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: "#7188a5", fontSize: "10px" } },
  },
  yaxis: {
    min: 0,
    max: maxValue,
    tickAmount: 4,
    labels: { style: { colors: "#7188a5", fontSize: "10px" } },
  },
  tooltip: {
    enabled: false,
  },
});

export default function SalesChart() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  useEffect(() => {
    const refreshOrders = () => setOrders(readJSON<CustomerOrder[]>(CUSTOMER_ORDERS_STORAGE_KEY, []));
    refreshOrders();
    window.addEventListener("storage", refreshOrders);
    window.addEventListener("ticket:orders-updated", refreshOrders);
    return () => {
      window.removeEventListener("storage", refreshOrders);
      window.removeEventListener("ticket:orders-updated", refreshOrders);
    };
  }, []);
  const paidOrders = orders.filter((order) => order.status === "paid");
  const { ticketSales, shirtSales } = paidOrders.reduce((totals, order) => {
    for (const item of order.items ?? []) {
      const amount = Number(order.prices[item.id] ?? 0) * item.qty;
      if (item.type === "ticket") totals.ticketSales += amount;
      if (item.type === "merch") totals.shirtSales += amount;
    }
    return totals;
  }, { ticketSales: 0, shirtSales: 0 });
  const productSales = [ticketSales, shirtSales];
  const options = createOptions(Math.max(1000, Math.ceil(Math.max(...productSales) / 1000) * 1000));
  const series = [
    {
      name: "ยอดขาย",
      data: productSales,
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">ยอดขายเสื้อและบัตร</h2>
        </div>
      </div>

      <ReactApexChart options={options} series={series} type="bar" height={220} />
    </div>
  );
}
