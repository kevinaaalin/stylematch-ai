import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  BriefcaseBusiness,
  CheckCircle2,
  Crown,
  FolderKanban,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { localStore } from "@/lib/localStore";

const SUBSCRIPTION_STORAGE_KEY = "stylematch_active_plan_v1";

const planCatalog = [
  {
    id: "free",
    name: "免費風格測試",
    price: "免費",
    audience: "一般屋主",
    projectLimit: 1,
    aiLimit: 1,
    memberLimit: 1,
    permissions: ["免費風格測試", "查看測試結果"],
  },
  {
    id: "single",
    name: "單次購買方案",
    price: "NT$ 2,999",
    audience: "單一裝修案件",
    projectLimit: 1,
    aiLimit: 1,
    memberLimit: 1,
    permissions: ["AI 裝修規劃設計提案", "裝修預算配置", "風格與材料方向", "高解析度報告"],
  },
  {
    id: "pro",
    name: "商業方案 Pro",
    price: "NT$499/月",
    audience: "個人設計師與小型工作室",
    projectLimit: 999,
    aiLimit: 999,
    memberLimit: 1,
    permissions: ["無限次 AI 設計生成", "全部設計風格", "高解析度下載", "無限專案管理", "優先處理佇列", "去除浮水印"],
  },
  {
    id: "business",
    name: "商業方案",
    price: "NT$1,999/月",
    audience: "設計公司與團隊",
    projectLimit: 999,
    aiLimit: 999,
    memberLimit: 5,
    permissions: ["Pro 方案所有功能", "團隊協作（5人）", "API 接口", "自訂品牌浮水印", "專屬客服", "批量處理"],
  },
];

const teamMembers = [
  { name: "Kevin Chen", email: "owner@stylematch.ai", role: "Owner", plan: "商業方案", status: "啟用" },
  { name: "Project Manager", email: "pm@stylematch.ai", role: "Admin", plan: "商業方案", status: "啟用" },
  { name: "Interior Designer", email: "designer@stylematch.ai", role: "Designer", plan: "商業方案 Pro", status: "啟用" },
  { name: "Client Viewer", email: "client@example.com", role: "Viewer", plan: "單次購買方案", status: "邀請中" },
];

const rolePermissions = [
  { role: "Owner", scope: "帳務、方案、團隊、API、所有專案", level: "完整控管" },
  { role: "Admin", scope: "團隊成員、專案管理、案件狀態、報告下載", level: "管理權限" },
  { role: "Designer", scope: "建立專案、AI 生成、編輯提案、下載素材", level: "作業權限" },
  { role: "Viewer", scope: "查看指定專案、查看報告、留言確認", level: "唯讀權限" },
];

function readActivePlan() {
  try {
    return window.localStorage.getItem(SUBSCRIPTION_STORAGE_KEY) || "pro";
  } catch {
    return "pro";
  }
}

function writeActivePlan(planId) {
  try {
    window.localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, planId);
  } catch {
    // localStorage may be unavailable in private browsing; UI can still run with state.
  }
}

function UsageCard({ label, used, limit, Icon }) {
  const isUnlimited = limit >= 999;
  const percent = isUnlimited ? Math.min(used * 8, 100) : Math.min((used / limit) * 100, 100);

  return (
    <Card className="border-stone-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-950">
              {used}
              <span className="text-sm font-medium text-stone-500"> / {isUnlimited ? "無限" : limit}</span>
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-stone-100">
            <Icon className="h-5 w-5 text-stone-700" />
          </div>
        </div>
        <Progress value={percent} className="mt-4 h-2" />
      </CardContent>
    </Card>
  );
}

