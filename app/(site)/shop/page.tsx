import ShopClient from "@/components/shop/Main";
import RequireUser from "@/components/auth/RequireUser";

export const metadata = { title: "เลือกซื้อบัตรและของที่ระลึก | TicketCSI" };

export default function ShopPage() {
  return (
    <RequireUser>
      <ShopClient />
    </RequireUser>
  );
}
