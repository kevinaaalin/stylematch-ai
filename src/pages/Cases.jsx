import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import {
  Activity,
  ArrowUpRight,
  CircleCheck,
  FileClock,
  FolderKanban,
  Network,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { CASE_STAGES, localStore } from "@/lib/localStore";
import { createIsafeHandoff } from "@/lib/isafeApi";
import { buildIsafeWorkspaceUrl } from "@/lib/isafeContract";

const serviceNames = {
  ai_proposal: "AI 提案",
  platform_matching: "平台媒合",
  twcid_platform: "TWCID 平台媒合",
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [searchParams] = useSearchParams();
  const requestedProjectId = searchParams.get("project") || "";
  const [database, setDatabase] = useState(() => localStore.getAll());
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const requestedProject = database.projects.find(
      (project) => project.id === requestedProjectId || project.project_id === requestedProjectId
    );
    return requestedProject?.id || database.projects[0]?.id || "";
  });
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [isCreatingIsafe, setIsCreatingIsafe] = useState(false);
  const [isafeError, setIsafeError] = useState("");

  useEffect(() => {
    const refresh = () => setDatabase(localStore.getAll());
    return localStore.subscribe(refresh);
  }, []);

  useEffect(() => {
    if (!requestedProjectId) return;
    const requestedProject = database.projects.find(
      (project) => project.id === requestedProjectId || project.project_id === requestedProjectId
    );
    if (requestedProject && requestedProject.id !== selectedProjectId) {
      setSelectedProjectId(requestedProject.id);
    }
  }, [database.projects, requestedProjectId, selectedProjectId]);

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

  const selectedIsafeWorkspaceUrl = selectedProject?.isafe_case_id
    ? selectedIsafeCase?.workspace_url || buildIsafeWorkspaceUrl(selectedProject.isafe_case_id)
    : "";

  useEffect(() => {
    const matchesRequestedProject = selectedProject?.id === requestedProjectId
      || selectedProject?.project_id === requestedProjectId;
    if (!matchesRequestedProject || !selectedProject?.isafe_case_id || !selectedIsafeWorkspaceUrl) return;
    window.location.replace(selectedIsafeWorkspaceUrl);
  }, [requestedProjectId, selectedProject?.id, selectedProject?.project_id, selectedProject?.isafe_case_id, selectedIsafeWorkspaceUrl]);

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
      const created = localStore.createIsafeCase(selectedProject.id, response.case);
      const isafeCaseId = response.case?.isafe_case_id || created?.isafeCase?.isafe_case_id;
      if (!isafeCaseId) throw new Error("iSAFE 已回應，但未提供案件編號，無法進入專案工作台。");
      const workspaceUrl = response.case?.workspace_url
        || created?.isafeCase?.workspace_url
        || buildIsafeWorkspaceUrl(isafeCaseId);
      window.location.assign(workspaceUrl);
    } catch (error) {
      setIsafeError(error.message || "無法連線至 iSAFE 本地 API");
    } finally {
      setIsCreatingIsafe(false);
    }
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
              管理 StyleMatchAI 前期案件與 TWCID 媒合；iSAFE 立案後僅保留交接識別與工作台連結，不在此管理 Gate、付款或工程證據。
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
                          onClick={() => {
                            if (project.isafe_case_id) {
                              window.location.assign(buildIsafeWorkspaceUrl(project.isafe_case_id));
                              return;
                            }
                            setSelectedProjectId(project.id);
                          }}
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
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="案件編號" value={selectedProject.case_code} />
                    <Field label="StyleMatch project_id" value={selectedProject.project_id} />
                    <Field label="服務" value={serviceNames[selectedProject.service_option] || selectedProject.service_option} />
                    <Field label="案件階段" value={getStageMeta(selectedProject.stage_status).label} />
                    <Field label="坪數" value={selectedProject.square_footage ? `${selectedProject.square_footage} 坪` : ""} />
                    <Field label="預算" value={selectedProject.budget_range} />
                  </div>

                  {selectedProject.isafe_case_id ? (
                    <div className="space-y-3 border border-teal-200 bg-teal-50 p-4">
                      <div>
                        <p className="font-semibold text-teal-950">案件已在 iSAFE 立案</p>
                        <p className="mt-1 text-sm text-teal-800">StyleMatchAI 不再提供案件管理功能，請直接進入 iSAFE 專案工作台。</p>
                      </div>
                      <Field label="iSAFE 案件編號" value={selectedProject.isafe_case_id} />
                      <a href={selectedIsafeWorkspaceUrl}>
                        <Button className="w-full bg-teal-800 hover:bg-teal-900">
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          進入 iSAFE 專案介面
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4 border border-stone-200 bg-white p-4">
                      <div>
                        <p className="font-semibold text-stone-900">iSAFE 立案交接</p>
                        <p className="mt-1 text-sm text-stone-600">此頁只完成媒合確認與立案交接；立案成功後會立即離開 StyleMatchAI，進入該案件的 iSAFE 工作台。</p>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="TWCID 媒合編號" value={selectedProject.twcid_match_id || "尚未媒合"} />
                        <Field label="媒合狀態" value={isMatchConfirmed ? "雙方已確認" : "待確認"} />
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Button onClick={handleTwcidMatch} variant="outline" disabled={Boolean(selectedProject.twcid_match_id)}>
                          <Network className="mr-2 h-4 w-4" />
                          {selectedProject.twcid_match_id ? "已建立 TWCID 媒合" : "建立 TWCID 媒合"}
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
                        disabled={isCreatingIsafe || !isMatchConfirmed}
                        className="w-full bg-stone-900 hover:bg-stone-800"
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        {isCreatingIsafe ? "正在建立 iSAFE 案件" : "成立 iSAFE 案件並進入專案工作台"}
                      </Button>
                      {isafeError && <p className="text-sm text-red-600">{isafeError}</p>}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
