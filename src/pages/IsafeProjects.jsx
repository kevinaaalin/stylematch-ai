import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createPageUrl } from "@/utils";
import { localStore } from "@/lib/localStore";
import { listIsafeCases } from "@/lib/isafeApi";
import {
  ArrowUpRight,
  ClipboardCheck,
  FileClock,
  FolderKanban,
  Search,
  ShieldCheck,
  ShieldPlus,
} from "lucide-react";

const ISAFE_WORKSPACE_ORIGIN = "http://127.0.0.1:4174/";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildIsafeWorkspaceUrl(isafeCase, role = "headquarter") {
  const caseId = isafeCase?.isafe_case_id || isafeCase?.isafe_project_id || "";
  const params = new URLSearchParams({
    view: "projects",
    role,
  });
  if (caseId) params.set("case", caseId);
  return `${ISAFE_WORKSPACE_ORIGIN}?${params.toString()}`;
}

function Field({ label, value }) {
  return (
    <div className="rounded-md border border-stone-200 bg-white px-3 py-2">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 break-words font-medium text-stone-800">{value ?? "-"}</p>
    </div>
  );
}

function MetricCard({ label, value, detail, Icon }) {
  return (
    <Card className="border border-stone-200 shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-stone-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">{value}</p>
          <p className="mt-1 text-xs text-stone-500">{detail}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-stone-100">
          <Icon className="h-5 w-5 text-stone-700" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function IsafeProjects() {
  const [database, setDatabase] = useState(() => localStore.getAll());
  const [selectedId, setSelectedId] = useState(database.isafeCases?.[0]?.id || "");
  const [query, setQuery] = useState("");
  const [apiCases, setApiCases] = useState([]);
  const [apiStatus, setApiStatus] = useState("connecting");

  useEffect(() => {
    const refresh = () => {
      setDatabase(localStore.getAll());
      listIsafeCases()
        .then((payload) => {
          setApiCases(payload.cases || []);
          setApiStatus("connected");
        })
        .catch(() => setApiStatus("offline"));
    };
    refresh();
    window.addEventListener("stylematch:data-changed", refresh);
    return () => window.removeEventListener("stylematch:data-changed", refresh);
  }, []);

  const isafeCases = useMemo(() => {
    const merged = new Map((database.isafeCases || []).map((item) => [item.isafe_case_id, item]));
    apiCases.forEach((item) => merged.set(item.isafe_case_id, item));
    return Array.from(merged.values());
  }, [apiCases, database.isafeCases]);

  useEffect(() => {
    if (!isafeCases.length) {
      setSelectedId("");
      return;
    }
    if (!isafeCases.some((item) => item.id === selectedId)) {
      setSelectedId(isafeCases[0].id);
    }
  }, [isafeCases, selectedId]);

  const filteredCases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return isafeCases;
    return isafeCases.filter((item) =>
      [
        item.isafe_case_id,
        item.isafe_project_id,
        item.source_case_code,
        item.source_project_id,
        item.current_stage,
        item.gate_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [isafeCases, query]);

  const selectedCase = useMemo(
    () => isafeCases.find((item) => item.id === selectedId) || isafeCases[0] || null,
    [isafeCases, selectedId]
  );

  const stats = useMemo(() => {
    const activeCount = isafeCases.filter((item) => item.status === "active").length;
    const pendingGateCount = isafeCases.filter((item) => String(item.gate_status || "").includes("pending")).length;
    const averageRisk = isafeCases.length
      ? Math.round(isafeCases.reduce((total, item) => total + (Number(item.risk_score) || 0), 0) / isafeCases.length)
      : 0;

    return {
      total: isafeCases.length,
      activeCount,
      pendingGateCount,
      averageRisk,
    };
  }, [isafeCases]);

  const workspaceUrl = selectedCase ? selectedCase.workspace_url || buildIsafeWorkspaceUrl(selectedCase) : "";

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white">
              <ShieldCheck className="h-4 w-4" />
              iSAFE Handoff · API {apiStatus === "connected" ? "已連線" : apiStatus === "offline" ? "離線" : "連線中"}
            </div>
            <h1 className="text-3xl font-semibold text-stone-950">iSAFE 轉案摘要</h1>
            <p className="mt-2 max-w-3xl text-stone-600">
              StyleMatchAI 只負責成立 iSAFE 監管專案、保留轉案摘要與 PGP 匯出線索；正式專案頁、總部與代理商權限視圖，都交由 iSAFE 工作台承接。
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {selectedCase && (
              <a href={workspaceUrl} target="_blank" rel="noreferrer">
                <Button className="w-full bg-stone-900 hover:bg-stone-800 sm:w-auto">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  開啟 iSAFE 工作台
                </Button>
              </a>
            )}
            <Link to={createPageUrl("Cases")}>
              <Button variant="outline" className="w-full sm:w-auto">
                <ShieldPlus className="mr-2 h-4 w-4" />
                從案件成立 iSAFE
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard label="已轉 iSAFE" value={stats.total} detail="StyleMatchAI handoff records" Icon={ShieldCheck} />
          <MetricCard label="有效轉案" value={stats.activeCount} detail="status=active" Icon={ClipboardCheck} />
          <MetricCard label="待 iSAFE Gate" value={stats.pendingGateCount} detail="pending in iSAFE workspace" Icon={FileClock} />
          <MetricCard label="平均 RiskScore" value={stats.averageRisk} detail="from initial handoff snapshot" Icon={FolderKanban} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
          <Card className="border border-stone-200 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-xl">轉案清單</CardTitle>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="pl-9"
                    placeholder="搜尋 iSAFE / StyleMatch ID"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCases.length === 0 ? (
                <div className="rounded-md border border-dashed border-stone-300 p-10 text-center">
                  <p className="font-medium text-stone-700">尚無 iSAFE 轉案</p>
                  <p className="mt-1 text-sm text-stone-500">請先到案件控台選擇案件並成立 iSAFE 監管專案。</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>iSAFE</TableHead>
                      <TableHead>來源案件</TableHead>
                      <TableHead>轉案狀態</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>建立時間</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.map((item) => {
                      const isSelected = selectedCase?.id === item.id;
                      return (
                        <TableRow
                          key={item.id}
                          data-state={isSelected ? "selected" : undefined}
                          className="cursor-pointer"
                          onClick={() => setSelectedId(item.id)}
                        >
                          <TableCell>
                            <p className="font-semibold text-stone-900">{item.isafe_project_id || item.isafe_case_id}</p>
                            <p className="text-xs text-stone-500">{item.gate_status}</p>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{item.source_case_code || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.current_stage}</Badge>
                          </TableCell>
                          <TableCell>{item.risk_score}</TableCell>
                          <TableCell className="text-stone-600">{formatDate(item.created_at)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border border-stone-200 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">{selectedCase?.isafe_project_id || "未選擇轉案"}</CardTitle>
                  <p className="mt-1 text-sm text-stone-500">
                    {selectedCase?.title || "選擇一筆轉案後可開啟 iSAFE 正式工作台。"}
                  </p>
                </div>
                {selectedCase && <Badge variant="outline">{selectedCase.status}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedCase ? (
                <div className="rounded-md border border-dashed border-stone-300 p-10 text-center text-stone-500">
                  目前沒有 iSAFE 轉案資料。
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border border-stone-200 bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-stone-900">正式監管入口</p>
                        <p className="mt-1 text-sm text-stone-600">
                          角色權限、總部/代理商頁面、Gate 操作與證據治理在 iSAFE 網站呈現。
                        </p>
                        <p className="mt-2 break-all font-mono text-xs text-stone-500">{workspaceUrl}</p>
                      </div>
                      <a href={workspaceUrl} target="_blank" rel="noreferrer">
                        <Button className="bg-stone-900 hover:bg-stone-800">
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          開啟
                        </Button>
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="isafe_case_id" value={selectedCase.isafe_case_id} />
                    <Field label="立案來源" value={selectedCase.source} />
                    <Field label="intake_channel" value={selectedCase.intake_channel} />
                    <Field label="direct_intake_id" value={selectedCase.direct_intake_id} />
                    <Field label="stylematch_project_id" value={selectedCase.stylematch_project_id} />
                    <Field label="project_id (canonical)" value={selectedCase.project_id} />
                    <Field label="handover_id" value={selectedCase.handover_id} />
                    <Field label="source_case_code" value={selectedCase.source_case_code} />
                    <Field label="source_project_id" value={selectedCase.source_project_id} />
                    <Field label="current_stage" value={selectedCase.current_stage} />
                    <Field label="gate_status" value={selectedCase.gate_status} />
                    <Field label="risk_score" value={selectedCase.risk_score} />
                    <Field label="pgp_url" value={selectedCase.pgp_url} />
                    <Field label="trace_id" value={selectedCase.trace_id} />
                  </div>

                  <div className="rounded-md border border-stone-200 bg-white p-4">
                    <p className="font-semibold text-stone-900">轉案摘要，不取代 iSAFE 後台</p>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {(selectedCase.governance_steps || []).slice(0, 4).map((step) => (
                        <div
                          key={step.key}
                          className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-md border border-stone-200 px-3 py-2"
                        >
                          <span className="font-mono text-sm font-semibold text-stone-900">{step.code}</span>
                          <div>
                            <p className="text-sm font-medium text-stone-900">{step.label}</p>
                            <p className="text-xs text-stone-500">{step.phase}</p>
                          </div>
                          <Badge variant={step.status === "active" ? "default" : "outline"}>
                            {step.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field label="timeline_events" value={selectedCase.evidence_summary?.timeline_events} />
                    <Field label="source_audit_logs" value={selectedCase.evidence_summary?.source_audit_logs} />
                    <Field label="project_photos" value={selectedCase.evidence_summary?.project_photos} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
