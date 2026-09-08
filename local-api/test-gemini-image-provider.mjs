import assert from "node:assert/strict";
import test from "node:test";
import { generateGeminiImage, generateGeminiImageBatch, selectGeminiImageModel } from "./gemini-image-provider.mjs";

const png = Buffer.from("test-png").toString("base64");
const response = () => ({ ok: true, status: 200, json: async () => ({ outputs: [{ type: "image", data: png }] }) });

test("standard and high quality route to the intended Gemini Image models", () => {
  assert.equal(selectGeminiImageModel("standard"), "gemini-3.1-flash-image");
  assert.equal(selectGeminiImageModel("high"), "gemini-3-pro-image");
});

test("request uses the single-image Interactions contract and records SynthID provenance", async () => {
  let request;
  const result = await generateGeminiImage({ apiKey: "test", prompt: "interior", width: 1024, height: 768 }, { fetch: async (url, init) => { request = { url, body: JSON.parse(init.body) }; return response(); } });
  assert.match(request.url, /\/interactions$/);
  assert.equal(request.body.model, "gemini-3.1-flash-image");
  assert.equal("numberOfImages" in request.body, false);
  assert.equal(result.synthid, true);
  assert.equal(result.bytes.toString(), "test-png");
});

test("four references are four independent provider calls", async () => {
  let calls = 0;
  const results = await generateGeminiImageBatch({ apiKey: "test", count: 4, prompt: (index) => `room ${index}` }, { fetch: async () => { calls += 1; return response(); } });
  assert.equal(calls, 4);
  assert.equal(results.length, 4);
});

test("missing API key fails without disabling ComfyUI", async () => {
  await assert.rejects(() => generateGeminiImage({ apiKey: "", prompt: "interior" }, { fetch: async () => response() }), { code: "GOOGLE_IMAGE_PROVIDER_NOT_CONFIGURED" });
});
