
import ShopClient from "@/components/shop/Main";
import ShopGuard from "@/components/auth/ShopGuard";

export const metadata = {
  title: "เลือกซื้อบัตรและของที่ระลึก | TicketCSI",
};

export default function ShopPage() {
  return (
    <ShopGuard>
      <ShopClient />
    </ShopGuard>
  );
}
