import json
import tempfile
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np
from PIL import Image
from four_direction_to_erp import compose, YAW_BY_DIRECTION
from complete_direction_views import finish

with tempfile.TemporaryDirectory(prefix="direction-completion-qa-") as temporary:
    root = Path(temporary)
    sources = {}
    for i, direction in enumerate(YAW_BY_DIRECTION):
        path = root / f"{direction}.png"
        Image.new("RGB", (160, 120), (40 + i * 50, 90, 140)).save(path)
        sources[direction] = path
    for count in [1, 2, 3, 4]:
        inputs = dict(list(sources.items())[:count])
        manifest = compose(inputs, root / "erp-draft.png", root / "mask.png", root / "manifest.json", 512, 256, 100, 8, allow_partial=True)
        assert len(manifest["inferred_directions"]) == 4 - count
        pixels = np.zeros((256, 512, 3), dtype=np.uint8)
        pixels[:, :, 0] = np.arange(512)[None, :] % 255
        pixels[:, :, 1] = np.arange(256)[:, None]
        Image.fromarray(pixels).save(root / "generated.png")
        result = finish(root)
        assert result["known_pixels_preserved"]
        assert result["semantic_consistency_verified"] is False
        assert [view["id"] for view in result["ordered_sources"]] == list(YAW_BY_DIRECTION)
        assert len({view["sha256"] for view in result["ordered_sources"]}) == 4
        for direction in sources:
            assert Image.open(root / f"reference-{direction}.png").size == (768, 576)
    for inputs, partial in [({}, True), ({"front": sources["front"]}, False), ({"front": sources["front"], "back": sources["front"]}, True)]:
        try:
            compose(inputs, root / "bad.png", root / "bad-mask.png", root / "bad.json", 512, 256, 100, 8, partial)
        except ValueError:
            pass
        else:
            raise AssertionError("Invalid input accepted")
print("PASS: 1-4 inputs, four ordered distinct views, restored original pixels, provenance; empty/duplicate/legacy-incomplete rejected. Generated pixels are fixtures, not AI quality acceptance.")
