import ShopClient from "@/components/shop/ShopClient";
import RequireUser from "@/components/auth/RequireUser";

export const metadata = { title: "เลือกซื้อบัตรและของที่ระลึก | TicketCSI200" };

export default function ShopPage() {
  return (
    <RequireUser>
      <ShopClient />
    </RequireUser>
  );
}
