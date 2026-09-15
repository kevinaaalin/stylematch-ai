# Website support agent - local v1

Reviewed Engineering R10-C2 master: lines 828/3561 recommend deterministic rules for fixed workflows; line 850 requires identity/scope permission even for READ; lines 816/3280 retain iSAFE governance authority. These are general constraints, not a completed customer-service specification.

The public support assistant uses deterministic intent routing, session topic memory, page context and allowlisted navigation actions. It is not an LLM or human operator. It does not read private cases, call privileged APIs, change membership/payment/Gate state, or send history externally. Conversation remains in React memory.

11 operation topics reflect current StyleTest, PricingPlans, MyProjects, AIGenerate, FloorPlanVisualizer, localStore and IsafeIntakeRedirect behavior. Pricing links to the actual page rather than duplicating amounts. Content version: 2026-09-15-local-v1. The old engineering RAG is not the support answer source.

Unknown questions request page/action/error details. Human-support requests explicitly state no live operator or ticket connection. No delivery/payment/private status is inferred. Keyword matching cannot understand arbitrary questions reliably. Identity-backed lookups, live tickets and generative language require separate integrations and acceptance.
