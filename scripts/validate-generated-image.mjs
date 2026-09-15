import assert from "node:assert/strict";
import { validateGeneratedImage } from "../src/lib/validateGeneratedImage.js";
globalThis.Image = class {
  naturalWidth = 512;
  naturalHeight = 512;
  set src(value) { queueMicrotask(() => value === "/good.png" ? this.onload() : this.onerror()); }
};
await validateGeneratedImage("/good.png");
await assert.rejects(validateGeneratedImage("/broken.png"));
await assert.rejects(validateGeneratedImage("javascript:alert(1)"));
delete globalThis.Image;
console.log("Generated image load success, broken image and unsafe URL checks passed.");
