/** Checkout placeholder API (not an authentication implementation). */
export async function createOrder(order: Record<string, unknown>) {
  // Checkout is still simulated; replace with a real server call before launch.
  void order;
  await new Promise((resolve) => setTimeout(resolve, 700));
  const orderNo = "MF" + String(Math.floor(Math.random() * 1e6)).padStart(6, "0");
  return { ok: true, orderNo };
}
