#!/usr/bin/env python3
"""Deterministically detect long wall lines and rectangular room boundaries."""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import shutil
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageFile, ImageOps
from scipy import ndimage


PARSER_VERSION = "SS01-local-vision-0.4"
ImageFile.LOAD_TRUNCATED_IMAGES = True


def file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    digest.update(path.read_bytes())
    return digest.hexdigest()


def runs(values: np.ndarray, minimum: int) -> list[tuple[int, int]]:
    padded = np.pad(values.astype(np.int8), (1, 1))
    changes = np.diff(padded)
    starts = np.flatnonzero(changes == 1)
    ends = np.flatnonzero(changes == -1)
    return [(int(start), int(end)) for start, end in zip(starts, ends) if end - start >= minimum]


def cluster_coordinates(values: list[int], tolerance: int = 4) -> list[int]:
    if not values:
        return []
    groups = [[values[0]]]
    for value in sorted(values)[1:]:
        if value - groups[-1][-1] <= tolerance:
            groups[-1].append(value)
        else:
            groups.append([value])
    return [round(sum(group) / len(group)) for group in groups]


def merge_segments(segments: list[dict], orientation: str) -> list[dict]:
    coordinate = "y1" if orientation == "horizontal" else "x1"
    start_key = "x1" if orientation == "horizontal" else "y1"
    end_key = "x2" if orientation == "horizontal" else "y2"
    merged = []
    for axis in cluster_coordinates([item[coordinate] for item in segments]):
        nearby = [item for item in segments if abs(item[coordinate] - axis) <= 4]
        intervals = sorted((item[start_key], item[end_key]) for item in nearby)
        compact = []
        for start, end in intervals:
            if compact and start <= compact[-1][1] + 8:
                compact[-1] = (compact[-1][0], max(compact[-1][1], end))
            else:
                compact.append((start, end))
        for start, end in compact:
            if orientation == "horizontal":
                merged.append({"orientation": orientation, "x1": start, "y1": axis, "x2": end, "y2": axis})
            else:
                merged.append({"orientation": orientation, "x1": axis, "y1": start, "x2": axis, "y2": end})
    return merged


def detect_opening_gaps(walls: list[dict], width: int, height: int) -> list[dict]:
    """Return conservative opening candidates from short gaps between collinear walls."""
    candidates = []
    minimum_gap = max(6, round(min(width, height) * 0.012))
    maximum_gap = max(minimum_gap + 1, round(min(width, height) * 0.18))
    for orientation in ("horizontal", "vertical"):
        coordinate = "y1" if orientation == "horizontal" else "x1"
        start_key = "x1" if orientation == "horizontal" else "y1"
        end_key = "x2" if orientation == "horizontal" else "y2"
        oriented = [wall for wall in walls if wall["orientation"] == orientation]
        for axis in cluster_coordinates([wall[coordinate] for wall in oriented]):
            nearby = sorted(
                [wall for wall in oriented if abs(wall[coordinate] - axis) <= 4],
                key=lambda item: item[start_key],
            )
            for left, right in zip(nearby, nearby[1:]):
                gap_start, gap_end = left[end_key], right[start_key]
                gap = gap_end - gap_start
                if minimum_gap <= gap <= maximum_gap:
                    if orientation == "horizontal":
                        bbox = [gap_start, axis - 4, gap_end, axis + 4]
                        start, end = [gap_start, axis], [gap_end, axis]
                    else:
                        bbox = [axis - 4, gap_start, axis + 4, gap_end]
                        start, end = [axis, gap_start], [axis, gap_end]
                    candidates.append({
                        "orientation": orientation,
                        "start_px": start,
                        "end_px": end,
                        "source_bbox_px": bbox,
                        "gap_px": gap,
                    })
    deduplicated = []
    seen = set()
    for item in candidates:
        key = (item["orientation"], *item["start_px"], *item["end_px"])
        if key not in seen:
            seen.add(key)
            deduplicated.append(item)
    return deduplicated[:80]


def boundary_coverage(binary: np.ndarray, orientation: str, axis: int, start: int, end: int, tolerance: int = 3) -> float:
    height, width = binary.shape
    if orientation == "horizontal":
        sample = binary[max(0, axis - tolerance):min(height, axis + tolerance + 1), max(0, start):min(width, end)]
        return float(np.max(sample, axis=0).mean()) if sample.size else 0.0
    sample = binary[max(0, start):min(height, end), max(0, axis - tolerance):min(width, axis + tolerance + 1)]
    return float(np.max(sample, axis=1).mean()) if sample.size else 0.0


def wall_thickness_px(binary: np.ndarray, wall: dict) -> int:
    """Estimate the dark stroke width at the middle of a detected wall."""
    height, width = binary.shape
    if wall["orientation"] == "horizontal":
        x = max(0, min(width - 1, round((wall["x1"] + wall["x2"]) / 2)))
        values, center = binary[:, x], wall["y1"]
    else:
        y = max(0, min(height - 1, round((wall["y1"] + wall["y2"]) / 2)))
        values, center = binary[y, :], wall["x1"]
    if not (0 <= center < len(values)) or not values[center]:
        return 1
    start = center
    while start > 0 and values[start - 1]: start -= 1
    end = center
    while end + 1 < len(values) and values[end + 1]: end += 1
    return max(1, end - start + 1)


