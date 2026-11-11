"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import dashboardData from "@/data/admin/dashboard.json";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const ticketSales = dashboardData.orders.reduce(
  (total, order) => total + Number(order["price-ticket"]),
  0,
);
const shirtSales = dashboardData.orders.reduce(
  (total, order) => total + Number(order["price-shirt"]),
  0,
);
const productSales = [ticketSales, shirtSales];

const options: ApexOptions = {
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
    max: Math.ceil(Math.max(...productSales, 1) / 1000) * 1000,
    tickAmount: 4,
    labels: { style: { colors: "#7188a5", fontSize: "10px" } },
  },
  tooltip: {
    theme: "dark",
    y: {
      formatter: (value) => `${(value ?? 0).toLocaleString("th-TH")} บาท`,
    },
  },
};

export default function SalesChart() {
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
