import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateDirectionCompletion } from "./direction-completion.mjs";
const capture = { input_mode: "partial_direction_completion", shared_center_confirmed: true, horizontal_fov_degrees: 100,
  ordered_sources: [{ id: "front", yaw: 0, media_url: "data:image/png;base64,example" }] };
assert.equal(validateDirectionCompletion(capture).length, 1);
for (const invalid of [{ ...capture, shared_center_confirmed: false }, { ...capture, ordered_sources: [] }, { ...capture, horizontal_fov_degrees: 90 }, { ...capture, ordered_sources: [...capture.ordered_sources, ...capture.ordered_sources] }]) assert.throws(() => validateDirectionCompletion(invalid));
const python = process.env.COMFYUI_PYTHON || "C:\\Users\\Kevin\\Desktop\\ComfyUI_windows_portable\\python_embeded\\python.exe";
const result = spawnSync(python, [fileURLToPath(new URL("./scripts/test_direction_completion.py", import.meta.url))], { encoding: "utf8", windowsHide: true });
assert.equal(result.status, 0, result.stderr || result.error?.message);
console.log(result.stdout.trim());
