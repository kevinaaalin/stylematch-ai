#!/usr/bin/env python3
"""Forward test for the deterministic four-direction panorama projector."""

import json
import sys
import tempfile
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from four_direction_to_erp import compose


def main() -> None:
    colors = {
        "front": (220, 30, 30),
        "right": (30, 200, 60),
        "back": (30, 80, 220),
        "left": (220, 180, 30),
    }
    with tempfile.TemporaryDirectory(prefix="stylematch-panorama-test-") as directory:
        root = Path(directory)
        inputs = {}
        for direction, color in colors.items():
            path = root / f"{direction}.png"
            Image.new("RGB", (320, 240), color).save(path)
            inputs[direction] = path
        output = root / "panorama.png"
        mask = root / "mask.png"
        manifest_path = root / "manifest.json"
        manifest = compose(inputs, output, mask, manifest_path, 800, 400, 100.0, 8.0)
        with Image.open(output) as image:
            assert image.size == (800, 400)
            assert image.mode == "RGBA"
            pixels = image.load()
            samples = {
                "front": pixels[400, 200][:3],
                "right": pixels[600, 200][:3],
                "back": pixels[0, 200][:3],
                "left": pixels[200, 200][:3],
            }
            for direction, expected in colors.items():
                actual = samples[direction]
                assert max(abs(actual[index] - expected[index]) for index in range(3)) <= 2, (direction, actual, expected)
            assert pixels[400, 0][3] == 0
        assert manifest["workflow_version"] == "stylematch-panorama-4dir-v1"
        assert manifest["ordered_directions"] == ["front", "right", "back", "left"]
        assert 0 < manifest["mask"]["coverage_ratio"] < 1
        assert json.loads(manifest_path.read_text(encoding="utf-8"))["projection"] == "equirectangular_2_1"
    print("Four-direction panorama projection passed.")


if __name__ == "__main__":
    main()
