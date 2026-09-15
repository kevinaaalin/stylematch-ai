export function calculateBudgetScenario(rows) {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 200) throw new Error("請填寫 1 至 200 筆工項。");
  const items = rows.map((row) => {
    const quantity = Number(row.quantity), price = Number(row.unit_price);
    if (!row.space?.trim() || !row.category?.trim() || !row.label?.trim()) throw new Error("請填寫空間、工項分類與名稱。");
    if (row.quantity === "" || row.unit_price === "" || !Number.isFinite(quantity) || !Number.isFinite(price)
      || quantity <= 0 || price < 0 || quantity > 1000000 || price > 100000000) throw new Error("數量或單價超出允許範圍。");
    const mills = Math.round(quantity * 1000), cents = Math.round(price * 100);
    if (mills <= 0 || Math.abs(quantity * 1000 - mills) > 0.000001 || Math.abs(price * 100 - cents) > 0.000001) throw new Error("數量最多三位小數，單價最多兩位小數。");
    const totalCents = Math.round(mills * cents / 1000);
    if (!Number.isSafeInteger(totalCents) || !Number.isSafeInteger(mills * cents)) throw new Error("金額過大。");
    return { space: row.space.trim(), category: row.category.trim(), label: row.label.trim(), material: String(row.material || "").trim(), unit: String(row.unit || "式").trim(), quantity: mills / 1000, unit_price: cents / 100, total_cents: totalCents };
  });
  const total_cents = items.reduce((sum, item) => sum + item.total_cents, 0);
  if (!Number.isSafeInteger(total_cents)) throw new Error("總金額過大。");
  return { currency: "TWD", calculation_version: "quantity-price-v1", tax_basis: "user_entered_prices", items, total_cents };
}
