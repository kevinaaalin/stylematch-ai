export const PLAN_STORAGE_KEY = "stylematch_active_plan_v1";
export const PLAN_CHANGE_EVENT = "stylematch:plan-changed";

export const PLANS = [
  { id: "free", name: "免費體驗", price: "免費", audience: "屋主", isBusiness: false },
  { id: "single", name: "單次提案", price: "NT$ 2,999", audience: "屋主", isBusiness: false },
  { id: "pro", name: "商業方案 Pro", price: "NT$ 499 / 月", audience: "個人設計師與工作室", isBusiness: true },
  { id: "business", name: "商業方案 Team", price: "NT$ 1,999 / 月", audience: "設計公司與團隊", isBusiness: true },
];

export function readActivePlan() {
  if (typeof window === "undefined") return "free";
  try {
    return window.localStorage.getItem(PLAN_STORAGE_KEY) || "free";
  } catch {
    return "free";
  }
}

export function setActivePlan(planId) {
  const resolved = PLANS.some((plan) => plan.id === planId) ? planId : "free";
  try {
    window.localStorage.setItem(PLAN_STORAGE_KEY, resolved);
  } catch {
    // The current page can still react even when persistent storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(PLAN_CHANGE_EVENT, { detail: { planId: resolved } }));
  return resolved;
}

export function isBusinessPlan(planId = readActivePlan()) {
  return PLANS.some((plan) => plan.id === planId && plan.isBusiness);
}

export function requireBusinessPlan(featureName = "扣點功能") {
  if (!isBusinessPlan()) {
    throw new Error(`${featureName}僅提供商業方案使用，請先升級至商業方案 Pro 或 Team。`);
  }
}

