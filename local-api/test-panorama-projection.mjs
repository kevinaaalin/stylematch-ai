import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const python = process.env.COMFYUI_PYTHON || "C:\\Users\\Kevin\\Desktop\\ComfyUI_windows_portable\\python_embeded\\python.exe";
const result = spawnSync(python, [join(root, "scripts", "test_four_direction_to_erp.py")], { cwd: root, encoding: "utf8", windowsHide: true });
assert.equal(result.status, 0, result.stderr || result.error?.message);
const workflow = JSON.parse(readFileSync(join(root, "workflows", "stylematch-panorama-4dir-v1.api.json"), "utf8"));
assert.equal(workflow["10"].class_type, "LoadImage");
assert.equal(workflow["12"].class_type, "VAEEncodeForInpaint");
assert.equal(workflow["3"].inputs.latent_image[0], "12");
assert.equal(workflow["9"].class_type, "SaveImage");
console.log(result.stdout.trim());
console.log("Dedicated ComfyUI panorama workflow contract passed.");
