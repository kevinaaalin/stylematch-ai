import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Crown, Download, FileText, LockKeyhole, ShieldCheck, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { localStore } from "@/lib/localStore";
import { readActivePlan, setActivePlan } from "@/lib/planAccess";
import { createPageUrl } from "@/utils";

const plans = [
  { id: "free", name: "免費體驗", price: "免費", limit: "1 個專案", features: ["風格測驗", "基礎需求保存"] },
  { id: "single", name: "單次購買方案", price: "NT$ 2,999", limit: "1 份固定範圍提案", features: ["空間需求整理", "裝修預算配置", "設計理念、風格照片與材料方向"] },
  { id: "pro", name: "商業方案 Pro", price: "NT$ 499 / 月", limit: "無限專案", features: ["扣點功能資格", "AI 圖片生成", "高解析度下載"] },
  { id: "business", name: "商業方案 Team", price: "NT$ 1,999 / 月", limit: "5 位成員", features: ["扣點功能資格", "團隊權限", "API 與企業整合"] },
];

const members = [
  { name: "Kevin Chen", email: "owner@stylematch.ai", role: "Owner", scope: "方案、付款、成員、專案與整合設定" },
  { name: "Project Manager", email: "pm@stylematch.ai", role: "Admin", scope: "專案管理、案件狀態與報告下載" },
  { name: "Interior Designer", email: "designer@stylematch.ai", role: "Designer", scope: "需求整理、提案預覽、圖片與材料內容" },
  { name: "Client Viewer", email: "client@example.com", role: "Viewer", scope: "僅檢視指定專案及已發布提案" },
];

