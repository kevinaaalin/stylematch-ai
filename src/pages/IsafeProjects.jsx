import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search, ShieldCheck, ShieldPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import { localStore } from "@/lib/localStore";
import { listIsafeCases } from "@/lib/isafeApi";
import { buildIsafeWorkspaceUrl } from "@/lib/isafeContract";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function IsafeProjects() {
  const [database, setDatabase] = useState(() => localStore.getAll());
  const [apiCases, setApiCases] = useState([]);
  const [apiStatus, setApiStatus] = useState("connecting");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const refresh = () => {
      setDatabase(localStore.getAll());
      listIsafeCases()
        .then((payload) => { setApiCases(payload.cases || []); setApiStatus("connected"); })
        .catch(() => setApiStatus("offline"));
    };
    refresh();
    return localStore.subscribe(refresh);
  }, []);

  const handoffs = useMemo(() => {
    const merged = new Map((database.isafeCases || []).map((item) => [item.isafe_case_id, item]));
    apiCases
      .filter((item) => item.intake_channel !== "isafe_direct" && (item.stylematch_project_id || item.source_project_id || item.source === "StyleMatchAI"))
      .forEach((item) => merged.set(item.isafe_case_id, item));
    const term = query.trim().toLowerCase();
    return Array.from(merged.values()).filter((item) => !term || [item.isafe_case_id, item.source_case_code, item.source_project_id].filter(Boolean).join(" ").toLowerCase().includes(term));
  }, [apiCases, database.isafeCases, query]);

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white">
              <ShieldCheck className="h-4 w-4" />iSAFE 交接 · API {apiStatus === "connected" ? "已連線" : apiStatus === "offline" ? "離線" : "連線中"}
            </div>
            <h1 className="text-3xl font-semibold text-stone-950">iSAFE 立案交接</h1>
            <p className="mt-2 max-w-3xl text-stone-600">StyleMatch AI 只保存交接識別資料。立案後的階段、檢核、付款、證據、Gate 與權限管理，全部在 iSAFE 2.0 工作台執行。</p>
          </div>
          <Link to={createPageUrl("Cases")}><Button variant="outline"><ShieldPlus className="mr-2 h-4 w-4" />選擇案件交接</Button></Link>
        </div>

        <Card className="border border-stone-200 shadow-sm">
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle className="text-xl">已立案案件</CardTitle>
            <div className="relative w-full max-w-xs"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="搜尋案件編號" /></div>
          </CardHeader>
          <CardContent className="space-y-3">
            {handoffs.length === 0 ? (
              <div className="border border-dashed border-stone-300 p-10 text-center text-stone-600">尚無已完成的 iSAFE 立案交接。</div>
            ) : handoffs.map((item) => (
              <div key={item.isafe_case_id} className="grid gap-4 border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-stone-900">{item.source_case_code || item.source_project_id || "StyleMatch 案件"}</p><Badge variant="outline">已交接</Badge></div>
                  <p className="mt-1 font-mono text-sm text-stone-600">iSAFE case: {item.isafe_case_id}</p>
                  <p className="mt-1 text-xs text-stone-500">立案時間：{formatDate(item.created_at)}</p>
                </div>
                <a href={item.workspace_url || buildIsafeWorkspaceUrl(item)} target="_blank" rel="noreferrer"><Button className="w-full bg-stone-900 hover:bg-stone-800"><ArrowUpRight className="mr-2 h-4 w-4" />進入 iSAFE 管理</Button></a>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
