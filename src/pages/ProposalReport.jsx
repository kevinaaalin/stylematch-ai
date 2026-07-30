import React, { useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { localStore } from "@/lib/localStore";
import { buildProposal, buildSampleProject } from "@/lib/proposalBuilder";
import { createPageUrl } from "@/utils";

function Page({ children, className = "", style }) {
  return (
    <section style={style} className={`proposal-page relative mx-auto aspect-[210/297] w-full max-w-[794px] overflow-hidden bg-white p-[7%] text-stone-900 shadow-md ${className}`}>
      {children}
    </section>
  );
}

function ImageGrid({ images, emptyText }) {
  if (!images.length) {
    return <div className="grid h-64 place-items-center border border-dashed border-stone-300 text-sm text-stone-500">{emptyText}</div>;
  }
  return (
    <div className={`grid gap-3 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
      {images.slice(0, 4).map((image, index) => (
        <img key={`${image}-${index}`} src={image} crossOrigin="anonymous" className="h-64 w-full object-cover" />
      ))}
    </div>
  );
}

export default function ProposalReport() {
  const [searchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const reportRef = useRef(null);
  const projectId = searchParams.get("project");
  const sampleMode = searchParams.get("sample") === "1";
  const database = localStore.getAll();
  const project = sampleMode
    ? buildSampleProject()
    : database.projects.find((item) => item.id === projectId || item.project_id === projectId)
      || database.projects[0]
      || buildSampleProject();
  const proposal = useMemo(() => buildProposal(project), [project]);

  const downloadPdf = async () => {
    setIsExporting(true);
    setError("");
    try {
      const pages = [...reportRef.current.querySelectorAll(".proposal-page")];
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      for (let index = 0; index < pages.length; index += 1) {
        const canvas = await html2canvas(pages[index], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        if (index > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297, undefined, "FAST");
      }
      const blobUrl = URL.createObjectURL(pdf.output("blob"));
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `StyleMatch-${proposal.caseCode}-設計提案.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (exportError) {
      console.error(exportError);
      setError("PDF 產生失敗，請確認專案圖片可正常顯示後再試一次。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 py-6">
      <div className="mx-auto mb-5 flex max-w-[900px] flex-wrap items-center justify-between gap-3 px-4">
        <div>
          <p className="text-sm font-medium text-amber-700">StyleMatch AI 提案工作流</p>
          <h1 className="text-2xl font-bold text-stone-950">設計提案預覽</h1>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("MyProjects")}><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />返回專案</Button></Link>
          <Button onClick={downloadPdf} disabled={isExporting} className="bg-stone-900 text-white hover:bg-stone-800">
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isExporting ? "正在產生 PDF" : "下載完整 PDF"}
          </Button>
        </div>
      </div>
      {error && <Alert variant="destructive" className="mx-auto mb-4 max-w-[794px]"><AlertDescription>{error}</AlertDescription></Alert>}

      <div ref={reportRef} className="space-y-5 px-4">
        <Page className="flex flex-col justify-between" style={{ backgroundColor: "#0c0a09", color: "#ffffff" }}>
          <div className="flex items-center gap-3 text-sm tracking-widest text-amber-300"><FileText className="h-5 w-5" />STYLEMATCH AI</div>
          <div>
            <p className="mb-4 text-sm tracking-widest text-stone-300">{proposal.caseCode}</p>
            <h2 className="max-w-xl text-5xl font-bold leading-tight">{proposal.title}</h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-stone-300">{proposal.concept.title}</p>
          </div>
          {proposal.hero && <img src={proposal.hero} crossOrigin="anonymous" className="h-[42%] w-full object-cover" />}
          <div className="flex justify-between text-sm text-stone-400"><span>前期概念提案</span><span>{proposal.date}</span></div>
        </Page>

        <Page>
          <p className="text-sm font-semibold text-amber-700">01 / PROJECT BRIEF</p>
          <h2 className="mt-3 text-4xl font-bold">專案需求摘要</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6">
            {proposal.facts.map(([label, value]) => (
              <div key={label} className="border-b border-stone-200 pb-3">
                <p className="text-xs text-stone-500">{label}</p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-stone-100 p-8">
            <h3 className="text-xl font-bold">核心需求</h3>
            <p className="mt-3 leading-8 text-stone-700">{proposal.concept.requirement}</p>
          </div>
        </Page>

        <Page>
          <p className="text-sm font-semibold text-amber-700">02 / DESIGN CONCEPT</p>
          <h2 className="mt-3 text-4xl font-bold">設計概念與空間調性</h2>
          <div className="mt-12 border-l-4 border-amber-500 pl-7">
            <h3 className="text-2xl font-bold">{proposal.concept.title}</h3>
            <p className="mt-5 text-lg leading-9 text-stone-700">{proposal.concept.narrative}</p>
          </div>
          <div className="mt-14 grid grid-cols-3 gap-4">
            {["光線", "材質", "生活動線"].map((item, index) => (
              <div key={item} className="bg-stone-100 p-6">
                <p className="text-3xl font-black text-amber-200">0{index + 1}</p>
                <h3 className="mt-5 text-lg font-bold">{item}</h3>
              </div>
            ))}
          </div>
          <p className="mt-12 leading-8 text-stone-700">{proposal.concept.planning}</p>
        </Page>

        <Page>
          <p className="text-sm font-semibold text-amber-700">03 / TONE & MANNER</p>
          <h2 className="mt-3 text-4xl font-bold">風格意象與參考圖片</h2>
          <p className="mt-4 leading-7 text-stone-600">圖片來自專案偏好資料，用於對齊色彩、材質、光感與家具語彙，不直接等同最終成果。</p>
          <div className="mt-8"><ImageGrid images={proposal.references} emptyText="此專案尚未提供風格參考圖片" /></div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center text-sm">
            {["自然低彩度", "材質層次", "明暗平衡"].map((item) => <div key={item} className="border border-stone-200 py-4">{item}</div>)}
          </div>
        </Page>

        {proposal.floorPlans.length > 0 && (
          <Page>
            <p className="text-sm font-semibold text-amber-700">04 / LAYOUT</p>
            <h2 className="mt-3 text-4xl font-bold">平面配置參考</h2>
            <p className="mt-4 leading-7 text-stone-600">依使用者提供的平面資料整理；正式尺寸、牆體與設備位置仍須現場丈量及專業設計師確認。</p>
            <div className="mt-8"><ImageGrid images={proposal.floorPlans} emptyText="" /></div>
          </Page>
        )}

        <Page>
          <p className="text-sm font-semibold text-amber-700">05 / SPACE REVIEW</p>
          <h2 className="mt-3 text-4xl font-bold">空間現況與規劃方向</h2>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {proposal.spaces.slice(0, 4).map((space) => (
              <figure key={`${space.room}-${space.url}`} className="border border-stone-200">
                <img src={space.url} crossOrigin="anonymous" className="h-52 w-full object-cover" />
                <figcaption className="p-3 text-sm font-medium">{space.label}</figcaption>
              </figure>
            ))}
          </div>
          {!proposal.spaces.length && <div className="mt-8 grid h-72 place-items-center border border-dashed border-stone-300 text-stone-500">尚無可納入提案的空間照片</div>}
        </Page>

        <Page>
          <p className="text-sm font-semibold text-amber-700">06 / MATERIAL DIRECTION</p>
          <h2 className="mt-3 text-4xl font-bold">材料使用建議方向</h2>
          <div className="mt-9 space-y-4">
            {proposal.materials.map((material) => (
              <div key={material.category} className="grid grid-cols-[90px_1fr] gap-5 border-b border-stone-200 pb-4">
                <h3 className="font-bold text-amber-700">{material.category}</h3>
                <div><p className="font-semibold">{material.suggestion}</p><p className="mt-1 text-sm leading-6 text-stone-600">{material.note}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6" style={{ backgroundColor: "#0c0a09", color: "#ffffff" }}>
            <h3 className="font-bold">預算與落地提醒</h3>
            <p className="mt-2 text-sm leading-6 text-stone-300">{proposal.budgetNote}</p>
          </div>
          <p className="mt-8 text-xs leading-5 text-stone-500">{proposal.disclaimer}</p>
        </Page>
      </div>
    </div>
  );
}
