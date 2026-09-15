import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Loader2, Trash2, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { answerSupport } from "@/lib/supportAgent";

export default function KnowledgeChat() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const topic = useRef(null);
  const input = useRef(null);
  const launcher = useRef(null);
  const end = useRef(null);
  const pending = useRef(false);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { if (open) end.current?.scrollIntoView({ block: "nearest" }); }, [messages, busy, open]);
  function close() { setOpen(false); launcher.current?.focus(); }
  async function submit(event) {
    event.preventDefault();
    const text = query.trim();
    if (!text || pending.current) return;
    pending.current = true;
    setBusy(true); setQuery("");
    setMessages((items) => [...items.slice(-38), { role: "user", text }]);
    try {
      const response = answerSupport(text, { pathname: location.pathname, previousTopic: topic.current });
      topic.current = response.topic;
      setMessages((items) => [...items, { role: "assistant", ...response }]);
    } catch {
      setMessages((items) => [...items, { role: "assistant", text: "目前無法處理問題，請稍後重試。" }]);
    } finally { pending.current = false; setBusy(false); }
  }
  return <div className="fixed bottom-4 right-4 z-[60]" style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}>
    {open && <section role="dialog" aria-modal="false" aria-labelledby="knowledge-chat-title" onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }} className="mb-3 flex h-[min(600px,calc(100dvh-104px))] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl">
      <header className="flex shrink-0 items-center justify-between border-b p-4">
        <h2 id="knowledge-chat-title" className="font-semibold">StyleMatch 網站客服</h2>
        <div className="flex gap-1"><button title="清除對話" aria-label="清除對話" disabled={busy} onClick={() => { setMessages([]); topic.current = null; }} className="p-2 disabled:opacity-40"><Trash2 size={18} /></button><button title="關閉對話" aria-label="關閉對話" onClick={close} className="p-2"><X size={20} /></button></div>
      </header>
      <p className="shrink-0 border-b bg-stone-50 px-4 py-2 text-xs text-stone-600">自動客服 · 請勿提供密碼或付款資料。對話不送往外部服務。</p>
      <div role="log" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 text-sm">
        {!messages.length && <div className="space-y-3 text-stone-600"><p>您好！想了解如何測風格、取得提案，或遇到操作問題？</p><div className="flex flex-wrap gap-2">{["如何開始風格測驗？", "方案有什麼差別？", "生圖失敗怎麼辦？", "這一頁怎麼使用？"].map(text => <button key={text} className="text-left text-sm text-teal-800 underline underline-offset-4" onClick={() => { setQuery(text); input.current?.focus(); }}>{text}</button>)}</div></div>}
        {messages.map((message, i) => <div key={i} className={`break-words rounded-md p-3 ${message.role === "user" ? "ml-6 bg-teal-50 text-teal-950" : "bg-stone-50 text-stone-800"}`}>
          <p className="mb-1 text-xs font-semibold">{message.role === "user" ? "您" : "網站客服"}</p><p className="whitespace-pre-wrap leading-6">{message.text}</p>
          {message.actions?.map(action => <Link key={action.to} to={action.to} onClick={close} className="mt-3 flex items-center gap-1 text-teal-800 underline"><ArrowRight size={16} />{action.title}</Link>)}
          {message.source && <p className="mt-2 text-xs text-stone-500">依據：{message.source}</p>}
        </div>)}
        {busy && <p role="status" className="flex items-center gap-2 text-stone-500"><Loader2 size={16} className="animate-spin" />正在處理…</p>}<div ref={end} />
      </div>
      <form onSubmit={submit} className="flex shrink-0 items-end gap-2 border-t p-3">
        <textarea ref={input} aria-label="客服問題" placeholder="請描述您需要的協助" rows={2} maxLength={1000} value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 resize-none rounded-md border p-2 text-sm" />
        <button type="submit" title="送出問題" aria-label="送出問題" disabled={busy || !query.trim()} className="rounded-md bg-teal-800 p-3 text-white disabled:opacity-40"><Send size={18} /></button>
      </form>
    </section>}
    <button ref={launcher} title={open ? "關閉網站客服" : "開啟網站客服"} aria-label={open ? "關閉網站客服" : "開啟網站客服"} aria-expanded={open} onClick={() => open ? close() : setOpen(true)} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-800 text-white shadow-lg hover:bg-teal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"><MessageCircle size={26} /></button>
  </div>;
}