def run_local_ocr(image_path: Path) -> tuple[list[dict], str, str | None]:
    try:
        from rapidocr_onnxruntime import RapidOCR
        engine = RapidOCR()
        result, _elapsed = engine(str(image_path))
        records = []
        for box, text, confidence in result or []:
            xs = [round(point[0]) for point in box]
            ys = [round(point[1]) for point in box]
            records.append({"text": str(text), "confidence": round(float(confidence), 3), "bbox_px": [min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys)]})
        return records, "rapidocr_onnxruntime", None
    except Exception as error:
        rapid_error = str(error)
    executable = shutil.which("tesseract")
    if not executable:
        return [], "unavailable", rapid_error
    result = subprocess.run([executable, str(image_path), "stdout", "-l", "eng+chi_tra", "tsv"], capture_output=True, text=True, timeout=90, check=False)
    if result.returncode != 0:
        return [], "tesseract_local", result.stderr.strip() or "Tesseract failed."
    records = []
    for row in csv.DictReader(io.StringIO(result.stdout), delimiter="\t"):
        text = (row.get("text") or "").strip()
        confidence = float(row.get("conf") or -1)
        if text and confidence >= 35:
            records.append({"text": text, "confidence": round(confidence / 100, 3), "bbox_px": [int(row["left"]), int(row["top"]), int(row["width"]), int(row["height"])]})
    return records, "tesseract_local", None


