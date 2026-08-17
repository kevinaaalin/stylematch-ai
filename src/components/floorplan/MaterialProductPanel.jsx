import React, { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveLocalArtifact, createLocalArtifact, mapMaterialBudget, searchMaterials } from "@/lib/structuredSpaceApi";
export default function MaterialProductPanel({ projectId }) {
  const [items, setItems] = useState([]); const [selected, setSelected] = useState([]); const [budget, setBudget] = useState(100000); const [result, setResult] = useState(null); const [artifact, setArtifact] = useState(null);
  useEffect(() => { searchMaterials().then((data) => setItems(data.items || [])).catch(() => setItems([])); }, []);
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const calculate = async () => setResult(await mapMaterialBudget(projectId, { budget: Number(budget), selections: selected.map((catalog_id) => ({ catalog_id, quantity: 10 })) }));
  const save = async () => setArtifact(await createLocalArtifact(projectId, "material_selection", { logical_artifact_id: "primary-material-selection", label: "材料與預算快照", local_ref: `local://materials/${projectId}/primary.json`, metadata: result }));
  const approve = async () => setArtifact(await approveLocalArtifact(artifact.artifact_id, artifact.revision));
  return <div className="mt-5 border-t border-stone-200 pt-5"><div className="mb-3 flex items-center justify-between"><div><h3 className="flex items-center gap-2 text-sm font-semibold"><PackageSearch className="h-4 w-4" />材料／商品智慧</h3><p className="mt-1 text-xs text-stone-600">本地 curated catalog；價格為估計值並固定於快照。</p></div><Badge variant="outline">MPI-01</Badge></div><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">{items.map((item) => <button type="button" key={item.id} onClick={() => toggle(item.id)} className={`border p-3 text-left text-sm ${selected.includes(item.id) ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white"}`}><strong>{item.name}</strong><p className="mt-1 text-xs text-stone-600">{item.finish} · NT$ {item.price_ref}/{item.unit}</p><p className="mt-1 text-xs text-stone-500">{item.price_state} · {item.provider}</p></button>)}</div><div className="mt-3 flex flex-wrap gap-2"><Input className="max-w-48" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /><Button variant="outline" onClick={calculate} disabled={!selected.length}>計算預算</Button>{result && <Button onClick={save}>建立材料快照</Button>}{artifact?.status === "candidate" && <Button variant="outline" onClick={approve}>人工核准</Button>}</div>{result && <p className={`mt-3 text-sm ${result.within_budget ? "text-emerald-700" : "text-rose-700"}`}>估計總額 NT$ {result.estimated_total.toLocaleString()} · 餘額 NT$ {result.remaining.toLocaleString()} · {result.within_budget ? "預算內" : "超出預算"}</p>}</div>;
}
