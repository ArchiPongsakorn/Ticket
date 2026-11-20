import type { CartLine, CartTotals, OrderUnit, Product } from "../types/domain";
import { PRODUCTS_BY_ID } from "../data/catalog";

/** คีย์ประจำบรรทัดในตะกร้า (สินค้า + ไซซ์) */
export const lineKey = (line: CartLine): string => `${line.id}|${line.option}`;



//คำนวนสินค้า 
//
export function summarize(lines: CartLine[], productsById: Record<string, Product> = PRODUCTS_BY_ID): CartTotals {
  const sum = {
    count: 0,
    total: 0,
    tokens: 0,
    hasTicket: false,
    hasMerch: false,
  };

  //for of loop
  for (const l of lines) {
    //get id re product
    const p = productsById[l.id];
    sum.count += l.qty;
    sum.total += l.qty * p.price;
    sum.tokens += l.qty * (p.tokens || 0); 
    
    //check product ticket
    if (p.type === "ticket") sum.hasTicket = true;
    else sum.hasMerch = true;
  }
  
  return sum;
}

/**
 * แตกสินค้าเป็นรายชิ้น: บัตรทุกใบ (กรอกข้อมูลผู้ถือบัตร) และของที่ระลึกทุกชิ้น (เลือกรับที่งานหรือจัดส่ง)
 */
export function orderUnits(lines: CartLine[], productsById: Record<string, Product> = PRODUCTS_BY_ID): OrderUnit[] {
  return lines.flatMap((l) => {
    const p = productsById[l.id];
    return Array.from({ length: l.qty }, (_, i) => ({
      key: [l.id, l.option, i + 1].filter(Boolean).join("-"),
      id: l.id,
      option: l.option,
      kind: p.type,
    }));
  });
}
