import React from "react";
import { ScanSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VISUAL_EDITING_INTENTS, visualEditingIntent } from "@/lib/visualEditing";

export default function VisualEditingIntentControls({ intentId, onIntentChange, semanticRegion, onSemanticRegionChange, referenceAssetIds, onReferenceAssetIdsChange }) {
  const intent = visualEditingIntent(intentId);
  return (
    <section className="space-y-3 border-y border-stone-200 py-4" aria-labelledby="visual-editing-title">
      <div>
        <h3 id="visual-editing-title" className="flex items-center gap-2 text-sm font-semibold text-stone-900"><ScanSearch className="h-4 w-4" />視覺編輯工具</h3>
        <p className="mt-1 text-xs leading-5 text-stone-600">{intent.description}</p>
      </div>
      <label className="block text-sm font-medium">編輯方式
        <select className="mt-2 h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={intentId} onChange={(event) => onIntentChange(event.target.value)}>
          {VISUAL_EDITING_INTENTS.map((item) => <option key={item.id} value={item.id}>{item.id} {item.label}</option>)}
        </select>
      </label>
      {intent.regionRequired && <label className="block text-sm font-medium">修改區域
        <Input className="mt-2" value={semanticRegion} onChange={(event) => onSemanticRegionChange(event.target.value)} placeholder="例如：沙發、電視牆、地板" />
      </label>}
      {intent.referenceRequired && <label className="block text-sm font-medium">參考資產 ID
        <Input className="mt-2" value={referenceAssetIds} onChange={(event) => onReferenceAssetIdsChange(event.target.value)} placeholder="多筆以逗號分隔" />
      </label>}
    </section>
  );
}
