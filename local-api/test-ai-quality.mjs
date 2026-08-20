import assert from "node:assert/strict";
import test from "node:test";
import { inspectGeneratedImage } from "./ai-quality.mjs";

function pngHeader(width, height, size = 12_000) {
  const bytes = Buffer.alloc(size);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes);
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  return bytes;
}

test("perspective image passes deterministic technical QA", () => {
  const report = inspectGeneratedImage({ bytes: pngHeader(1024, 768), contentType: "image/png", expectedWidth: 1024, expectedHeight: 768 });
  assert.equal(report.technical_status, "passed");
  assert.equal(report.human_review.required, true);
  assert.equal(report.human_review.status, "pending");
});

test("panorama rejects a non-2:1 output", () => {
  const report = inspectGeneratedImage({ bytes: pngHeader(1024, 768), contentType: "image/png", expectedWidth: 1024, expectedHeight: 768, outputType: "equirectangular_2_1" });
  assert.equal(report.technical_status, "failed");
  assert.equal(report.checks.find(({ code }) => code === "PANORAMA_ASPECT_2_1").passed, false);
});
