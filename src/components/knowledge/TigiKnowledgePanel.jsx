import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, ExternalLink, FileSearch, Loader2, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { buildProjectKnowledgeQuery, loadTigiKnowledgeIndex, queryTigiKnowledge } from "@/lib/tigiKnowledge";

const sampleQueries = [
  "老屋翻新如何整理預算、材料與驗收要求？",
  "設計提案要如何形成可供 iSAFE 監管的交付文件？",
  "如何定義設計師媒合與供應商評選的治理規則？",
];

function ResultCard({ result }) {
  return (
    <div id={`source-${encodeURIComponent(result.documentId)}`} className="scroll-mt-24 rounded-md border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{result.categoryLabel}</Badge><Badge className={result.baselineStatus === "candidate-addendum" ? "bg-amber-100 text-amber-900 hover:bg-amber-100" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"}>{result.baselineStatus === "candidate-addendum" ? "R9.2.1 候選增補" : "R9.2 活動來源"}</Badge>
        <span className="text-xs font-mono text-stone-500">score {result.score.toFixed(1)}</span>
      </div>
      <h3 className="mt-2 font-semibold text-stone-950">{result.title}</h3>
      <p className="mt-1 text-sm text-stone-600">{result.heading}</p>
      <p className="mt-3 text-sm leading-6 text-stone-800">{result.recommendation}</p>
      <p className="mt-3 rounded-md bg-stone-50 p-3 text-xs leading-5 text-stone-600">{result.excerpt}</p>
      <a className="mt-2 inline-flex items-center gap-1 break-all font-mono text-xs text-stone-600 underline underline-offset-2" href={result.sourceHref} target="_blank" rel="noreferrer">
        {result.path}<ExternalLink className="h-3 w-3 shrink-0" />
      </a>
    </div>
  );
}

export default function TigiKnowledgePanel({ project = null, compact = false }) {
  const projectQuery = useMemo(() => buildProjectKnowledgeQuery(project), [project]);
  const [query, setQuery] = useState(projectQuery || sampleQueries[0]);
  const [indexMeta, setIndexMeta] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTigiKnowledgeIndex().then(setIndexMeta).catch((err) => setError(err.message));
  }, []);
  useEffect(() => { if (projectQuery) setQuery(projectQuery); }, [projectQuery]);

  const runQuery = async (nextQuery = query) => {
    setIsLoading(true);
    setError("");
    try {
      setResponse(await queryTigiKnowledge(nextQuery, { limit: compact ? 4 : 6 }));
    } catch (err) {
      setError(err.message || "Knowledge 索引查詢失敗");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-stone-200 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white"><BookOpen className="h-4 w-4" />TIGI Knowledge</div>
            <CardTitle className="text-xl">本地工程知識檢索</CardTitle>
            <p className="mt-2 text-sm leading-6 text-stone-600">依 canonical reading order 建立的 TIGI Markdown 索引，針對案件需求回傳工程與治理建議及本地文件來源。</p>
          </div>
          {indexMeta && <div className="text-right text-xs text-stone-500"><div className="mb-2 flex flex-wrap justify-end gap-2"><Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">R9.2 唯一活動母本</Badge><Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">R9.2.1 候選增補</Badge><Badge variant="outline">無網路依賴</Badge></div><div>{indexMeta.releaseId} · {indexMeta.documentCount} doc · {indexMeta.chunkCount} chunks</div><div className="mt-1">候選增補僅供判讀，不覆寫 R5.2／Patent V7；R8／R9／R9.1 已封存</div><a className="underline underline-offset-2" href={`${import.meta.env.BASE_URL || "./"}${indexMeta.manifestUrl}`} target="_blank" rel="noreferrer">索引清單</a></div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-28 bg-white" placeholder="輸入空間、預算、材料、交付或監管需求" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {sampleQueries.slice(0, compact ? 1 : 3).map((sample) => <Button key={sample} type="button" variant="outline" size="sm" onClick={() => { setQuery(sample); runQuery(sample); }}><Sparkles className="h-4 w-4" />範例</Button>)}
          </div>
          <Button type="button" onClick={() => runQuery()} disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}查詢 Knowledge</Button>
        </div>
        {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {response && <div className="space-y-4">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4"><div className="mb-2 flex items-center gap-2 font-semibold text-amber-950"><FileSearch className="h-4 w-4" />建議摘要</div><pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-stone-800">{response.answer}</pre></div>
          <div className="space-y-3">{response.results.map((result) => <ResultCard key={result.id} result={result} />)}</div>
        </div>}
      </CardContent>
    </Card>
  );
}
