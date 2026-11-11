"use client";

import dashboardData from "@/data/admin/dashboard.json";
import { Progress } from "@/components/admin/tailgrids/core/progress";
import SalesChart from "@/components/admin/sales-chart";

export default function DashboardContent() {
  return (
    <main className="min-h-svh min-w-0 flex-1 overflow-y-auto bg-[#0a1628] p-4 text-white sm:p-6 lg:p-8 xl:h-svh xl:overflow-hidden ">
      
      {/*บน*/}
      <div className="w-full">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ">

          {dashboardData.stats.map((stat) => (
            <div key={stat.label} className="rounded-[15px] border border-[#244466] bg-[#10233d] px-4 py-4 sm:px-5">
              
              <p className=" text-[#8fa6c2]">
              {stat.label}
              </p>

              <p className={`mt-3 text-[30px] font-bold tracking-tight ${stat.valueClass}`}>
              {stat.value}
              </p>

              <p className="mt-2 text-[15px] text-[#7188a5]">
                {stat.detail}
                </p>

            </div>
          ))}

        </section>

        {/* ตาราง */}
        <section className="mt-6 grid items-stretch gap-x-8 gap-y-6 xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,1fr)]">
          
          <div className="rounded-[15px] border border-[#244466] bg-[#10233d] p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">รอตรวจสลิป</h2>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-130 border-collapse text-left text-">

                <thead>
                  <tr className="border-b border-[#244466] text-[#8fa6c2]">
                    <th className="px-2 pb-3 font-normal">คำสั่งซื้อ</th>
                    <th className="px-2 pb-3 font-normal">ผู้ซื้อ</th>
                    <th className="px-2 pb-3 font-normal">รายการ</th>
                    <th className="px-2 pb-3 text-right font-normal">ยอด</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardData.orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#244466] last:border-b-0"
                    >
                      <td className="px-2 py-2 text-[#9db0c7]">{order.id}</td>
                      <td className="px-2 py-2 text-[#d6e0ed]">
                        {order.buyer}
                      </td>
                      <td className="px-2 py-2 text-[#8fa6c2]">{order.item}</td>
                      <td className="px-2 py-2 text-right font-semibold text-white">
                        {(
                          Number(order["price-ticket"]) +
                          Number(order["price-shirt"])
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>

          {/* ร้านค้า */}
          <div className="rounded-[15px] border border-[#244466] bg-[#10233d] p-4">
            <h2 className="text-base font-bold">ยอดขายแต่ละร้าน</h2>
            <div className="mt-5 space-y-4">

              {dashboardData.storeSales.map((store) => (
                <div key={store.name}>
                  <div className="mb-2 flex items-center justify-between text-base leading-6">
                    <span className="text-[#d6e0ed]">{store.name}</span>
                    <span className="tabular-nums text-[#8fa6c2]">
                      {Number(store["Sale"])}
                    </span>
                  </div>
                  
                  <Progress
                    progress={store.progress}
                    className="max-w-none"
                    trackColor="#1d3858"
                    barColor={store.barColor}
                  />
                
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-xl border border-[#244466] bg-[#10233d] p-5">
            <SalesChart />
          </div>
        
        </section>
      </div>
    </main>
  );
}
