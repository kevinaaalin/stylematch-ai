"""Restore unmasked source pixels, then sample four views from one ERP scene."""
import argparse
import base64
import hashlib
import json
import math
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np
from PIL import Image
from four_direction_to_erp import YAW_BY_DIRECTION, bilinear_sample


def finish(directory: Path):
    manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
    draft = np.asarray(Image.open(directory / "erp-draft.png").convert("RGBA"))
    generated = np.asarray(Image.open(directory / "generated.png").convert("RGB"))
    if generated.shape != draft[:, :, :3].shape or generated.shape[1] != generated.shape[0] * 2:
        raise ValueError("Generated room must match the 2:1 projection dimensions")
    known = draft[:, :, 3] == 255
    generated = generated.copy()
    generated[known] = draft[:, :, :3][known]
    Image.fromarray(generated).save(directory / "completed-room.png")
    h, w = generated.shape[:2]
    # Periodic longitude sampling avoids a discontinuity at the sampling edge.
    periodic = np.concatenate([generated[:, -1:], generated, generated[:, :1]], axis=1)
    size_x, size_y = 768, 576
    fov = manifest["camera"]["horizontal_fov_degrees"]
    tangent = math.tan(math.radians(fov) / 2)
    x, y = np.meshgrid(((np.arange(size_x) + .5) / size_x * 2 - 1) * tangent,
                       (1 - (np.arange(size_y) + .5) / size_y * 2) * tangent * size_y / size_x)
    z = np.ones_like(x)
    views = []
    for direction, degrees in YAW_BY_DIRECTION.items():
        yaw = math.radians(degrees)
        world_x, world_z = x * math.cos(yaw) + z * math.sin(yaw), -x * math.sin(yaw) + z * math.cos(yaw)
        longitude = np.arctan2(world_x, world_z)
        latitude = np.arctan2(y, np.sqrt(world_x ** 2 + world_z ** 2))
        u = ((longitude / (2 * math.pi) + .5) * w - .5) % w + 1
        v = np.clip((.5 - latitude / math.pi) * h - .5, 0, h - 1)
        pixels = bilinear_sample(periodic, u, v).clip(0, 255).astype(np.uint8)
        path = directory / f"reference-{direction}.png"
        Image.fromarray(pixels).save(path)
        content = path.read_bytes()
        views.append({"id": direction, "yaw": degrees, "horizontal_fov_degrees": fov,
                      "provenance": "ai_inferred" if direction in manifest["inferred_directions"] else "source_projected_with_ai_gap_repair",
                      "sha256": hashlib.sha256(content).hexdigest(), "media_url": "data:image/png;base64," + base64.b64encode(content).decode("ascii")})
    if len({view["sha256"] for view in views}) != 4:
        raise ValueError("Four direction outputs must be distinct")
    return {"schema_version": "StyleMatch.DirectionCompletion/1.0", "ordered_sources": views,
            "source_inputs": [{"direction": entry["direction"], "sha256": entry["sha256"]} for entry in manifest["inputs"]],
            "source_hashes": [entry["sha256"] for entry in manifest["inputs"]],
            "inferred_directions": manifest["inferred_directions"], "shared_scene": True,
            "concept_only": manifest.get("concept_only", False),
            "known_pixel_count": int(known.sum()),
            "known_pixels_preserved": bool(np.array_equal(generated[known], draft[:, :, :3][known])),
            "wrap_edge_mean_delta": round(float(np.abs(generated[:, 0].astype(float) - generated[:, -1].astype(float)).mean()), 3),
            "semantic_consistency_verified": False, "human_review_required": True}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path)
    args = parser.parse_args()
    result = finish(args.directory)
    (args.directory / "direction-references.json").write_text(json.dumps(result), encoding="utf-8")
    print(json.dumps({"views": len(result["ordered_sources"]), "known_pixels_preserved": result["known_pixels_preserved"]}))