function serviceLabel(value) {
  if (value === "ai_proposal") return "AI 裝修規劃設計提案";
  if (value === "platform_matching") return "專業設計師媒合";
  if (value === "twcid_platform") return "TWCID 平台招標媒合";
  return value || "需求整理";
}

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function MyProjects() {
  const [database, setDatabase] = useState(() => localStore.getAll());
  const [planId, setPlanId] = useState(readActivePlan);
  const [dataTransferStatus, setDataTransferStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const refresh = () => setDatabase(localStore.getAll());
    return localStore.subscribe(refresh);
  }, []);

  const activePlan = useMemo(() => plans.find((plan) => plan.id === planId) || plans[2], [planId]);
  const projects = database.projects || [];
  const dataCounts = useMemo(() => ({
    projects: database.projects?.length || 0,
    styleTests: database.styleTests?.length || 0,
    isafeCases: database.isafeCases?.length || 0,
    auditLogs: database.auditLogs?.length || 0,
  }), [database]);

  const changePlan = (nextPlan) => setPlanId(setActivePlan(nextPlan));

  const exportLocalData = () => {
    const exportPayload = localStore.exportData();
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(exportPayload, `stylematch-local-data-${date}.json`);
    setDataTransferStatus({ type: "export", message: `已匯出 ${exportPayload.database.projects.length} 筆專案資料。` });
  };

  const importLocalData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const summary = localStore.importData(await file.text(), { mode: "merge" });
      const backupTime = summary.backup.exported_at.replace(/[:.]/g, "-");
      downloadJson(summary.backup, `stylematch-before-import-${backupTime}.json`);
      setDatabase(localStore.getAll());
      setDataTransferStatus({ type: "import", summary });
    } catch {
      setDataTransferStatus({ type: "error", message: "匯入失敗，請確認檔案是 StyleMatch 匯出的 JSON，且瀏覽器有足夠的儲存空間。" });
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white">
            <BriefcaseBusiness className="h-4 w-4" />StyleMatch AI Workspace
          </div>
          <h1 className="mt-4 text-3xl font-bold text-stone-950">我的專案與會員權限控台</h1>
          <p className="mt-2 text-stone-600">管理 StyleMatch 方案、裝修需求、圖片、設計提案與團隊權限。</p>
        </header>

        <section className="mb-5 border border-stone-200 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold text-stone-900">LocalStorage 資料搬移</p>
              <p className="mt-1 text-sm text-stone-600">
                將本機案例匯出成 JSON，再到 GitHub Pages 匯入；資料會合併，不會清空既有專案。
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-600">
                <Badge variant="outline">專案 {dataCounts.projects}</Badge>
                <Badge variant="outline">風格測試 {dataCounts.styleTests}</Badge>
                <Badge variant="outline">iSAFE {dataCounts.isafeCases}</Badge>
                <Badge variant="outline">Audit {dataCounts.auditLogs}</Badge>
              </div>
              {dataTransferStatus?.message && (
                <p className={`mt-2 text-sm ${dataTransferStatus.type === "error" ? "text-red-700" : "text-emerald-700"}`}>
                  {dataTransferStatus.message}
                </p>
              )}
              {dataTransferStatus?.type === "import" && (
                <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
                  <p className="font-semibold">匯入完成，匯入前備份已自動下載</p>
                  <p className="mt-1">
                    寫入 {dataTransferStatus.summary.imported} 筆、略過 {dataTransferStatus.summary.skipped} 筆；偵測到 {dataTransferStatus.summary.conflicts} 筆 ID 衝突。
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {[
                      ["專案", "projects"],
                      ["iSAFE case", "isafeCases"],
                      ["Audit", "auditLogs"],
                    ].map(([label, key]) => {
                      const item = dataTransferStatus.summary.collections[key];
                      return item && (
                        <Badge key={key} variant="outline" className="border-emerald-300 bg-white text-emerald-900">
                          {label}：新增 {item.added}／更新 {item.updated}／略過 {item.skipped}
                        </Badge>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-emerald-800">相同 ID 僅在匯入資料的 updated_at 較新時更新；時間相同或較舊皆保留本機版本。</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={exportLocalData}>
                <Download className="mr-2 h-4 w-4" />
                匯出資料
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                匯入資料
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={importLocalData}
              />
            </div>
          </div>
        </section>

        <Tabs defaultValue="projects" className="space-y-5">
          <TabsList className="h-auto flex-wrap justify-start">
            <TabsTrigger value="plan"><Crown className="mr-2 h-4 w-4" />目前方案</TabsTrigger>
            <TabsTrigger value="projects"><FileText className="mr-2 h-4 w-4" />StyleMatch 專案</TabsTrigger>
            <TabsTrigger value="members"><Users className="mr-2 h-4 w-4" />會員與權限</TabsTrigger>
          </TabsList>

          <TabsContent value="plan">
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <Card className="border-stone-200 shadow-sm">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">目前方案</Badge>
                    <CardTitle className="text-2xl">{activePlan.name}</CardTitle>
                    <span className="text-lg font-bold text-amber-700">{activePlan.price}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-600">{activePlan.limit}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {activePlan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 border border-stone-200 bg-white p-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />{feature}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Link to={createPageUrl("PricingPlans")}>
                      <Button className="bg-stone-900 text-white hover:bg-stone-800">
                        升級目前方案<ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline">管理付款方式</Button>
                  </div>
                </CardContent>
              </Card>
              <div className="border border-stone-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-bold text-stone-900">切換 MVP 方案檢視</h2>
                  <Link to={createPageUrl("PricingPlans")}>
                    <Button size="sm" variant="outline">
                      查看平台方案價格<ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-4 space-y-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => changePlan(plan.id)}
                      className={`w-full border px-3 py-3 text-left text-sm ${plan.id === activePlan.id ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:bg-stone-50"}`}
                    >
                      <span className="font-semibold">{plan.name}</span><span className="ml-2 text-stone-500">{plan.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <section className="border border-stone-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-5">
                <div>
                  <h2 className="text-xl font-bold text-stone-950">StyleMatch 專案</h2>
                  <p className="mt-1 text-sm text-stone-600">此區僅管理裝修需求、圖片與設計提案，不代表已進入 iSAFE 工程監管。</p>
                </div>
                <Link to={createPageUrl("AIProposal")}><Button>建立新專案</Button></Link>
              </div>
              {projects.length ? (
                <div className="divide-y divide-stone-200">
                  {projects.map((project) => (
                    <div key={project.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-stone-900">{project.case_code}</h3>
                          <Badge variant="outline">{serviceLabel(project.service_option)}</Badge>
                          {project.isafe_case_id && <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">已銜接 iSAFE</Badge>}
                        </div>
                        <p className="mt-2 text-sm text-stone-600">
                          {project.house_type || "房屋類型待確認"} · {project.square_footage ? `${project.square_footage} 坪` : "坪數待確認"} · {project.room_layout || "格局待確認"}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">建立日期：{new Date(project.created_at).toLocaleDateString("zh-TW")}</p>
                      </div>
                      <Link to={`${createPageUrl("ProjectDetail")}?project=${project.project_id}`}>
                        <Button variant="outline">開啟專案內頁<ArrowRight className="ml-2 h-4 w-4" /></Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-stone-500">目前尚未建立 StyleMatch 專案。</div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="members">
            <section className="border border-stone-200 bg-white">
              <div className="border-b border-stone-200 p-5">
                <h2 className="text-xl font-bold">會員與角色權限</h2>
                <p className="mt-1 text-sm text-stone-600">權限只適用於 StyleMatch 工作區；iSAFE 另有工程治理角色與稽核權限。</p>
              </div>
              <div className="divide-y divide-stone-200">
                {members.slice(0, activePlan.id === "business" ? members.length : 1).map((member) => (
                  <div key={member.email} className="grid gap-3 p-5 md:grid-cols-[220px_120px_1fr_auto] md:items-center">
                    <div><p className="font-semibold">{member.name}</p><p className="text-sm text-stone-500">{member.email}</p></div>
                    <Badge variant="outline" className="w-fit">{member.role}</Badge>
                    <p className="text-sm text-stone-600">{member.scope}</p>
                    <Button size="icon" variant="ghost" title="權限設定"><LockKeyhole className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <section className="mt-8 border-l-4 border-teal-600 bg-teal-950 p-6 text-white">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-teal-300"><ShieldCheck className="h-5 w-5" />獨立工程治理系統</div>
              <h2 className="mt-2 text-2xl font-bold">進入案件 iSAFE 控台</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-teal-100">
                StyleMatch 負責裝修需求與設計提案；案件完成媒合、人工確認並正式立案後，才進入 iSAFE 工程階段、Gate、證據與稽核流程。
              </p>
            </div>
            <Link to={createPageUrl("Cases")}>
              <Button className="bg-teal-500 text-teal-950 hover:bg-teal-400">進入案件 iSAFE 控台<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
