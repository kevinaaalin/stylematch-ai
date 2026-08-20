#!/usr/bin/env python3
"""Project four ordered perspective photos into one masked 2:1 panorama."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps


WORKFLOW_VERSION = "stylematch-panorama-4dir-v1"
YAW_BY_DIRECTION = {"front": 0.0, "right": 90.0, "back": 180.0, "left": 270.0}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_rgb(path: Path) -> np.ndarray:
    with Image.open(path) as image:
        return np.asarray(ImageOps.exif_transpose(image).convert("RGB"), dtype=np.float32)


def bilinear_sample(image: np.ndarray, u: np.ndarray, v: np.ndarray) -> np.ndarray:
    height, width = image.shape[:2]
    x0 = np.floor(u).astype(np.int32)
    y0 = np.floor(v).astype(np.int32)
    x1 = np.clip(x0 + 1, 0, width - 1)
    y1 = np.clip(y0 + 1, 0, height - 1)
    x0 = np.clip(x0, 0, width - 1)
    y0 = np.clip(y0, 0, height - 1)
    wx = (u - x0)[..., None]
    wy = (v - y0)[..., None]
    top = image[y0, x0] * (1.0 - wx) + image[y0, x1] * wx
    bottom = image[y1, x0] * (1.0 - wx) + image[y1, x1] * wx
    return top * (1.0 - wy) + bottom * wy


def fill_missing_vertical(rgb: np.ndarray, valid: np.ndarray) -> np.ndarray:
    filled = rgb.copy()
    height, width = valid.shape
    for x in range(width):
        rows = np.flatnonzero(valid[:, x])
        if rows.size == 0:
            continue
        top, bottom = int(rows[0]), int(rows[-1])
        filled[:top, x] = filled[top, x]
        filled[bottom + 1 :, x] = filled[bottom, x]
    return filled


def compose(inputs: dict[str, Path], output: Path, mask_output: Path, manifest_output: Path,
            width: int, height: int, hfov: float, seam_degrees: float) -> dict:
    if width != height * 2:
        raise ValueError("Equirectangular output must use an exact 2:1 width-to-height ratio.")
    images = {direction: load_rgb(path) for direction, path in inputs.items()}

    x = (np.arange(width, dtype=np.float32) + 0.5) / width
    y = (np.arange(height, dtype=np.float32) + 0.5) / height
    longitude, latitude = np.meshgrid((x - 0.5) * (2.0 * math.pi), (0.5 - y) * math.pi)
    cos_latitude = np.cos(latitude)
    world_x = cos_latitude * np.sin(longitude)
    world_y = np.sin(latitude)
    world_z = cos_latitude * np.cos(longitude)

    weighted_rgb = np.zeros((height, width, 3), dtype=np.float32)
    weight_sum = np.zeros((height, width), dtype=np.float32)
    hfov_tangent = math.tan(math.radians(hfov) / 2.0)

    for direction, yaw_degrees in YAW_BY_DIRECTION.items():
        image = images[direction]
        source_height, source_width = image.shape[:2]
        aspect = source_width / source_height
        vfov_tangent = hfov_tangent / aspect
        yaw = math.radians(yaw_degrees)
        camera_x = world_x * math.cos(yaw) - world_z * math.sin(yaw)
        camera_y = world_y
        camera_z = world_x * math.sin(yaw) + world_z * math.cos(yaw)
        safe_z = np.maximum(camera_z, 1e-6)
        normalized_u = camera_x / (safe_z * hfov_tangent)
        normalized_v = camera_y / (safe_z * vfov_tangent)
        visible = (camera_z > 0) & (np.abs(normalized_u) <= 1.0) & (np.abs(normalized_v) <= 1.0)
        source_u = (normalized_u + 1.0) * 0.5 * (source_width - 1)
        source_v = (1.0 - normalized_v) * 0.5 * (source_height - 1)
        sampled = bilinear_sample(image, source_u, source_v)
        feather = np.cos(np.clip(normalized_u, -1, 1) * math.pi / 2.0) ** 2
        feather *= np.cos(np.clip(normalized_v, -1, 1) * math.pi / 2.0) ** 2
        weight = np.where(visible, np.maximum(feather, 1e-4), 0.0).astype(np.float32)
        weighted_rgb += sampled * weight[..., None]
        weight_sum += weight

    valid = weight_sum > 0
    rgb = np.divide(weighted_rgb, np.maximum(weight_sum[..., None], 1e-6))
    rgb = fill_missing_vertical(rgb, valid)

    seam_mask = ~valid
    seam_radius = max(2, round(width * seam_degrees / 360.0 / 2.0))
    for yaw_degrees in (45.0, 135.0, 225.0, 315.0):
        center = int(((yaw_degrees + 180.0) % 360.0) / 360.0 * width)
        delta = np.minimum((np.arange(width) - center) % width, (center - np.arange(width)) % width)
        seam_mask |= delta[None, :] <= seam_radius

    rgba = np.dstack((np.clip(rgb, 0, 255).astype(np.uint8), np.where(seam_mask, 0, 255).astype(np.uint8)))
    output.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(output)
    Image.fromarray(np.where(seam_mask, 255, 0).astype(np.uint8), "L").save(mask_output)

    manifest = {
        "workflow_version": WORKFLOW_VERSION,
        "projection": "equirectangular_2_1",
        "ordered_directions": list(YAW_BY_DIRECTION),
        "camera": {"shared_center_required": True, "horizontal_fov_degrees": hfov},
        "output": {"path": str(output), "width": width, "height": height},
        "mask": {"path": str(mask_output), "coverage_ratio": round(float(seam_mask.mean()), 6)},
        "inputs": [{"direction": direction, "path": str(inputs[direction]), "sha256": sha256(inputs[direction])} for direction in YAW_BY_DIRECTION],
    }
    manifest_output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build a masked 2:1 ERP draft from front/right/back/left photos.")
    for direction in YAW_BY_DIRECTION:
        parser.add_argument(f"--{direction}", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--mask-output", type=Path)
    parser.add_argument("--manifest-output", type=Path)
    parser.add_argument("--width", type=int, default=1536)
    parser.add_argument("--height", type=int, default=768)
    parser.add_argument("--hfov", type=float, default=100.0)
    parser.add_argument("--seam-degrees", type=float, default=8.0)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output = args.output.resolve()
    mask_output = (args.mask_output or output.with_name(f"{output.stem}-mask.png")).resolve()
    manifest_output = (args.manifest_output or output.with_suffix(".json")).resolve()
    inputs = {direction: getattr(args, direction).resolve() for direction in YAW_BY_DIRECTION}
    missing = [str(path) for path in inputs.values() if not path.is_file()]
    if missing:
        raise FileNotFoundError(f"Missing input files: {', '.join(missing)}")
    manifest = compose(inputs, output, mask_output, manifest_output, args.width, args.height, args.hfov, args.seam_degrees)
    print(json.dumps(manifest, ensure_ascii=False))


if __name__ == "__main__":
    main()
