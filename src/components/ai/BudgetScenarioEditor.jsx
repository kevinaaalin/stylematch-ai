import React, { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { localStore } from "@/lib/localStore";
import { isBusinessPlan } from "@/lib/planAccess";
import { calculateBudgetScenario } from "@/lib/budgetScenario";

const blank = () => ({ space: "", category: "", label: "", material: "", unit: "式", quantity: "1", unit_price: "" });
export default function BudgetScenarioEditor({ project }) {
  const [rows, setRows] = useState([blank()]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [message, setMessage] = useState("");
  if (!isBusinessPlan()) return null;
  const scenarios = project?.budget_scenarios || [];
  let total = null;
  try { total = calculateBudgetScenario(rows).total_cents / 100; } catch { /* Incomplete input has no estimate. */ }
  return <section className="mt-8 space-y-4 border-t border-stone-200 pt-6" aria-label="商業預算小管家">
    <h2 className="text-xl font-bold">商業預算小管家</h2>
    <p className="text-sm text-stone-600">規劃估算，非合約或結算金額。單價稅別依輸入資料，不另加稅；不連動 iSAFE 付款。</p>
    {!project ? <p>請先選擇專案。</p> : <>
      <label className="block text-sm">來源預算<select className="ml-2 max-w-full border p-2" value={parentId} onChange={(event) => {
        const id = event.target.value;
        setParentId(id);
        const source = scenarios.find((item) => item.scenario_id === id);
        setRows(source ? source.items.map((item) => ({ ...item })) : [blank()]);
        setName(source ? `${source.name} 修訂` : "");
        setMessage("");
      }}><option value="">新情境</option>{scenarios.map((item) => <option key={item.scenario_id} value={item.scenario_id}>v{item.version} {item.name} · NT$ {(item.total_cents / 100).toLocaleString()}</option>)}</select></label>
      <label className="block text-sm">情境名稱<input className="mt-1 block w-full rounded-md border p-2" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr>{["空間", "分類", "工項", "材料", "單位", "數量", "單價 (NT$)", ""].map((text, index) => <th key={index} className="p-1 text-left">{text}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>
        {["space", "category", "label", "material", "unit", "quantity", "unit_price"].map((field) => <td key={field} className="p-1"><input aria-label={`第${index + 1}筆 ${field}`} className="w-full min-w-20 rounded border p-2" type={["quantity", "unit_price"].includes(field) ? "number" : "text"} min={field === "quantity" ? "0.001" : "0"} step={field === "quantity" ? "0.001" : "0.01"} value={row[field]} onChange={(event) => setRows(rows.map((item, i) => i === index ? { ...item, [field]: event.target.value } : item))} /></td>)}
        <td><button type="button" title="移除工項" aria-label={`移除第${index + 1}筆`} disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></button></td>
      </tr>)}</tbody></table></div>
      <div className="flex flex-wrap items-center gap-4"><button type="button" className="inline-flex items-center gap-2 border px-3 py-2" disabled={rows.length >= 200} onClick={() => setRows([...rows, blank()])}><Plus className="h-4 w-4" />新增工項</button><strong>合計：{total === null ? "待填寫" : `NT$ ${total.toLocaleString()}`}</strong><button type="button" className="inline-flex items-center gap-2 border px-3 py-2" onClick={() => {
        try { const saved = localStore.saveBudgetScenario(project.project_id, { name, rows, parentId: parentId || null }); setParentId(saved.scenario_id); setMessage(`已儲存 v${saved.version}，原版本未變更。`); }
        catch (error) { setMessage(error.message); }
      }}><Save className="h-4 w-4" />另存預算版本</button></div>
      {message && <p role="status" className="text-sm">{message}</p>}
    </>}
  </section>;
}
