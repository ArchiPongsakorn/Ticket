import type { CustomerOrder } from "@/lib/api";
import type { Attendee } from "@/components/admin/event-tokens/types";

type OrderTicket = NonNullable<CustomerOrder["tickets"]>[number];

function ticketRecords(order: CustomerOrder): OrderTicket[] {
  if (order.tickets?.length) return order.tickets;
  const ticketItems = (order.items ?? []).filter((item) => item.type === "ticket");
  const count = ticketItems.reduce((total, item) => total + Math.max(0, item.qty), 0);
  if (count === 0) return [];

  const bonusPerTicket = Math.floor((order.bonusToken ?? 0) / count);
  return Array.from({ length: count }, (_, index) => {
    let itemIndex = index;
    const item = ticketItems.find((candidate) => {
      if (itemIndex < candidate.qty) return true;
      itemIndex -= candidate.qty;
      return false;
    }) ?? ticketItems[0];
    return {
      code: `${order.id}-${String(index + 1).padStart(2, "0")}`,
      name: order.buyerName || order.ownerEmail || "ผู้ถือบัตร",
      type: item.name,
      email: order.ownerEmail ?? "",
      tokens: bonusPerTicket,
    };
  });
}

/** Creates or activates event tickets for a paid order without granting its bonus twice. */
export function issueApprovedOrderTickets(order: CustomerOrder, currentAttendees: Attendee[]): Attendee[] {
  const records = ticketRecords(order);
  if (records.length === 0) return currentAttendees;

  const attendeesById = new Map(currentAttendees.map((attendee) => [attendee.id, attendee]));
  for (const [index, ticket] of records.entries()) {
    const id = ticket.code || `${order.id}-${String(index + 1).padStart(2, "0")}`;
    const current = attendeesById.get(id);
    const bonus = Math.max(0, Number(ticket.tokens ?? 0));
    attendeesById.set(id, {
      id,
      name: ticket.name || order.buyerName || order.ownerEmail || "ผู้ถือบัตร",
      type: ticket.type || "บัตรเข้างาน",
      email: ticket.email || order.ownerEmail || "",
      ownerEmail: order.ownerEmail || ticket.email || current?.ownerEmail,
      orderId: order.id,
      checkedIn: current?.checkedIn ?? false,
      active: true,
      tokens: Math.max(0, Number(current?.tokens ?? 0)) + (current?.active === true ? 0 : bonus),
    });
  }
  return [...attendeesById.values()];
}