def parse(path: Path, mm_per_pixel: float, primary_room_name: str) -> dict:
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("L")
    original_width, original_height = image.size
    scale = min(1.0, 1800 / max(image.size))
    if scale < 1.0:
        image = image.resize((round(original_width * scale), round(original_height * scale)), Image.Resampling.LANCZOS)
    pixels = np.asarray(image, dtype=np.uint8)
    threshold = min(170, int(np.percentile(pixels, 22)) + 45)
    binary = pixels < threshold
    binary = ndimage.binary_closing(binary, structure=np.ones((2, 2), dtype=bool))
    height, width = binary.shape
    minimum_horizontal = max(24, round(width * 0.08))
    minimum_vertical = max(24, round(height * 0.08))
    horizontal = []
    for y in range(height):
        for start, end in runs(binary[y], minimum_horizontal):
            horizontal.append({"orientation": "horizontal", "x1": start, "y1": y, "x2": end, "y2": y})
    vertical = []
    for x in range(width):
        for start, end in runs(binary[:, x], minimum_vertical):
            vertical.append({"orientation": "vertical", "x1": x, "y1": start, "x2": x, "y2": end})
    walls_px = merge_segments(horizontal, "horizontal") + merge_segments(vertical, "vertical")
    walls_px = [wall for wall in walls_px if abs(wall["x2"] - wall["x1"]) + abs(wall["y2"] - wall["y1"]) >= min(width, height) * 0.1]
    openings_px = detect_opening_gaps(walls_px, width, height)

    xs = cluster_coordinates([wall["x1"] for wall in walls_px if wall["orientation"] == "vertical"], 6)
    ys = cluster_coordinates([wall["y1"] for wall in walls_px if wall["orientation"] == "horizontal"], 6)
    candidates = []
    minimum_room_area = width * height * 0.025
    for left, right in zip(xs, xs[1:]):
        for top, bottom in zip(ys, ys[1:]):
            if (right - left) * (bottom - top) < minimum_room_area:
                continue
            coverage = [
                boundary_coverage(binary, "vertical", left, top, bottom),
                boundary_coverage(binary, "vertical", right, top, bottom),
                boundary_coverage(binary, "horizontal", top, left, right),
                boundary_coverage(binary, "horizontal", bottom, left, right),
            ]
            if min(coverage) >= 0.45:
                candidates.append((left, top, right, bottom, sum(coverage) / 4))

    if not candidates and walls_px:
        x_values = [value for wall in walls_px for value in (wall["x1"], wall["x2"])]
        y_values = [value for wall in walls_px for value in (wall["y1"], wall["y2"])]
        candidates = [(min(x_values), min(y_values), max(x_values), max(y_values), 0.42)]
    candidates = sorted(candidates, key=lambda item: (item[2] - item[0]) * (item[3] - item[1]), reverse=True)[:12]

    coordinate_scale = mm_per_pixel / scale
    def point(x: float, y: float) -> list[int]:
        return [round(x * coordinate_scale), round(y * coordinate_scale)]

    walls = [{
        "id": f"wall-{index + 1}", "type": "detected_wall_line", "orientation": wall["orientation"],
        "start": point(wall["x1"], wall["y1"]), "end": point(wall["x2"], wall["y2"]),
        "thickness_mm": round(wall_thickness_px(binary, wall) * coordinate_scale), "thickness_source": "local_stroke_estimate",
        "confidence": 0.58, "source": "local_vision",
        "source_bbox_px": [wall["x1"], wall["y1"], wall["x2"], wall["y2"]],
    } for index, wall in enumerate(walls_px[:160])]
    rooms = []
    dimensions = []
    for index, (left, top, right, bottom, confidence) in enumerate(candidates):
        rooms.append({
            "id": f"room-{index + 1}", "name": primary_room_name if index == 0 else f"待確認空間 {index + 1}",
            "polygon": [point(left, top), point(right, top), point(right, bottom), point(left, bottom)],
            "area_sqm": round(((right - left) * coordinate_scale * (bottom - top) * coordinate_scale) / 1_000_000, 2),
            "confidence": round(min(0.72, confidence), 3), "source": "local_vision",
            "source_bbox_px": [left, top, right, bottom],
        })
        room_id = f"room-{index + 1}"
        dimensions.extend([
            {
                "id": f"dimension-{index + 1}-width", "room_id": room_id, "kind": "inferred_width",
                "axis": "horizontal", "measured_value": round((right - left) * coordinate_scale), "units": "mm",
                "start": point(left, bottom), "end": point(right, bottom), "confidence": 0.52,
                "source": "local_vision", "requires_confirmation": True,
            },
            {
                "id": f"dimension-{index + 1}-depth", "room_id": room_id, "kind": "inferred_depth",
                "axis": "vertical", "measured_value": round((bottom - top) * coordinate_scale), "units": "mm",
                "start": point(right, top), "end": point(right, bottom), "confidence": 0.52,
                "source": "local_vision", "requires_confirmation": True,
            },
        ])
    openings = [{
        "id": f"opening-{index + 1}", "kind": "opening_candidate", "semantic_type": "door_candidate" if 700 <= item["gap_px"] * coordinate_scale <= 1200 else "window_or_opening_candidate",
        "orientation": item["orientation"], "start": point(*item["start_px"]), "end": point(*item["end_px"]),
        "width_mm": round(item["gap_px"] * coordinate_scale), "confidence": 0.46,
        "source": "local_vision", "requires_confirmation": True, "source_bbox_px": item["source_bbox_px"],
    } for index, item in enumerate(openings_px)]
    labels, component_count = ndimage.label(binary)
    components = ndimage.find_objects(labels)
    fixtures = []
    for label_index, slices in enumerate(components, start=1):
        if not slices: continue
        y_slice, x_slice = slices
        component_area = int(np.count_nonzero(labels[slices] == label_index))
        box_area = (x_slice.stop - x_slice.start) * (y_slice.stop - y_slice.start)
        if width * height * 0.0003 <= component_area <= width * height * 0.012 and box_area > 0:
            fixtures.append({"id": f"fixture-{len(fixtures) + 1}", "semantic_type": "fixed_equipment_candidate", "bounds": {"x": round(x_slice.start * coordinate_scale), "y": round(y_slice.start * coordinate_scale), "width": round((x_slice.stop - x_slice.start) * coordinate_scale), "depth": round((y_slice.stop - y_slice.start) * coordinate_scale)}, "confidence": 0.34, "source": "local_connected_component", "requires_confirmation": True})
        if len(fixtures) >= 40: break
    ocr_records, ocr_adapter, ocr_error = run_local_ocr(path)
    overall_confidence = min(0.72, 0.38 + min(len(walls), 20) * 0.01 + min(len(rooms), 3) * 0.04)
    warnings = []
    if not walls:
        warnings.append("No reliable long wall lines were detected.")
    if not rooms:
        warnings.append("No closed room boundary was detected; create or correct rooms manually.")
    if not openings:
        warnings.append("No reliable wall gap was found for an opening candidate.")
    warnings.append("Door/window and fixed-equipment semantics are conservative candidates until human confirmation.")
    if not ocr_records: warnings.append(ocr_error or "No local OCR engine was detected; text labels and printed dimensions require manual confirmation.")
    return {
        "parser": {
            "adapter": "local_floorplan_geometry_vision", "adapter_version": PARSER_VERSION, "mode": "local_vision",
            "confidence_cap": 0.72, "threshold": threshold, "mm_per_pixel": mm_per_pixel,
            "source_width_px": original_width, "source_height_px": original_height,
            "source_ref_sha256": file_hash(path), "ocr_adapter": ocr_adapter, "ocr_records": ocr_records, "warnings": warnings,
        },
        "confidence": round(overall_confidence, 3),
        "source_assets": [{
            "asset_id": "floorplan-source-1", "media_type": "image", "sha256": file_hash(path),
            "width_px": original_width, "height_px": original_height, "coordinate_scale_mm_per_pixel": mm_per_pixel,
        }],
        "rooms": rooms, "walls": walls, "openings": openings, "dimensions": dimensions, "fixtures": fixtures, "furniture": [], "zones": [],
        "circulation_graph": {"nodes": [room["id"] for room in rooms], "edges": []},
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--mm-per-pixel", type=float, default=10.0)
    parser.add_argument("--primary-room-name", default="待確認空間")
    args = parser.parse_args()
    result = parse(args.input.resolve(), max(0.1, args.mm_per_pixel), args.primary_room_name)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"status": "ok", "rooms": len(result["rooms"]), "walls": len(result["walls"]), "confidence": result["confidence"]}))


if __name__ == "__main__":
    main()
