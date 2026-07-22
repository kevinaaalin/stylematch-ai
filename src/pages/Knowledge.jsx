import React from "react";
import TigiKnowledgePanel from "@/components/knowledge/TigiKnowledgePanel";

export default function Knowledge() {
  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <TigiKnowledgePanel />
      </div>
    </div>
  );
}
