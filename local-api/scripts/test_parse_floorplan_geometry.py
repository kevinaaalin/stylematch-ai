#!/usr/bin/env python3
"""Focused regression test for local floorplan geometry candidates."""

import json
import importlib.util
import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

MODULE_PATH = Path(__file__).with_name("parse_floorplan_geometry.py")
SPEC = importlib.util.spec_from_file_location("parse_floorplan_geometry", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
parse = MODULE.parse


class FloorplanGeometryTest(unittest.TestCase):
    def test_detects_room_dimensions_and_unclassified_opening(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "floorplan.png"
            image = Image.new("RGB", (600, 420), "white")
            draw = ImageDraw.Draw(image)
            draw.line((70, 60, 530, 60), fill="black", width=6)
            draw.line((70, 360, 530, 360), fill="black", width=6)
            draw.line((70, 60, 70, 360), fill="black", width=6)
            draw.line((530, 60, 530, 205), fill="black", width=6)
            draw.line((530, 255, 530, 360), fill="black", width=6)
            image.save(source)

            result = parse(source, 10, "客餐廳")

            self.assertEqual(result["parser"]["adapter_version"], "SS01-local-vision-0.3")
            self.assertGreaterEqual(len(result["rooms"]), 1)
            self.assertGreaterEqual(len(result["openings"]), 1)
            self.assertEqual(result["openings"][0]["semantic_type"], "unclassified")
            self.assertTrue(result["openings"][0]["requires_confirmation"])
            self.assertGreaterEqual(len(result["dimensions"]), 2)
            self.assertTrue(all(item["requires_confirmation"] for item in result["dimensions"]))


if __name__ == "__main__":
    unittest.main()
