import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Camera, FileCheck2, FolderKanban, Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { localStore } from "@/lib/localStore";
import { createPageUrl } from "@/utils";

const tools = [
  { title: "提案總覽", description: "需求、風格、預算與初版提案", page: "MyProjects", icon: FolderKanban },
  { title: "平面圖 AI 視覺化", description: "鳥瞰圖、遮罩區域重繪、相機位置與 FOV", page: "FloorPlanVisualizer", icon: Layers3 },
  { title: "空間與 360° 環景", description: "各空間參考圖與環景預覽", page: "AIGenerate", icon: Camera },
  { title: "提案圖確認", description: "比較圖片版本並鎖定正式採用圖組", page: "ReferenceCanvas", icon: FileCheck2 },
];

export default function Workspace() {
  const [searchParams] = useSearchParams();
  const [database, setDatabase] = useState(() => localStore.getAll());
  const projects = database.projects || [];
  const [projectId, setProjectId] = useState(searchParams.get("project") || projects[0]?.project_id || "");

  useEffect(() => localStore.subscribe(() => setDatabase(localStore.getAll())), []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div><Badge variant="outline">StyleMatch AI Workspace</Badge><h1 className="mt-3 text-3xl font-bold">專案工作區</h1><p className="mt-2 text-stone-600">從提案需求、平面圖深化到空間生成與圖片定稿，依序完成同一份專案。</p></div>
        <label className="text-sm font-medium">目前專案
          <select className="mt-2 block h-10 min-w-72 rounded-md border border-stone-300 bg-white px-3" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            <option value="">尚未選擇專案</option>{projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.case_code} - {project.project_name || project.name || "未命名專案"}</option>)}
          </select>
        </label>
      </div>

      {!projects.length && <div className="mt-8 border border-amber-200 bg-amber-50 p-5"><p className="font-semibold">請先建立專案</p><p className="mt-1 text-sm text-stone-600">完成裝修需求後，工作區會沿用同一個專案識別碼。</p><Button asChild className="mt-4"><Link to={createPageUrl("AIProposal")}>建立 AI 裝修規劃提案</Link></Button></div>}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {tools.map((tool, index) => (
          <Card key={tool.title} className="rounded-md border-stone-200 shadow-none"><CardContent className="flex min-h-40 flex-col p-5">
            <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-stone-900 text-white"><tool.icon className="h-5 w-5" /></span><div><p className="text-xs font-semibold text-amber-700">步驟 {index + 1}</p><h2 className="text-lg font-bold">{tool.title}</h2></div></div></div>
            <p className="mt-4 text-sm text-stone-600">{tool.description}</p>
            <Button asChild variant="outline" className="mt-auto self-start" disabled={!projectId && tool.page !== "MyProjects"}><Link to={`${createPageUrl(tool.page)}${projectId ? `?project=${projectId}` : ""}`}>開啟<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </CardContent></Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-stone-200 pt-6 text-sm text-stone-600"><span>提案確認後可進入</span><Button asChild variant="outline" size="sm"><Link to={createPageUrl("Cases")}>TWCID 設計師媒合</Link></Button><span>簽約後再銜接</span><Button asChild variant="outline" size="sm"><Link to={createPageUrl("IsafeProjects")}>iSAFE 2.0</Link></Button></div>
    </div>
  );
}