export default function MyProjects() {
  const [database, setDatabase] = useState(() => localStore.getAll());
  const [activePlanId, setActivePlanId] = useState(readActivePlan);

  useEffect(() => {
    const refresh = () => setDatabase(localStore.getAll());
    window.addEventListener("stylematch:data-changed", refresh);
    return () => window.removeEventListener("stylematch:data-changed", refresh);
  }, []);

  const activePlan = useMemo(
    () => planCatalog.find((plan) => plan.id === activePlanId) || planCatalog[2],
    [activePlanId]
  );

  const usage = useMemo(() => {
    const projects = database.projects || [];
    const styleTests = database.styleTests || [];
    const generatedJobs = (database.jobs || []).filter((job) => job.type?.includes("ai")).length;

    return {
      projects: projects.length,
      aiRuns: Math.max(styleTests.length + generatedJobs, projects.length),
      members: activePlan.id === "business" ? teamMembers.length : 1,
    };
  }, [database, activePlan.id]);

  const recentProjects = (database.projects || []).slice(0, 5);

  const handlePlanChange = (planId) => {
    setActivePlanId(planId);
    writeActivePlan(planId);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white">
              <BriefcaseBusiness className="h-4 w-4" />
              SaaS Workspace
            </div>
            <h1 className="text-3xl font-semibold text-stone-950">我的專案與會員權限控台</h1>
            <p className="mt-2 max-w-3xl text-stone-600">
              對應平台方案價格，集中管理目前方案、AI 使用量、專案資料、團隊成員與角色權限。這一版先沿用 localStorage MVP，後續可接會員、付款與 RBAC API。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={createPageUrl("PricingPlans")}>
              <Button variant="outline">
                <Crown className="mr-2 h-4 w-4" />
                查看平台方案價格
              </Button>
            </Link>
            <Link to={createPageUrl("Cases")}>
              <Button>
                <FolderKanban className="mr-2 h-4 w-4" />
                進入案件控台
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-stone-200 shadow-sm">
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">目前方案</Badge>
                <h2 className="text-2xl font-semibold text-stone-950">{activePlan.name}</h2>
                <p className="text-lg font-semibold text-amber-600">{activePlan.price}</p>
              </div>
              <p className="mt-2 text-stone-600">{activePlan.audience}</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {activePlan.permissions.slice(0, 6).map((permission) => (
                  <div key={permission} className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>{permission}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-stone-200 bg-white p-4">
              <p className="text-sm font-medium text-stone-600">切換 MVP 方案檢視</p>
              <div className="mt-3 grid gap-2">
                {planCatalog.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handlePlanChange(plan.id)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                      activePlan.id === plan.id
                        ? "border-amber-400 bg-amber-50 text-amber-900"
                        : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <span className="font-medium">{plan.name}</span>
                    <span className="ml-2 text-stone-500">{plan.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <UsageCard label="專案管理" used={usage.projects} limit={activePlan.projectLimit} Icon={FolderKanban} />
          <UsageCard label="AI 分析 / 生成" used={usage.aiRuns} limit={activePlan.aiLimit} Icon={Sparkles} />
          <UsageCard label="團隊成員" used={usage.members} limit={activePlan.memberLimit} Icon={Users} />
        </div>

        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">專案</TabsTrigger>
            <TabsTrigger value="members">會員與角色</TabsTrigger>
            <TabsTrigger value="permissions">權限分級</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <Card className="border-stone-200 shadow-sm">
              <CardHeader>
                <CardTitle>近期專案</CardTitle>
              </CardHeader>
              <CardContent>
                {recentProjects.length === 0 ? (
                  <div className="rounded-md border border-dashed border-stone-300 p-8 text-center text-stone-500">
                    目前尚未建立專案。完成 AI 裝修規劃設計提案後，專案會出現在這裡。
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>案件編號</TableHead>
                        <TableHead>屋況</TableHead>
                        <TableHead>服務方案</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>建立時間</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.case_code || project.project_id}</TableCell>
                          <TableCell>{project.house_type || "-"}</TableCell>
                          <TableCell>{project.service_option || "AI 裝修規劃設計提案"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{project.stage_status || "ai_review"}</Badge>
                          </TableCell>
                          <TableCell>{project.created_at ? new Date(project.created_at).toLocaleDateString("zh-TW") : "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card className="border-stone-200 shadow-sm">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>會員與團隊管理</CardTitle>
                <Button variant="outline" disabled={activePlan.id !== "business"}>
                  <Users className="mr-2 h-4 w-4" />
                  邀請成員
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>成員</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>對應方案</TableHead>
                      <TableHead>狀態</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(activePlan.id === "business" ? teamMembers : teamMembers.slice(0, 1)).map((member) => (
                      <TableRow key={member.email}>
                        <TableCell>
                          <div className="font-medium text-stone-900">{member.name}</div>
                          <div className="text-sm text-stone-500">{member.email}</div>
                        </TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>{member.plan}</TableCell>
                        <TableCell>
                          <Badge className={member.status === "啟用" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-stone-100 text-stone-700 hover:bg-stone-100"}>
                            {member.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {activePlan.id !== "business" && (
                  <div className="mt-4 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <LockKeyhole className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p>團隊協作、多人席次與角色分派屬於商業方案功能；目前方案僅開放帳號本人使用。</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card className="border-stone-200 shadow-sm">
              <CardHeader>
                <CardTitle>會員權限分級控管</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {rolePermissions.map((item) => (
                    <div key={item.role} className="rounded-md border border-stone-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-stone-700" />
                          <h3 className="font-semibold text-stone-950">{item.role}</h3>
                        </div>
                        <Badge variant="outline">{item.level}</Badge>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.scope}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
