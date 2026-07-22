import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  ArrowUpRight,
  ClipboardCheck,
  CircleCheck,
  Download,
  FileClock,
  FileJson,
  FolderKanban,
  Link2,
  Mail,
  Network,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { CASE_STAGES, localStore } from "@/lib/localStore";
import {
  buildGovernancePassport,
  downloadTextFile,
  governancePassportToMarkdown,
} from "@/lib/governancePassport";
import TigiKnowledgePanel from "@/components/knowledge/TigiKnowledgePanel";
import { createIsafeHandoff } from "@/lib/isafeApi";

const serviceNames = {
  ai_proposal: "AI 提案",
  platform_matching: "平台媒合",
  twcid_platform: "TWCID 平台媒合",
};

const gateLabels = {
  not_started: "尚未啟動",
  D1_pending: "D1 待審",
  closed: "已關閉",
};

const ISAFE_WORKSPACE_ORIGIN = "http://127.0.0.1:4174/";

function buildIsafeWorkspaceUrl(isafeCase, role = "headquarter") {
  const caseId = isafeCase?.isafe_case_id || isafeCase?.isafe_project_id || "";
  const params = new URLSearchParams({
    view: "projects",
    role,
  });
  if (caseId) params.set("case", caseId);
  return `${ISAFE_WORKSPACE_ORIGIN}?${params.toString()}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-TW");
}

function getStageMeta(stage) {
  return CASE_STAGES.find((item) => item.value === stage) || CASE_STAGES[0];
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

function Field({ label, value }) {
  return (
    <div className="rounded-md border border-stone-200 bg-white px-3 py-2">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 break-words font-medium text-stone-800">{value || "-"}</p>
    </div>
  );
}

export default function Cases() {
  const [database, setDatabase] = useState(() => localStore.getAll());
  const [selectedProjectId, setSelectedProjectId] = useState(database.projects[0]?.id || "");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [isCreatingIsafe, setIsCreatingIsafe] = useState(false);
  const [isafeError, setIsafeError] = useState("");

  useEffect(() => {
    const refresh = () => setDatabase(localStore.getAll());
    window.addEventListener("stylematch:data-changed", refresh);
    return () => window.removeEventListener("stylematch:data-changed", refresh);
  }, []);

  useEffect(() => {
    if (!database.projects.length) {
      setSelectedProjectId("");
      return;
    }
    if (!database.projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(database.projects[0].id);
    }
  }, [database.projects, selectedProjectId]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return database.projects.filter((project) => {
      const matchesStage = stageFilter === "all" || project.stage_status === stageFilter;
      const searchable = [
        project.case_code,
        project.project_id,
        project.twcid_match_id,
        project.isafe_case_id,
        project.user_email,
        project.house_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStage && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [database.projects, query, stageFilter]);

  const selectedProject = useMemo(
    () => database.projects.find((project) => project.id === selectedProjectId) || database.projects[0],
    [database.projects, selectedProjectId]
  );
  const isMatchConfirmed = Boolean(
    selectedProject?.twcid_match_id && selectedProject?.match_status === "matched_confirmed"
  );

  const selectedAuditLogs = useMemo(() => {
    if (!selectedProject) return [];
    return database.auditLogs.filter(
      (log) =>
        log.target_id === selectedProject.project_id ||
        selectedProject.audit_log_ids?.includes(log.id)
    );
  }, [database.auditLogs, selectedProject]);

  const selectedIsafeCase = useMemo(() => {
    if (!selectedProject) return null;
    return (database.isafeCases || []).find(
      (isafeCase) =>
        isafeCase.isafe_case_id === selectedProject.isafe_case_id ||
        isafeCase.source_project_id === selectedProject.project_id
    ) || null;
  }, [database.isafeCases, selectedProject]);

  const stats = useMemo(() => {
    const isafeCount = (database.isafeCases || []).length || database.projects.filter((project) => project.isafe_case_id).length;
    const pendingMatches = database.projects.filter(
      (project) => project.stage_status === "matching" || project.stage_status === "ai_review"
    ).length;
    return {
      total: database.projects.length,
      pendingMatches,
      isafeCount,
      auditCount: database.auditLogs.length,
    };
  }, [database]);

  const clearDatabase = () => {
    if (window.confirm("確定要清除 localStorage 內的 StyleMatch AI MVP 案件資料嗎？")) {
      localStore.clear();
    }
  };

  const handleStageChange = (stage) => {
    if (!selectedProject) return;
    localStore.updateProjectStage(selectedProject.id, stage);
  };

  const handleTwcidMatch = () => {
    if (!selectedProject) return;
    localStore.createTwcidMatch(selectedProject.id);
  };

  const handleMatchConfirmation = () => {
    if (!selectedProject?.twcid_match_id) {
      setIsafeError("請先產生 TWCID 媒合結果，再確認媒合成功。");
      return;
    }
    localStore.confirmTwcidMatch(selectedProject.id);
    setIsafeError("");
  };

  const handleIsafeCreate = async () => {
    if (!selectedProject) return;
    if (!isMatchConfirmed) {
      setIsafeError("必須先完成並確認 TWCID 媒合，才能交接建立 iSAFE 監管專案。");
      return;
    }
    setIsCreatingIsafe(true);
    setIsafeError("");
    try {
      const response = await createIsafeHandoff(selectedProject, selectedAuditLogs);
      localStore.createIsafeCase(selectedProject.id, response.case);
    } catch (error) {
      setIsafeError(error.message || "無法連線至 iSAFE 本地 API");
    } finally {
      setIsCreatingIsafe(false);
    }
  };

  const handlePassportExport = async (format) => {
    if (!selectedProject) return;
    const passport = await buildGovernancePassport(selectedProject, database);
    const safeCaseCode = selectedProject.case_code || selectedProject.project_id || "stylematch-case";

    if (format === "markdown") {
      downloadTextFile(
        `${safeCaseCode}-pgp-governance-passport.md`,
        governancePassportToMarkdown(passport),
        "text/markdown"
      );
      return;
    }

    downloadTextFile(
      `${safeCaseCode}-pgp-governance-passport.json`,
      JSON.stringify(passport, null, 2),
      "application/json"
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white">
              <FolderKanban className="h-4 w-4" />
              Cases Console
            </div>
            <h1 className="text-3xl font-semibold text-stone-950">案件控台</h1>
            <p className="mt-2 max-w-3xl text-stone-600">
              對齊 6/24 確認欄位：project_id、case_code、twcid_match_id、isafe_case_id、stage_status、timeline、jobs、audit_logs 與 trace ID。
            </p>
          </div>
          <Button
            variant="outline"
            onClick={clearDatabase}
            disabled={!database.projects.length && !database.styleTests.length}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            清除本機資料
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard label="案件總數" value={stats.total} detail="project_requests" Icon={FolderKanban} />
          <MetricCard label="待處理" value={stats.pendingMatches} detail="AI / TWCID 流程" Icon={Activity} />
          <MetricCard label="iSAFE 立案" value={stats.isafeCount} detail="isafe_case_id 已回存" Icon={ShieldCheck} />
          <MetricCard label="Audit Logs" value={stats.auditCount} detail="本機稽核軌跡" Icon={FileClock} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
          <Card className="border border-stone-200 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="text-xl">案件列表</CardTitle>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_180px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="pl-9"
                      placeholder="搜尋 case code / ID / email"
                    />
                  </div>
                  <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="篩選階段" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部階段</SelectItem>
                      {CASE_STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredProjects.length === 0 ? (
                <div className="rounded-md border border-dashed border-stone-300 p-10 text-center text-stone-500">
                  尚無符合條件的案件。從需求表單送出一筆資料後，這裡會自動建立 case_code 與 timeline。
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>TWCID</TableHead>
                      <TableHead>iSAFE</TableHead>
                      <TableHead>建立時間</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => {
                      const stage = getStageMeta(project.stage_status);
                      const isSelected = selectedProject?.id === project.id;
                      return (
                        <TableRow
                          key={project.id}
                          data-state={isSelected ? "selected" : undefined}
                          className="cursor-pointer"
                          onClick={() => setSelectedProjectId(project.id)}
                        >
                          <TableCell>
                            <p className="font-semibold text-stone-900">{project.case_code}</p>
                            <p className="text-xs text-stone-500">{project.user_email || "no email"}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={stage.tone}>{stage.label}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {project.twcid_match_id || "pending"}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {project.isafe_case_id || "not created"}
                          </TableCell>
                          <TableCell className="text-stone-600">{formatDate(project.created_at)}</TableCell>
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
                  <CardTitle className="text-xl">
                    {selectedProject?.case_code || "尚未選取案件"}
                  </CardTitle>
                  <p className="mt-1 text-sm text-stone-500">
                    {selectedProject?.project_id || "選取左側案件查看明細"}
                  </p>
                </div>
                {selectedProject && (
                  <Badge className={getStageMeta(selectedProject.stage_status).tone}>
                    {getStageMeta(selectedProject.stage_status).label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedProject ? (
                <div className="rounded-md border border-dashed border-stone-300 p-10 text-center text-stone-500">
                  目前沒有案件資料。
                </div>
              ) : (
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid h-auto w-full grid-cols-7">
                    <TabsTrigger value="overview">總覽</TabsTrigger>
                    <TabsTrigger value="timeline">時間軸</TabsTrigger>
                    <TabsTrigger value="isafe">iSAFE</TabsTrigger>
                    <TabsTrigger value="passport">PGP</TabsTrigger>
                    <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                    <TabsTrigger value="audit">Audit</TabsTrigger>
                    <TabsTrigger value="jobs">Jobs</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="case_code" value={selectedProject.case_code} />
                      <Field label="project_id" value={selectedProject.project_id} />
                      <Field label="twcid_match_id" value={selectedProject.twcid_match_id} />
                      <Field label="isafe_case_id" value={selectedProject.isafe_case_id} />
                      <Field label="stage_status" value={selectedProject.stage_status} />
                      <Field label="current_stage" value={selectedProject.current_stage} />
                      <Field label="gate_status" value={gateLabels[selectedProject.gate_status] || selectedProject.gate_status} />
                      <Field label="trace_id" value={selectedProject.trace_id} />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Field label="服務" value={serviceNames[selectedProject.service_option] || selectedProject.service_option} />
                      <Field label="坪數" value={selectedProject.square_footage ? `${selectedProject.square_footage} 坪` : ""} />
                      <Field label="預算" value={selectedProject.budget_range} />
                    </div>

                    <div className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
                        <Select value={selectedProject.stage_status} onValueChange={handleStageChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="更新 stage_status" />
                          </SelectTrigger>
                          <SelectContent>
                            {CASE_STAGES.map((stage) => (
                              <SelectItem key={stage.value} value={stage.value}>
                                {stage.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleTwcidMatch} variant="outline">
                          <Network className="mr-2 h-4 w-4" />
                          建立 TWCID 媒合
                        </Button>
                        <Button
                          onClick={handleMatchConfirmation}
                          variant="outline"
                          disabled={!selectedProject.twcid_match_id || isMatchConfirmed}
                        >
                          <CircleCheck className="mr-2 h-4 w-4" />
                          {isMatchConfirmed ? "媒合已確認" : "確認媒合成功"}
                        </Button>
                      </div>
                      <Button
                        onClick={handleIsafeCreate}
                        disabled={isCreatingIsafe || Boolean(selectedProject.isafe_case_id) || !isMatchConfirmed}
                        className="w-full bg-stone-900 hover:bg-stone-800"
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        成立 iSAFE 監管專案並回存 isafe_case_id
                      </Button>
                      {isafeError && <p className="text-sm text-red-600">{isafeError}</p>}
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-3">
                    {(selectedProject.timeline || []).map((event) => (
                      <div key={event.id} className="grid grid-cols-[28px_1fr] gap-3">
                        <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900">
                          <ClipboardCheck className="h-4 w-4 text-white" />
                        </div>
                        <div className="rounded-md border border-stone-200 bg-white p-3">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-semibold text-stone-900">{event.title}</p>
                            <p className="text-xs text-stone-500">{formatFullDate(event.at)}</p>
                          </div>
                          <p className="mt-1 text-sm text-stone-600">{event.detail}</p>
                          <p className="mt-2 font-mono text-xs text-stone-500">{event.trace_id}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="isafe" className="space-y-4">
                    {!selectedIsafeCase ? (
                      <div className="rounded-md border border-dashed border-stone-300 bg-white p-6 text-center">
                        <p className="font-semibold text-stone-900">尚未成立 iSAFE 監管專案</p>
                        <p className="mt-1 text-sm text-stone-600">
                          點選「成立 iSAFE 監管專案」後，系統會自動產生 iSAFE project、D1 起始節點、Gate 狀態與 PGP 指標。
                        </p>
                        <Button
                          onClick={handleIsafeCreate}
                          disabled={isCreatingIsafe || !isMatchConfirmed}
                          className="mt-4 bg-stone-900 hover:bg-stone-800"
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          立即成立 iSAFE 監管專案
                        </Button>
                        {isafeError && <p className="mt-3 text-sm text-red-600">{isafeError}</p>}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Field label="isafe_project_id" value={selectedIsafeCase.isafe_project_id} />
                          <Field label="isafe_case_id" value={selectedIsafeCase.isafe_case_id} />
                          <Field label="source_case_code" value={selectedIsafeCase.source_case_code} />
                          <Field label="source_project_id" value={selectedIsafeCase.source_project_id} />
                          <Field label="current_stage" value={selectedIsafeCase.current_stage} />
                          <Field label="gate_status" value={selectedIsafeCase.gate_status} />
                          <Field label="risk_score" value={selectedIsafeCase.risk_score} />
                          <Field label="pgp_url" value={selectedIsafeCase.pgp_url} />
                        </div>

                        <div className="rounded-md border border-stone-200 bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-stone-900">iSAFE 正式監管工作台</p>
                              <p className="mt-1 text-sm text-stone-600">
                                StyleMatchAI 只保留轉案紀錄；總部、代理商、設計師與業主權限頁面在 iSAFE 網站呈現。
                              </p>
                              <p className="mt-2 break-all font-mono text-xs text-stone-500">
                                {selectedIsafeCase.workspace_url || buildIsafeWorkspaceUrl(selectedIsafeCase)}
                              </p>
                            </div>
                            <a
                              href={selectedIsafeCase.workspace_url || buildIsafeWorkspaceUrl(selectedIsafeCase)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button className="bg-stone-900 hover:bg-stone-800">
                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                開啟 iSAFE 工作台
                              </Button>
                            </a>
                          </div>
                        </div>

                        <div className="rounded-md border border-stone-200 bg-white p-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-semibold text-stone-900">兩階段十大監管節點</p>
                            <Badge variant="outline">{selectedIsafeCase.status}</Badge>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-2">
                            {(selectedIsafeCase.governance_steps || []).map((step) => (
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
                          <Field label="timeline_events" value={selectedIsafeCase.evidence_summary?.timeline_events} />
                          <Field label="source_audit_logs" value={selectedIsafeCase.evidence_summary?.source_audit_logs} />
                          <Field label="project_photos" value={selectedIsafeCase.evidence_summary?.project_photos} />
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="passport" className="space-y-4">
                    <div className="rounded-md border border-stone-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-stone-900">PGP Governance Passport</p>
                          <p className="mt-1 text-sm text-stone-600">
                            Reviewer-ready export aligned to the July 1 SBIR Gate, Evidence, PGP, and RiskScore model.
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button variant="outline" onClick={() => handlePassportExport("json")}>
                            <FileJson className="mr-2 h-4 w-4" />
                            JSON
                          </Button>
                          <Button variant="outline" onClick={() => handlePassportExport("markdown")}>
                            <Download className="mr-2 h-4 w-4" />
                            MD
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="PGP source" value="localStorage MVP evidence chain" />
                      <Field label="SBIR baseline" value="2026-07-01 PGP / Evidence / RiskScore" />
                      <Field label="timeline events" value={(selectedProject.timeline || []).length} />
                      <Field label="audit logs" value={selectedAuditLogs.length} />
                    </div>

                    <div className="rounded-md border border-stone-200 bg-white p-3">
                      <p className="text-sm font-semibold text-stone-900">Included case evidence</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-600">
                        <Badge variant="outline">case_code</Badge>
                        <Badge variant="outline">timeline</Badge>
                        <Badge variant="outline">audit_logs</Badge>
                        <Badge variant="outline">stage_status</Badge>
                        <Badge variant="outline">isafe_case_id</Badge>
                        <Badge variant="outline">trace IDs</Badge>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="knowledge">
                    <TigiKnowledgePanel project={selectedProject} compact />
                  </TabsContent>

                  <TabsContent value="audit">
                    <div className="space-y-2">
                      {selectedAuditLogs.length === 0 ? (
                        <p className="rounded-md border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
                          尚無此案件的 audit log。
                        </p>
                      ) : (
                        selectedAuditLogs.map((log) => (
                          <div key={log.id} className="rounded-md border border-stone-200 bg-white p-3">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-mono text-sm font-semibold text-stone-900">{log.action}</p>
                              <p className="text-xs text-stone-500">{formatFullDate(log.created_at)}</p>
                            </div>
                            <p className="mt-1 text-sm text-stone-600">{log.detail}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-500">
                              <span>user_id: {log.user_id}</span>
                              <span>ip: {log.ip}</span>
                              <span>trace: {log.trace_id}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="jobs">
                    <div className="space-y-2">
                      {database.jobs.filter((job) => job.project_id === selectedProject.project_id).length === 0 ? (
                        <p className="rounded-md border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
                          尚無此案件的 jobs 紀錄。
                        </p>
                      ) : (
                        database.jobs
                          .filter((job) => job.project_id === selectedProject.project_id)
                          .map((job) => (
                            <div key={job.id} className="rounded-md border border-stone-200 bg-white p-3">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <p className="font-semibold text-stone-900">{job.type}</p>
                                <Badge variant="outline">{job.status}</Badge>
                              </div>
                              <p className="mt-1 text-sm text-stone-600">{job.detail}</p>
                              <p className="mt-2 font-mono text-xs text-stone-500">{job.trace_id}</p>
                            </div>
                          ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-5 w-5" />
              近期本機通知與外部對應
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {database.notifications.slice(0, 4).map((notification) => (
                <div key={notification.id} className="rounded-md border border-stone-200 bg-white p-3">
                  <p className="font-semibold text-stone-900">{notification.subject || "未命名通知"}</p>
                  <p className="mt-1 text-sm text-stone-600">{notification.to}</p>
                  <p className="mt-2 font-mono text-xs text-stone-500">{notification.trace_id}</p>
                </div>
              ))}
              {database.notifications.length === 0 && (
                <p className="rounded-md border border-dashed border-stone-300 p-6 text-sm text-stone-500">
                  尚無通知紀錄。
                </p>
              )}
              <div className="rounded-md border border-stone-200 bg-white p-3">
                <div className="flex items-center gap-2 font-semibold text-stone-900">
                  <Link2 className="h-4 w-4" />
                  API 對齊路徑
                </div>
                <p className="mt-2 font-mono text-xs text-stone-600">POST /api/v1/isafe/case-create</p>
                <p className="mt-1 font-mono text-xs text-stone-600">GET /api/v1/project/{"{case_code}"}/status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
