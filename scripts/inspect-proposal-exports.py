from pathlib import Path
from pdf2image import convert_from_path
from PIL import Image, ImageDraw
import zipfile
import xml.etree.ElementTree as ET
import json

root = Path(__file__).resolve().parents[1] / 'analysis_output/proposal-office-qa'
expected = json.loads((root/'manifest.json').read_text())['expectedPages']
for label, path in [('docx', root/'docx-render/proposal.pdf'), ('pptx', root/'pptx-render/proposal.pdf'), ('pdf', root/'proposal.pdf')]:
    document = convert_from_path(path, dpi=90)
    assert len(document) == expected, (label, len(document), expected)
    tiles = []
    for number, page in enumerate(document):
        output = root / f'{label}-page-{number+1}.png'
        page.save(output)
        tile = Image.new('RGB', (420, 610), 'white')
        image = Image.open(output)
        image.thumbnail((410, 570))
        tile.paste(image, ((420-image.width)//2, 30))
        ImageDraw.Draw(tile).text((10, 5), f'{label} {number+1}', fill='black')
        tiles.append(tile)
    for offset in range(0, len(tiles), 6):
        sheet = Image.new('RGB', (1260, 1220), '#cccccc')
        for i, tile in enumerate(tiles[offset:offset+6]):
            sheet.paste(tile, ((i%3)*420, (i//3)*610))
        sheet.save(root/f'{label}-contact-{offset//6+1}.png')
    print(label, len(document), 'pages')
with zipfile.ZipFile(root/'proposal.docx') as docx, zipfile.ZipFile(root/'proposal.pptx') as pptx:
    word = ''.join(ET.fromstring(docx.read('word/document.xml')).itertext())
    slides = [name for name in pptx.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
    presentation = ''.join(''.join(ET.fromstring(pptx.read(name)).itertext()) for name in slides)
    for marker in ['export-v1', 'QA-EXPORT', 'DRAFT', '採用圖片']:
        assert marker in word and marker in presentation, marker
    assert len(slides) == expected
print('PASS OOXML version and content markers')
