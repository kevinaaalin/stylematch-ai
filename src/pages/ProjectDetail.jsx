import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { localStore } from "@/lib/localStore";
import { createPageUrl } from "@/utils";

const roomLabels = {
  floor_plan: "平面配置",
  living_room: "客廳",
  dining_room: "餐廳",
  kitchen: "廚房",
  master_bedroom: "主臥室",
  study_room: "書房",
  bedroom1: "臥室一",
  bedroom2: "臥室二",
  bathroom: "衛浴",
};

function Field({ label, value }) {
  return <div className="border-b border-stone-200 pb-3"><p className="text-xs text-stone-500">{label}</p><p className="mt-1 font-semibold text-stone-900">{value || "未提供"}</p></div>;
}

export default function ProjectDetail() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  const [database, setDatabase] = useState(() => localStore.getAll());

  useEffect(() => {
    const refresh = () => setDatabase(localStore.getAll());
    return localStore.subscribe(refresh);
  }, []);

  const project = useMemo(
    () => database.projects.find((item) => item.id === projectId || item.project_id === projectId),
    [database.projects, projectId]
  );

  if (!project) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center"><h1 className="text-2xl font-bold">找不到此專案</h1><Link to={createPageUrl("MyProjects")}><Button className="mt-5">返回專案控台</Button></Link></div>;
  }

  const media = project.proposal_media || {};
  const photos = Object.entries(media.space_photos || {}).flatMap(([room, images]) => images.map((url) => ({ room, url })));

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link to={createPageUrl("MyProjects")} className="inline-flex items-center text-sm text-stone-600 hover:text-stone-950"><ArrowLeft className="mr-2 h-4 w-4" />返回我的專案</Link>
        <header className="mt-5 border-b border-stone-200 pb-6">
          <div className="flex flex-wrap items-center gap-3"><Badge variant="outline">StyleMatch 專案</Badge><span className="text-sm text-stone-500">{project.case_code}</span></div>
          <h1 className="mt-3 text-3xl font-bold text-stone-950">{project.house_type || "住宅"}裝修規劃專案</h1>
          <p className="mt-2 text-stone-600">需求、圖片與設計提案集中管理。本頁不執行 iSAFE 工程 Gate 或稽核。</p>
        </header>

        <section className="py-7">
          <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-amber-700" /><h2 className="text-xl font-bold">專案需求內容</h2></div>
          <div className="mt-5 grid gap-5 bg-white p-6 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="房屋類型" value={project.house_type} />
            <Field label="屋齡" value={project.house_age} />
            <Field label="坪數" value={project.square_footage ? `${project.square_footage} 坪` : ""} />
            <Field label="格局" value={project.room_layout} />
            <Field label="預算範圍" value={project.budget_range} />
            <Field label="建材等級" value={project.material_grade} />
            <div className="sm:col-span-2 lg:col-span-3"><Field label="空間調性與偏好" value={project.atmosphere_description} /></div>
            <div className="sm:col-span-2 lg:col-span-3"><Field label="特殊需求" value={project.special_requirements} /></div>
          </div>
        </section>

        <section className="border-t border-stone-200 py-7">
          <div className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-amber-700" /><h2 className="text-xl font-bold">專案圖片</h2></div>
          {photos.length || media.reference_photos?.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...(media.reference_photos || []).map((url) => ({ room: "風格參考", url })), ...photos].map((photo, index) => (
                <figure key={`${photo.url}-${index}`} className="border border-stone-200 bg-white">
                  <img src={photo.url} alt={`${roomLabels[photo.room] || photo.room} ${index + 1}`} className="h-56 w-full object-cover" />
                  <figcaption className="p-3 text-sm font-medium">{roomLabels[photo.room] || photo.room}</figcaption>
                </figure>
              ))}
            </div>
          ) : <div className="mt-5 border border-dashed border-stone-300 p-8 text-center text-stone-500">這筆舊專案沒有保存可預覽的圖片。</div>}
        </section>

        <section className="border-t border-stone-200 py-7">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-amber-50 p-6">
            <div><h2 className="text-xl font-bold">設計提案預覽</h2><p className="mt-1 text-sm text-stone-600">依本專案需求與圖片自動組成完整提案，可預覽並下載 PDF。</p></div>
            <Link to={`${createPageUrl("ProposalReport")}?project=${project.project_id}`}><Button className="bg-stone-900 text-white hover:bg-stone-800">開啟設計提案<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </section>

        <section className="mt-3 border-l-4 border-teal-600 bg-teal-950 p-6 text-white">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div><div className="flex items-center gap-2 text-sm font-semibold text-teal-300"><ShieldCheck className="h-5 w-5" />iSAFE 工程監管</div><h2 className="mt-2 text-xl font-bold">此為獨立的工程治理程序</h2><p className="mt-2 text-sm leading-6 text-teal-100">只有完成媒合、人工確認及 iSAFE 立案後，才會開始工程 Gate、證據、付款資格與稽核管理。</p></div>
            <Link to={`${createPageUrl("Cases")}?project=${project.project_id}`}><Button className="bg-teal-500 text-teal-950 hover:bg-teal-400">進入案件 iSAFE 控台<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </section>
      </div>
    </div>
  );
}
