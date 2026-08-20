import argparse
import json
from pathlib import Path

import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

ROOT = Path(__file__).resolve().parent.parent
CONTRACT_PATH = ROOT / "contracts" / "style-vision-embedding.v1.json"
CACHE_PATH = Path(__file__).resolve().parent / "data" / "style-text-embeddings.v1.json"


def load_contract():
    return json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))


def load_model(contract):
    model_path = contract["model"]["local_path"]
    model = CLIPModel.from_pretrained(model_path, local_files_only=True)
    processor = CLIPProcessor.from_pretrained(model_path, local_files_only=True, use_fast=False)
    model.eval()
    return model, processor


def style_prompts(contract):
    template = contract["prompt_template"]
    return [template.format(description=item["description"]) for item in contract["styles"]]


def build_cache():
    contract = load_contract()
    model, processor = load_model(contract)
    prompts = style_prompts(contract)
    inputs = processor(text=prompts, return_tensors="pt", padding=True, truncation=True)
    with torch.inference_mode():
        text_output = model.text_model(**inputs)
        vectors = model.text_projection(text_output.pooler_output)
        vectors = torch.nn.functional.normalize(vectors, dim=-1)
    document = {
        "contract_version": contract["contract_version"],
        "model_id": contract["model"]["model_id"],
        "revision": contract["model"]["revision"],
        "dimensions": vectors.shape[-1],
        "normalization": "l2",
        "styles": [
            {"id": item["id"], "name": item["name"], "prompt": prompt, "embedding": vector.tolist()}
            for item, prompt, vector in zip(contract["styles"], prompts, vectors)
        ],
    }
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(document, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({"status": "built", "path": str(CACHE_PATH), "styles": len(document["styles"]), "dimensions": document["dimensions"]}, ensure_ascii=False))


def analyze(image_path):
    contract = load_contract()
    model, processor = load_model(contract)
    cache = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    text_vectors = torch.tensor([item["embedding"] for item in cache["styles"]])
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.inference_mode():
        vision_output = model.vision_model(**inputs)
        image_vector = torch.nn.functional.normalize(model.visual_projection(vision_output.pooler_output), dim=-1)
        similarities = image_vector @ text_vectors.T
        probabilities = torch.softmax(similarities / contract["similarity"]["temperature"], dim=-1)[0]
    values, indices = probabilities.topk(contract["similarity"]["top_k"])
    candidates = [
        {"id": cache["styles"][index]["id"], "name": cache["styles"][index]["name"], "probability": round(float(value), 6), "cosine_similarity": round(float(similarities[0, index]), 6)}
        for value, index in zip(values, indices)
    ]
    margin = candidates[0]["probability"] - candidates[1]["probability"]
    accepted = candidates[0]["probability"] >= contract["similarity"]["automatic_acceptance_threshold"] and margin >= contract["similarity"]["minimum_margin"]
    print(json.dumps({
        "contract_version": contract["contract_version"], "method": "clip_zero_shot_cosine_v1",
        "model_id": contract["model"]["model_id"], "candidates": candidates, "margin": round(margin, 6),
        "automatic_acceptance": accepted, "requires_human_confirmation": True,
    }, ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["build", "analyze"])
    parser.add_argument("--image")
    args = parser.parse_args()
    if args.command == "build":
        build_cache()
    elif not args.image:
        parser.error("--image is required for analyze")
    else:
        analyze(args.image)
