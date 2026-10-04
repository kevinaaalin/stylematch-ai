import base64
import hashlib
import io
import json
import sys
from pathlib import Path
import torch
from PIL import Image, ImageOps
from transformers import CLIPModel, CLIPProcessor

TRAITS = {
    'color': ['warm neutral colors', 'cool muted colors', 'vivid contrasting colors', 'monochrome colors'],
    'texture': ['smooth texture', 'rough natural texture', 'soft woven texture', 'layered mixed texture'],
    'material': ['wood and natural fibers', 'stone and ceramic', 'glass and metal', 'fabric and leather'],
    'shape': ['rounded organic shapes', 'rectangular shapes', 'angular faceted shapes', 'irregular sculptural shapes'],
    'geometry': ['simple geometric forms', 'complex geometric forms', 'organic flowing forms', 'repeated modular forms'],
    'line': ['straight clean lines', 'curved flowing lines', 'diagonal dynamic lines', 'ornate detailed lines'],
    'pattern': ['plain surfaces without patterns', 'geometric patterns', 'natural grain patterns', 'floral decorative patterns'],
    'proportion': ['slender lightweight proportions', 'balanced conventional proportions', 'thick massive proportions', 'elongated exaggerated proportions'],
    'composition': ['symmetrical composition', 'asymmetrical balanced composition', 'dense layered composition', 'minimal open composition'],
    'lighting': ['bright diffuse daylight', 'warm ambient lighting', 'dramatic directional lighting', 'cool artificial lighting'],
    'surface': ['matte surfaces', 'polished glossy surfaces', 'brushed metallic surfaces', 'transparent translucent surfaces'],
    'detail': ['minimal functional details', 'handcrafted decorative details', 'precise technical details', 'rich ornamental details'],
    'mood': ['calm relaxed mood', 'luxurious formal mood', 'playful energetic mood', 'raw industrial mood'],
    'era': ['contemporary modern design', 'traditional classical design', 'mid century design', 'futuristic design'],
    'semantic': ['natural understated character', 'precise functional character', 'expressive artistic character', 'elegant decorative character'],
}

def main():
    payload = json.load(sys.stdin)
    raw = base64.b64decode(payload['image'].split(',', 1)[1], validate=True)
    Image.MAX_IMAGE_PIXELS = 24000000
    with Image.open(io.BytesIO(raw)) as original:
        if original.width * original.height > 24000000:
            raise ValueError('Image too large')
        image = ImageOps.exif_transpose(original).convert('RGB')
        image.thumbnail((1024, 1024))
    contract = json.loads((Path(__file__).resolve().parent.parent / 'contracts/style-vision-embedding.v1.json').read_text(encoding='utf8'))
    model = CLIPModel.from_pretrained(contract['model']['local_path'], local_files_only=True)
    processor = CLIPProcessor.from_pretrained(contract['model']['local_path'], local_files_only=True, use_fast=False)
    model.eval()
    torch.set_num_threads(4)
    prompts = [f'A design with {value}.' for values in TRAITS.values() for value in values]
    with torch.inference_mode():
        inputs = processor(text=prompts, images=image, return_tensors='pt', padding=True)
        scores = model(**inputs).logits_per_image[0].reshape(len(TRAITS), 4)
    dimensions = {}
    for (key, values), row in zip(TRAITS.items(), scores):
        ranking = torch.softmax(row, dim=0)
        best = int(ranking.argmax())
        dimensions[key] = {'value': values[best], 'confidence': min(0.59, round(float(ranking[best]), 4)),
                           'uncalibrated': True, 'alternatives': [{'value': value, 'score': round(float(score), 4)} for value, score in zip(values, ranking)]}
    digest = hashlib.sha256(raw).hexdigest()
    print(json.dumps({'id': f'image-{digest}', 'source_ref': f'sha256:{digest}',
                      'method': 'local-clip-closed-vocabulary-v1', 'model_id': contract['model']['model_id'],
                      'model_revision': contract['model']['revision'], 'dimensions': dimensions,
                      'requires_human_confirmation': True, 'human_confirmed': False}))

if __name__ == '__main__':
    main()
