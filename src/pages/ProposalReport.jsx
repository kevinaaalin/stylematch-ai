import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { localStore } from "@/lib/localStore";
import { buildProposal, buildSampleProject } from "@/lib/proposalBuilder";
import { createPageUrl } from "@/utils";
import { chunks, proposalDeliveryContent } from "@/lib/proposalDeliveryContent";
import { captureProposalPdf } from "@/lib/proposalPdf";
import { createProposalBrief } from "@/lib/awosProposalBrief";
import { resolveProposalVersion } from "@/lib/proposalVersions";

function Page({ children, className = "", style }) {
  return (
    <section style={style} className={`proposal-page relative mx-auto min-h-[650px] w-full max-w-[794px] bg-white p-[7%] text-stone-900 shadow-md [overflow-wrap:anywhere] ${className}`}>
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
      {images.map((image, index) => (
        <img key={`${image}-${index}`} src={image} alt={`提案圖片 ${index + 1}`} crossOrigin="anonymous" className="h-64 w-full object-contain" />
      ))}
    </div>
  );
}

export default function ProposalReport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [database, setDatabase] = useState(() => localStore.getAll());
  const reportRef = useRef(null);
  const projectId = searchParams.get("project");
  const sampleMode = searchParams.get("sample") === "1";
  const versionId = searchParams.get("version") || "";
  const setVersionId = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("version", value);
    else next.delete("version");
    setSearchParams(next);
  };

  useEffect(() => {
    const refresh = () => setDatabase(localStore.getAll());
    return localStore.subscribe(refresh);
  }, []);

  const currentProject = sampleMode
    ? buildSampleProject()
    : database.projects.find((item) => item.id === projectId || item.project_id === projectId);
  const versions = currentProject?.proposal_versions || [];
  const project = resolveProposalVersion(currentProject, versionId);
  const proposal = useMemo(() => project ? buildProposal(project) : null, [project]);
  const delivery = useMemo(() => project ? proposalDeliveryContent(project) : null, [project]);

  const downloadPdf = async () => {
    setIsExporting(true);
    setError("");
    try {
      const blobUrl = URL.createObjectURL(await captureProposalPdf(reportRef.current, { html2canvas, jsPDF }));
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `StyleMatch-${proposal.caseCode.replace(/[^\p{L}\p{N}_-]/gu, "_")}-${versionId || "current"}-設計提案.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (exportError) {
      console.error(exportError);
      setError("PDF 未完成。請確認所有圖片可讀取並允許跨來源下載，或縮短過長的單一章節後重試；未交付缺圖或被裁切的版本。");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadAwosBrief = async () => {
    setError("");
    try {
      const handoff = await createProposalBrief(project, versionId || "current-unfrozen", proposal.analysis.style.primary_style);
      const url = URL.createObjectURL(new Blob([JSON.stringify(handoff,null,2)],{type:"application/json"}));
      const anchor = document.createElement("a");anchor.href=url;anchor.download="stylematch-awos-proposal-brief.json";
      document.body.appendChild(anchor);anchor.click();anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    } catch (failure) { setError(failure.message); }
  };

  if (!proposal) return <div className="mx-auto max-w-3xl p-6"><Alert><AlertDescription>找不到指定專案或提案版本，請返回我的專案重新選擇。</AlertDescription></Alert><Link to={createPageUrl("MyProjects")}>返回我的專案</Link></div>;

  return (
    <div className="min-h-screen bg-stone-100 py-6">
      <div className="mx-auto mb-5 flex max-w-[900px] flex-wrap items-center justify-between gap-3 px-4">
        <div>
          <p className="text-sm font-medium text-amber-700">StyleMatch AI 提案工作流</p>
          <h1 className="text-2xl font-bold text-stone-950">設計提案預覽</h1>
          <p className="mt-2 text-sm text-stone-600">包含完整圖像、概念、方案、材料、預算依據與待確認事項。下載不重新生圖、不扣點。</p>
          {versions.length > 0 && <label className="mt-3 block text-sm">提案版本<select disabled={isExporting} className="ml-2 max-w-full rounded-md border p-2" value={versionId} onChange={(event) => setVersionId(event.target.value)}><option value="">目前資料預覽</option>{versions.map((item) => <option key={item.version_id} value={item.version_id}>v{item.version} · {item.created_at}</option>)}</select></label>}
        </div>
        <div className="flex max-w-full flex-wrap gap-2">
          <Button variant="outline" onClick={downloadAwosBrief} disabled={isExporting}>匯出 AWOS 案件交接檔</Button>
          <Link to={createPageUrl("MyProjects")}><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />返回專案</Button></Link>
          <Button onClick={downloadPdf} disabled={isExporting} className="bg-stone-900 text-white hover:bg-stone-800">
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isExporting ? "正在產生 PDF" : "下載完整 PDF"}
          </Button>
        </div>
      </div>
      <p className="mx-auto mb-4 max-w-[900px] px-4 text-sm text-stone-600">AWOS 交接檔僅包含本版本的案件需求與來源識別，不匯出聯絡信箱、生日欄位或圖片內容；需求自由文字仍請自行核對。匯入後仍須核准計畫，再重新產生概念成果；它不是完整圖文提案或治理核准。</p>
      {error && <Alert variant="destructive" className="mx-auto mb-4 max-w-[794px]"><AlertDescription>{error}</AlertDescription></Alert>}

      <div ref={reportRef} className="space-y-5 px-4">
        <Page className="flex flex-col justify-between" style={{ backgroundColor: "#0c0a09", color: "#ffffff" }}>
          <div className="flex items-center gap-3 text-sm tracking-widest text-amber-300"><FileText className="h-5 w-5" />STYLEMATCH AI</div>
          <div>
            <p className="mb-4 text-sm tracking-widest text-stone-300">{proposal.caseCode}</p>
            <h2 className="max-w-xl text-5xl font-bold leading-tight">{proposal.title}</h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-stone-300">{proposal.concept.title}</p>
          </div>
          {proposal.hero && <img src={proposal.hero} alt="專案風格封面" crossOrigin="anonymous" className="my-6 h-80 w-full object-contain" />}
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
          <p className="text-sm font-semibold text-amber-700">03 / DETERMINISTIC ANALYSIS</p>
          <h2 className="mt-3 text-4xl font-bold">風格與預算分析</h2>
          <div className="mt-8 grid grid-cols-[1fr_auto] items-end gap-6 border-b border-stone-200 pb-6">
            <div>
              <p className="text-xs font-semibold tracking-widest text-stone-500">PRIMARY STYLE</p>
              <p className="mt-2 text-3xl font-bold">{proposal.analysis.style.primary_style_label}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-500">分析信心</p>
              <p className="text-3xl font-black text-amber-600">{proposal.analysis.style.confidence}%</p>
            </div>
          </div>
          <div className="mt-7 space-y-3">
            {proposal.analysis.style.distribution.slice(0, 5).map((item) => (
              <div key={item.key}>
                <div className="mb-1 flex justify-between text-sm"><span>{item.label}</span><strong>{item.percentage}%</strong></div>
                <div className="h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full bg-amber-500" style={{ width: `${item.percentage}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-7 bg-stone-100 p-5">
            <h3 className="font-bold">判定理由</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
              {proposal.analysis.style.reasons.map((reason) => <li key={reason}>• {reason}</li>)}
            </ul>
          </div>
          <div className="mt-7 border border-stone-200 p-5">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs text-stone-500">預算估算區間</p><p className="mt-1 text-2xl font-bold">{proposal.analysis.budget.formatted_range}</p></div>
              <p className="text-sm font-semibold text-stone-600">信心 {proposal.analysis.budget.confidence}%</p>
            </div>
            {proposal.analysis.budget.risk_flags.length > 0 && (
              <div className="mt-4 space-y-2">
                {proposal.analysis.budget.risk_flags.map((risk) => (
                  <div key={risk.code} className="flex gap-2 text-sm text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 flex-none" /><span>{risk.message}</span></div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-5 text-xs leading-5 text-stone-500">{proposal.analysis.budget.disclaimer}</p>
        </Page>

        <Page>
          <p className="text-sm font-semibold text-amber-700">04 / TONE & MANNER</p>
          <h2 className="mt-3 text-4xl font-bold">Tone &amp; Manner</h2>
          <p className="mt-4 text-xl font-semibold text-stone-700">{proposal.styleProfile.name}</p>
          <p className="mt-3 leading-7 text-stone-600">{proposal.styleProfile.summary}</p>
          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold tracking-widest text-stone-500">KEYWORDS</p>
            <div className="flex flex-wrap gap-3">{proposal.toneManner.keywords.map((item) => <span key={item} className="border border-stone-300 px-4 py-2 text-sm">{item}</span>)}</div>
          </div>
          <div className="mt-10">
            <p className="mb-3 text-xs font-semibold tracking-widest text-stone-500">COLOR DIRECTION</p>
            <div className="grid grid-cols-4 gap-3">{proposal.toneManner.palette.map((item, index) => <div key={item} className="flex h-24 items-end p-3 text-sm font-semibold" style={{ backgroundColor: ["#ede7de", "#d6cbbb", "#8a8178", "#3c3835"][index % 4], color: index > 1 ? "white" : "#292524" }}>{item}</div>)}</div>
          </div>
          <div className="mt-10">
            <p className="mb-3 text-xs font-semibold tracking-widest text-stone-500">MATERIAL DIRECTION</p>
            <div className="grid grid-cols-2 gap-3">{proposal.toneManner.materials.map((item) => <div key={item} className="bg-stone-100 px-5 py-4 text-sm font-semibold">{item}</div>)}</div>
          </div>
        </Page>

        <Page>
          <p className="text-sm font-semibold text-amber-700">05 / DESIGN OPTIONS</p>
          <h2 className="mt-3 text-4xl font-bold">三種設計方案方向</h2>
          <p className="mt-4 leading-7 text-stone-600">三案使用相同需求基礎，以風格濃度、材料配置與預算策略形成差異；確認方案後再進入圖片生成與提案定稿。</p>
          <div className="mt-9 space-y-5">
            {proposal.designOptions.map((option) => (
              <article key={option.id} className={`border p-6 ${option.recommended ? "border-amber-500 bg-amber-50" : "border-stone-200"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div><h3 className="text-xl font-bold">{option.name}</h3><p className="mt-1 text-sm font-semibold text-amber-700">{option.ratio}</p></div>
                  {option.recommended && <span className="inline-block self-start bg-amber-600 px-3 py-2 text-xs font-bold leading-6 text-white">建議深化</span>}
                </div>
                <p className="mt-4 leading-7 text-stone-700">{option.description}</p>
                <p className="mt-3 border-t border-stone-200 pt-3 text-sm text-stone-500">取捨：{option.tradeoff}</p>
              </article>
            ))}
          </div>
        </Page>

        {(chunks(proposal.references).length ? chunks(proposal.references) : [[]]).map((images, index) => <Page key={`references-${index}`}>
          <p className="text-sm font-semibold text-amber-700">06 / REFERENCES · {index + 1}</p>
          <h2 className="mt-3 text-4xl font-bold">風格參考圖片</h2>
          <p className="mt-4 leading-7 text-stone-600">圖片來自專案偏好資料，用於對齊色彩、材質、光感與家具語彙，不直接等同最終成果。</p>
          <div className="mt-8"><ImageGrid images={images} emptyText="此專案尚未提供風格參考圖片" /></div>
        </Page>)}

        {chunks(proposal.floorPlans).map((images, index) => (
          <Page key={`floor-${index}`}>
            <p className="text-sm font-semibold text-amber-700">07 / LAYOUT</p>
            <h2 className="mt-3 text-4xl font-bold">平面配置參考</h2>
            <p className="mt-4 leading-7 text-stone-600">依使用者提供的平面資料整理；正式尺寸、牆體與設備位置仍須現場丈量及專業設計師確認。</p>
            <div className="mt-8"><ImageGrid images={images} emptyText="" /></div>
          </Page>
        ))}

        {(chunks(proposal.spaces).length ? chunks(proposal.spaces) : [[]]).map((spaces, index) => <Page key={`space-${index}`}>
          <p className="text-sm font-semibold text-amber-700">08 / SPACE REVIEW</p>
          <h2 className="mt-3 text-4xl font-bold">空間現況與規劃方向</h2>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {spaces.map((space) => (
              <figure key={`${space.room}-${space.url}`} className="border border-stone-200">
                <img src={space.url} alt={space.label} crossOrigin="anonymous" className="h-52 w-full object-contain" />
                <figcaption className="p-3 text-sm font-medium">{space.label}</figcaption>
              </figure>
            ))}
          </div>
          {!proposal.spaces.length && <div className="mt-8 grid h-72 place-items-center border border-dashed border-stone-300 text-stone-500">尚無可納入提案的空間照片</div>}
        </Page>)}

        {chunks(delivery.adopted, 2).map((images, index) => <Page key={`adopted-${index}`}>
          <p className="text-sm font-semibold text-amber-700">ADOPTED DESIGNS · {index + 1}</p>
          <h2 className="mt-3 text-3xl font-bold">提案採用圖像</h2>
          <p className="mt-4 text-sm text-stone-600">使用生成此提案時確認的圖片組，不以工作區後續修改覆蓋。圖像為概念示意，非施工依據。</p>
          {images.map((image) => <figure key={image.revision_id} className="mt-6 border border-stone-200 p-3">
            <img src={image.image_url} alt={image.space || "採用設計圖"} crossOrigin="anonymous" className="h-72 w-full object-contain" />
            <figcaption className="mt-2 text-sm">{image.space || "設計圖"} · v{image.version || 1} · {image.revision_id}</figcaption>
          </figure>)}
        </Page>)}

        <Page>
          <p className="text-sm font-semibold text-amber-700">09 / MATERIAL DIRECTION</p>
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

        <Page>
          <p className="text-sm font-semibold text-amber-700">DELIVERY / REVIEW</p>
          <h2 className="mt-3 text-3xl font-bold">預算依據與交付核對</h2>
          <dl className="mt-8 space-y-4 text-base">
            <div><dt className="font-semibold">估算方式</dt><dd>{proposal.analysis.budget.basis === "area_material_model" ? "依坪數與材質模型估算" : "依使用者提供的預算區間規劃"}</dd></div>
            <div><dt className="font-semibold">假設條件</dt><dd>{proposal.analysis.budget.assumptions.area_ping} 坪；{proposal.analysis.budget.assumptions.material_label}；屋齡係數 {proposal.analysis.budget.assumptions.age_factor}</dd></div>
            <div><dt className="font-semibold">備用金規劃參考</dt><dd>NT$ {Number(proposal.analysis.budget.contingency).toLocaleString("zh-TW")}（區間中值 × {proposal.analysis.budget.assumptions.contingency_rate * 100}%，非分項報價或已核准追加預算）</dd></div>
          </dl>
          <h3 className="mt-8 text-xl font-bold">下一步待確認</h3>
          <ul className="mt-4 list-disc space-y-3 pl-6">{delivery.pending.map((item) => <li key={item}>{item}</li>)}</ul>
          <div className="mt-8 border-t pt-6 text-sm leading-7 text-stone-600">
            <p>專案：{proposal.caseCode} · {proposal.id}</p>
            <p>版本：{versionId || "目前資料預覽（未凍結版本）"}</p>
            <p>採用圖片組：{delivery.setId || "尚未建立"}</p>
            <p>生成時間：{delivery.generatedAt || "尚未生成"}</p>
            <p>內容核對：參考圖 {proposal.references.length}、平面圖 {proposal.floorPlans.length}、空間照片 {proposal.spaces.length}、採用圖 {delivery.adopted.length}。</p>
            <p>{proposal.disclaimer}</p>
          </div>
        </Page>
        {chunks(delivery.spaceCoverage, 6).map((rooms, index) => <Page key={`coverage-${index}`}>
          <p className="text-sm font-semibold text-amber-700">SPACE / SOURCE CHECK</p>
          <h2 className="mt-3 text-3xl font-bold">逐空間圖片交付核對</h2>
          <p className="mt-4 text-sm leading-6">每個空間最多上傳 4 張原照，每張原照應有對應參考圖；不足時仍需補足四方向素材。下表只核對本專案已保存的來源與成果，不會自動生圖或扣點，也不把圖片張數視為環景驗收。</p>
          <div className="mt-6 space-y-5">{rooms.map(room => <section key={room.room} className="rounded border p-4">
            <h3 className="font-semibold">{proposal.spaces.find(space => space.room === room.room)?.label || room.room}</h3>
            <p className="mt-2">原照 {room.original_count} 張；已有對應成果 {room.covered_original_count} 張原照；尚缺對應成果 {room.missing_original_count} 張。</p>
            <p className="mt-2">可核對生成參考圖 {room.generated_reference_count} 張；距離至少 4 張尚差 {room.additional_reference_count} 張。</p>
            {room.upload_limit_exceeded && <p className="mt-2 text-amber-800">歷史資料超過上傳上限，已完整保留；請人工確認，不自動刪圖。</p>}
            <p className="mt-2 text-sm text-amber-800">四方向／360° 品質未驗證：仍需核對方向、共同拍攝中心、門窗家具一致性、接縫與頂底覆蓋。</p>
          </section>)}</div>
        </Page>)}
      </div>
    </div>
  );
}
